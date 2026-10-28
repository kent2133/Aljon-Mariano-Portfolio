import { createClient } from "@supabase/supabase-js";
import type { DemoSession } from "./session";
import type { SystemId } from "./systems";

export type AuditEvent = {
  id: string;
  system: SystemId;
  action: string;
  recordId: string | null;
  actorName: string;
  actorRole: string;
  note: string | null;
  createdAt: string;
};

declare global {
  var operationsSuiteEvents: AuditEvent[] | undefined;
}

function fixtureEvents() {
  if (!globalThis.operationsSuiteEvents) globalThis.operationsSuiteEvents = [];
  return globalThis.operationsSuiteEvents;
}

export function cloudPersistenceEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supabase() {
  if (!cloudPersistenceEnabled()) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function listAuditEvents(system: SystemId): Promise<AuditEvent[]> {
  const client = supabase();
  if (!client) return fixtureEvents().filter((event) => event.system === system).slice(-12).reverse();
  const { data, error } = await client
    .from("portfolio_audit_events")
    .select("id, system, action, record_id, actor_name, actor_role, note, created_at")
    .eq("system", system)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) throw error;
  return (data || []).map((event) => ({
    id: event.id,
    system: event.system as SystemId,
    action: event.action,
    recordId: event.record_id,
    actorName: event.actor_name,
    actorRole: event.actor_role,
    note: event.note,
    createdAt: event.created_at,
  }));
}

export async function recordAuditEvent(
  system: SystemId,
  session: DemoSession,
  action: string,
  recordId?: string,
  note?: string,
): Promise<AuditEvent> {
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    system,
    action,
    recordId: recordId || null,
    actorName: session.name,
    actorRole: session.role,
    note: note || null,
    createdAt: new Date().toISOString(),
  };
  const client = supabase();
  if (!client) {
    fixtureEvents().push(event);
    return event;
  }
  const { data, error } = await client
    .from("portfolio_audit_events")
    .insert({
      id: event.id,
      system,
      action,
      record_id: event.recordId,
      actor_name: event.actorName,
      actor_role: event.actorRole,
      note: event.note,
      created_at: event.createdAt,
    })
    .select("id, system, action, record_id, actor_name, actor_role, note, created_at")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    system: data.system as SystemId,
    action: data.action,
    recordId: data.record_id,
    actorName: data.actor_name,
    actorRole: data.actor_role,
    note: data.note,
    createdAt: data.created_at,
  };
}
