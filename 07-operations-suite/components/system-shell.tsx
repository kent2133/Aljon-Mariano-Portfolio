"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import {
  Activity,
  Check,
  ChevronDown,
  ExternalLink,
  Grid2X2,
  HelpCircle,
  Menu,
  MousePointer2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
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

type RoleSelectionOptions = {
  quiet?: boolean;
};

export function SystemShell({ systemId, activeArea = "Overview", children }: ShellProps) {
  const system = getSystemMeta(systemId)!;
  const pathname = usePathname();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);
  const [mode, setMode] = useState<"cloud" | "fixture">("fixture");
  const [busy, setBusy] = useState(false);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [toast, setToast] = useState("");
  const roleSwitcherRef = useRef<HTMLDivElement>(null);
  const roleTriggerRef = useRef<HTMLButtonElement>(null);
  const roleOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tutorialPanelRef = useRef<HTMLElement>(null);
  const tutorialCloseRef = useRef<HTMLButtonElement>(null);
  const tutorialReturnFocusRef = useRef<HTMLElement | null>(null);
  const guideOpenedForRef = useRef<SystemId | null>(null);

  const refreshActivity = useCallback(async () => {
    const response = await fetch(`/api/${systemId}/state`, { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setMode(data.mode === "cloud" ? "cloud" : "fixture");
    setEvents(data.events || []);
  }, [systemId]);

  const selectRole = useCallback(async (role: string, options: RoleSelectionOptions = {}) => {
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
      try {
        window.localStorage.setItem(`operations-suite-role:${systemId}`, role);
      } catch {
        // The signed server session still works when browser storage is unavailable.
      }
      if (!options.quiet) {
        setToast(`Viewing ${system.name} as ${system.roles.find((candidate) => candidate.id === role)?.label}.`);
      }
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not switch roles.");
    } finally {
      setBusy(false);
    }
  }, [system.name, system.roles, systemId]);

  useEffect(() => {
    let cancelled = false;
    setSessionResolved(false);
    setRoleMenuOpen(false);
    setTutorialOpen(false);

    async function initialize() {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;
        let storedRole: string | null = null;
        try {
          storedRole = window.localStorage.getItem(`operations-suite-role:${systemId}`);
        } catch {
          // Fall back to the signed session or the system's first demo role.
        }
        const existingRole = data.session?.system === systemId ? data.session.role : null;
        const preferredRole = [storedRole, existingRole].find((role) => system.roles.some((candidate) => candidate.id === role)) || system.roles[0].id;
        // Always POST so the server issues a fresh signed demo session.
        await selectRole(preferredRole, { quiet: true });
        if (!cancelled) await refreshActivity();
      } catch {
        if (!cancelled) setToast("The demo API is reconnecting. The interface remains available.");
      } finally {
        if (!cancelled) setSessionResolved(true);
      }
    }

    void initialize();
    return () => { cancelled = true; };
  }, [refreshActivity, selectRole, system.roles, systemId]);

  useEffect(() => {
    if (!sessionResolved || guideOpenedForRef.current === systemId) return;
    guideOpenedForRef.current = systemId;
    tutorialReturnFocusRef.current = null;
    setTutorialOpen(true);
  }, [sessionResolved, systemId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!roleMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!roleSwitcherRef.current?.contains(event.target as Node)) setRoleMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [roleMenuOpen]);

  const closeTutorial = useCallback(() => {
    setTutorialOpen(false);
    window.requestAnimationFrame(() => {
      const returnTarget = tutorialReturnFocusRef.current;
      if (returnTarget?.isConnected) returnTarget.focus();
      else roleTriggerRef.current?.focus();
    });
  }, []);

  const openTutorial = useCallback(() => {
    tutorialReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setRoleMenuOpen(false);
    setTutorialOpen(true);
  }, []);

  useEffect(() => {
    if (!tutorialOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => tutorialCloseRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeTutorial();
        return;
      }
      if (event.key !== "Tab" || !tutorialPanelRef.current) return;
      const focusable = Array.from(tutorialPanelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeTutorial, tutorialOpen]);

  useEffect(() => {
    if (tutorialOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (roleMenuOpen) {
        setRoleMenuOpen(false);
        roleTriggerRef.current?.focus();
      } else if (menuOpen) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen, roleMenuOpen, tutorialOpen]);

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
      setToast(`Action accepted - ${action.replaceAll(":", " ")} updated the demo workspace.`);
      return true;
    } catch (error) {
      setToast(error instanceof Error ? error.message : "The workflow action failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [systemId]);

  const context = useMemo(
    () => ({ systemId, session, mode, busy, events, selectRole, runAction }),
    [systemId, session, mode, busy, events, selectRole, runAction],
  );
  const style = { "--accent": system.accent, "--accent-rgb": system.accentRgb } as CSSProperties;
  const currentRole = system.roles.find((role) => role.id === session?.role) || system.roles[0];

  const focusRoleOption = (index: number) => {
    const normalized = (index + system.roles.length) % system.roles.length;
    setRoleMenuOpen(true);
    window.requestAnimationFrame(() => roleOptionRefs.current[normalized]?.focus());
  };

  const handleRoleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const selectedIndex = Math.max(0, system.roles.findIndex((role) => role.id === currentRole.id));
    focusRoleOption(event.key === "ArrowDown" ? selectedIndex : selectedIndex - 1);
  };

  const handleRoleOptionKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusRoleOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusRoleOption(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusRoleOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusRoleOption(system.roles.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setRoleMenuOpen(false);
      roleTriggerRef.current?.focus();
    } else if (event.key === "Tab") {
      setRoleMenuOpen(false);
    }
  };

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
              <div className="role-switcher" ref={roleSwitcherRef}>
                <button
                  ref={roleTriggerRef}
                  type="button"
                  className={`role-control ${roleMenuOpen ? "is-open" : ""}`}
                  aria-label={`Viewing ${system.name} as ${sessionResolved ? currentRole.label : "a loading demo role"}. Change demo role.`}
                  aria-haspopup="listbox"
                  aria-expanded={roleMenuOpen}
                  aria-controls={`role-listbox-${systemId}`}
                  aria-busy={!sessionResolved || busy}
                  disabled={busy || !sessionResolved}
                  onClick={() => setRoleMenuOpen((open) => !open)}
                  onKeyDown={handleRoleTriggerKeyDown}
                >
                  <span className="role-control-label">Viewing as</span>
                  <strong className="role-control-value">{sessionResolved ? currentRole.label : "Loading role…"}</strong>
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
                {roleMenuOpen && (
                  <div className="role-menu">
                    <div className="role-menu-head"><span><Users size={13} /> Demo permissions</span><small>Choose a point of view</small></div>
                    <div id={`role-listbox-${systemId}`} className="role-menu-options" role="listbox" aria-label={`Choose a ${system.name} demo role`}>
                      {system.roles.map((role, index) => (
                        <button
                          ref={(node) => { roleOptionRefs.current[index] = node; }}
                          type="button"
                          role="option"
                          aria-selected={currentRole.id === role.id}
                          className={`role-option ${currentRole.id === role.id ? "is-selected" : ""}`}
                          key={role.id}
                          onClick={() => {
                            setRoleMenuOpen(false);
                            roleTriggerRef.current?.focus();
                            void selectRole(role.id);
                          }}
                          onKeyDown={(event) => handleRoleOptionKeyDown(event, index)}
                        >
                          <span className="role-option-mark">0{index + 1}</span>
                          <span className="role-option-copy"><strong>{role.label}</strong><small>{role.description}</small></span>
                          <Check size={14} aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                    <button type="button" className="role-menu-help" onClick={openTutorial}><HelpCircle size={13} /> How do demo roles work?</button>
                  </div>
                )}
              </div>
              <div className="session-avatar" title={session?.name || "Starting session"}>{session?.name?.split(" ").map((part) => part[0]).slice(0, 2).join("") || "··"}</div>
            </div>
          </header>
          <main className="system-main">{children}</main>
          <footer className="system-footer"><span><ShieldCheck size={14} /> Server-validated demo permissions</span><span>Interactive demo - visible changes are session-only</span></footer>
        </div>

        <button type="button" className="tutorial-launcher" onClick={openTutorial} aria-label={`Open ${system.name} tutorial`}>
          <HelpCircle size={18} aria-hidden="true" /><span>Tutorial</span>
        </button>
        <div className={`app-toast ${toast ? "is-visible" : ""}`} role="status" aria-live="polite">{toast}</div>

        {tutorialOpen && (
          <div className="role-guide-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeTutorial(); }}>
            <section ref={tutorialPanelRef} className="role-guide" role="dialog" aria-modal="true" aria-labelledby={`role-guide-title-${systemId}`} aria-describedby={`role-guide-description-${systemId}`}>
              <div className="role-guide-topbar">
                <span><Sparkles size={13} /> Interactive demo guide</span>
                <button ref={tutorialCloseRef} type="button" onClick={closeTutorial} aria-label="Close tutorial"><X size={18} /></button>
              </div>
              <div className="role-guide-intro">
                <div className="role-guide-index">{system.index}</div>
                <div>
                  <p>{system.eyebrow} / ROLE-BASED WALKTHROUGH</p>
                  <h2 id={`role-guide-title-${systemId}`}>Explore {system.name} from the right point of view.</h2>
                  <p id={`role-guide-description-${systemId}`}>{system.summary} Your role changes which workflow actions the demo will accept. Successful actions update this workspace immediately for the current browser session.</p>
                </div>
              </div>
              <div className="role-guide-current">
                <span className="role-guide-pulse"><i /></span>
                <div><small>You are currently viewing as</small><strong>{currentRole.label}</strong><p>{currentRole.description}.</p></div>
                <span className="role-guide-user">{session?.name || currentRole.name}</span>
              </div>
              <div className="role-guide-section-head"><span>Choose a demo role</span><small>Each role has different permissions</small></div>
              <div className="role-guide-options" role="list" aria-label={`${system.name} available roles`}>
                {system.roles.map((role, index) => (
                  <div role="listitem" key={role.id}>
                    <button type="button" className={currentRole.id === role.id ? "is-selected" : ""} disabled={busy} onClick={() => void selectRole(role.id, { quiet: true })}>
                      <span className="role-guide-option-number">0{index + 1}</span>
                      <strong>{role.label}</strong>
                      <p>{role.description}</p>
                      <span className="role-guide-option-state">{currentRole.id === role.id ? <><Check size={12} /> Selected</> : "Select role"}</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="role-guide-tip"><MousePointer2 size={17} /><p><strong>Change your perspective anytime.</strong> Use the <b>Viewing as</b> menu in the top-right corner, or reopen this guide with the <b>Tutorial</b> button.</p></div>
              <div className="role-guide-actions">
                <span><ShieldCheck size={14} /> Server-validated permissions · Fixture data · No real customer records</span>
                <button type="button" onClick={closeTutorial}>Continue as {currentRole.label} <ChevronDown size={14} /></button>
              </div>
            </section>
          </div>
        )}
      </div>
    </OperationsContext.Provider>
  );
}

export function WorkflowButton({ action, recordId, note, children, className = "", onSuccess }: { action: string; recordId?: string; note?: string; children: ReactNode; className?: string; onSuccess?: () => void }) {
  const { runAction, busy } = useOperations();
  return <button type="button" className={`workflow-button ${className}`} disabled={busy} onClick={async () => { if (await runAction(action, recordId, note)) onSuccess?.(); }}>{children}</button>;
}
