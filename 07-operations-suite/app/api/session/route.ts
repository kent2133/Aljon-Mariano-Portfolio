import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { signSession, verifySession } from "@/lib/session";
import { getSystemMeta, isSystemId } from "@/lib/systems";

const selection = z.object({ system: z.string(), role: z.string() });
const cookieName = "ops_demo_session";

export async function GET() {
  const jar = await cookies();
  return NextResponse.json({ session: verifySession(jar.get(cookieName)?.value) });
}

export async function POST(request: Request) {
  const parsed = selection.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isSystemId(parsed.data.system)) {
    return NextResponse.json({ error: "Choose a valid system and role." }, { status: 400 });
  }
  const system = getSystemMeta(parsed.data.system)!;
  const role = system.roles.find((candidate) => candidate.id === parsed.data.role);
  if (!role) return NextResponse.json({ error: "That demo role is not available." }, { status: 400 });
  const session = {
    system: system.id,
    role: role.id,
    name: role.name,
    email: role.email,
    issuedAt: Date.now(),
  };
  const response = NextResponse.json({ session });
  response.cookies.set(cookieName, signSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ session: null });
  response.cookies.set(cookieName, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
