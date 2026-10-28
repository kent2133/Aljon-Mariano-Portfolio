import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { can } from "@/lib/rbac";
import { verifySession } from "@/lib/session";
import { cloudPersistenceEnabled, listAuditEvents, recordAuditEvent } from "@/lib/store";
import { isSystemId } from "@/lib/systems";

const actionSchema = z.object({
  action: z.string().min(3).max(80),
  recordId: z.string().max(100).optional(),
  note: z.string().max(240).optional(),
});

type Context = { params: Promise<{ system: string }> };

export async function GET(_request: Request, context: Context) {
  const { system } = await context.params;
  if (!isSystemId(system)) return NextResponse.json({ error: "Unknown system." }, { status: 404 });
  return NextResponse.json({
    mode: cloudPersistenceEnabled() ? "cloud" : "fixture",
    events: await listAuditEvents(system),
  });
}

export async function POST(request: Request, context: Context) {
  const { system } = await context.params;
  if (!isSystemId(system)) return NextResponse.json({ error: "Unknown system." }, { status: 404 });
  const jar = await cookies();
  const session = verifySession(jar.get("ops_demo_session")?.value);
  if (!session || session.system !== system) {
    return NextResponse.json({ error: "Select a demo role for this system first." }, { status: 401 });
  }
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "The action payload was invalid." }, { status: 400 });
  if (!can(system, session.role, parsed.data.action)) {
    return NextResponse.json({ error: `${session.role} cannot perform ${parsed.data.action}.` }, { status: 403 });
  }
  const event = await recordAuditEvent(system, session, parsed.data.action, parsed.data.recordId, parsed.data.note);
  return NextResponse.json({ ok: true, event, mode: cloudPersistenceEnabled() ? "cloud" : "fixture" });
}
