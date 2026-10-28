"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Activity, ChevronDown, ExternalLink, Grid2X2, Menu, ShieldCheck, X } from "lucide-react";
import type { DemoSession } from "@/lib/session";
import { getSystemMeta, systemCatalog, type SystemId } from "@/lib/systems";
import type { AuditEvent } from "@/lib/store";

type OperationsContextValue = {
  systemId: SystemId;
  session: DemoSession | null;
  mode: "cloud" | "fixture";
  busy: boolean;
  events: AuditEvent[];
  selectRole: (role: string) => Promise<void>;
  runAction: (action: string, recordId?: string, note?: string) => Promise<boolean>;
};

const OperationsContext = createContext<OperationsContextValue | null>(null);

export function useOperations() {
  const value = useContext(OperationsContext);
  if (!value) throw new Error("useOperations must be used inside SystemShell");
  return value;
}

type ShellProps = {
  systemId: SystemId;
  activeArea?: string;
  children: ReactNode;
};

export function SystemShell({ systemId, activeArea = "Overview", children }: ShellProps) {
  const system = getSystemMeta(systemId)!;
  const pathname = usePathname();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [mode, setMode] = useState<"cloud" | "fixture">("fixture");
  const [busy, setBusy] = useState(false);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  const refreshActivity = useCallback(async () => {
    const response = await fetch(`/api/${systemId}/state`, { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setMode(data.mode === "cloud" ? "cloud" : "fixture");
    setEvents(data.events || []);
  }, [systemId]);

  const selectRole = useCallback(async (role: string) => {
    setBusy(true);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: systemId, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start the demo session.");
      setSession(data.session);
      setToast(`Viewing ${system.name} as ${system.roles.find((candidate) => candidate.id === role)?.label}.`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not switch roles.");
    } finally {
      setBusy(false);
    }
  }, [system.id, system.name, system.roles, systemId]);

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;
        if (data.session?.system === systemId) setSession(data.session);
        else await selectRole(system.roles[0].id);
        await refreshActivity();
      } catch {
        if (!cancelled) setToast("The demo API is reconnecting. The interface remains available.");
      }
    }
    initialize();
    return () => { cancelled = true; };
  }, [refreshActivity, selectRole, system.roles, systemId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const runAction = useCallback(async (action: string, recordId?: string, note?: string) => {
    setBusy(true);
    try {
      const response = await fetch(`/api/${systemId}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, recordId, note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The workflow action was not accepted.");
      setEvents((current) => [data.event, ...current].slice(0, 12));
      setMode(data.mode === "cloud" ? "cloud" : "fixture");
      setToast(`${action.replaceAll(":", " ")} recorded successfully.`);
      return true;
    } catch (error) {
      setToast(error instanceof Error ? error.message : "The workflow action failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [systemId]);

  const context = useMemo(() => ({ systemId, session, mode, busy, events, selectRole, runAction }), [systemId, session, mode, busy, events, selectRole, runAction]);
  const style = { "--accent": system.accent, "--accent-rgb": system.accentRgb } as CSSProperties;

  return (
    <OperationsContext.Provider value={context}>
      <div className="app-shell" style={style} data-system={systemId}>
        <aside className={`app-sidebar ${menuOpen ? "is-open" : ""}`} aria-label="Operations Suite navigation">
          <div className="sidebar-brand">
            <Link href="/" className="suite-mark" aria-label="Operations Suite home">OS</Link>
            <div><strong>Operations Suite</strong><span>Five working systems</span></div>
            <button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={18} /></button>
          </div>
          <nav className="suite-navigation">
            <Link href="/" className={pathname === "/" ? "is-active" : ""} aria-current={pathname === "/" ? "page" : undefined}><Grid2X2 size={16} /><span>Suite overview</span></Link>
            <p>Business systems</p>
            {systemCatalog.map((item) => (
              <Link key={item.id} href={item.href} className={pathname.startsWith(item.href) ? "is-active" : ""} aria-current={pathname.startsWith(item.href) ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                <i style={{ background: item.accent }}>{item.glyph}</i>
                <span>{item.name}<small>{item.descriptor}</small></span>
                <b>{item.index}</b>
              </Link>
            ))}
          </nav>
          <div className="sidebar-foot">
            <div className="runtime-state"><span className={mode === "cloud" ? "is-cloud" : ""}></span><div><strong>{mode === "cloud" ? "Cloud persistence" : "Portfolio fixture mode"}</strong><small>{mode === "cloud" ? "Supabase Postgres connected" : "API-backed · safe demo data"}</small></div></div>
            <a href="https://aljon-mariano-contact.vercel.app/#systems" target="_blank" rel="noreferrer">Portfolio hub <ExternalLink size={13} /></a>
          </div>
        </aside>
        <button className={`sidebar-scrim ${menuOpen ? "is-visible" : ""}`} onClick={() => setMenuOpen(false)} aria-label="Close navigation overlay" />
        <div className="app-workspace">
          <header className="app-topbar">
            <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
            <div className="topbar-context"><span>{system.eyebrow}</span><strong>{system.name} / {activeArea}</strong></div>
            <div className="topbar-tools">
              <div className="api-indicator"><Activity size={14} /><span>API live</span></div>
              <label className="role-control">
                <span>Demo role</span>
                <select aria-label={`Demo role for ${system.name}`} value={session?.role || system.roles[0].id} onChange={(event) => selectRole(event.target.value)} disabled={busy}>
                  {system.roles.map((role) => <option value={role.id} key={role.id}>{role.label}</option>)}
                </select>
                <ChevronDown size={14} aria-hidden="true" />
              </label>
              <div className="session-avatar" title={session?.name || "Starting session"}>{session?.name?.split(" ").map((part) => part[0]).slice(0, 2).join("") || "··"}</div>
            </div>
          </header>
          <main className="system-main">{children}</main>
          <footer className="system-footer"><span><ShieldCheck size={14} /> Server-validated demo permissions</span><span>Illustrative data · No real customer records</span></footer>
        </div>
        <div className={`app-toast ${toast ? "is-visible" : ""}`} role="status" aria-live="polite">{toast}</div>
      </div>
    </OperationsContext.Provider>
  );
}

export function WorkflowButton({ action, recordId, note, children, className = "", onSuccess }: { action: string; recordId?: string; note?: string; children: ReactNode; className?: string; onSuccess?: () => void }) {
  const { runAction, busy } = useOperations();
  return <button type="button" className={`workflow-button ${className}`} disabled={busy} onClick={async () => { if (await runAction(action, recordId, note)) onSuccess?.(); }}>{children}</button>;
}
