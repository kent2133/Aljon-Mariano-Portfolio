"use client";

import {
  Activity,
  Boxes,
  CircleHelp,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { roleLabels, statusLabels } from "@/lib/repair-data";
import {
  formatDate,
  getWorkspaceMetrics,
  RepairStoreProvider,
  ticketsForRole,
  useRepairStore,
} from "@/lib/repair-store";
import type { CreateTicketInput, RepairRole } from "@/lib/repair-types";
import { CreateTicketDialog } from "./create-ticket-dialog";
import { RoleMenu } from "./role-menu";
import { TicketDetail } from "./ticket-detail";
import { TicketQueue } from "./ticket-queue";
import { WorkspaceGuide } from "./workspace-guide";
import styles from "./workspace.module.css";

const roleIntro: Record<RepairRole, { eyebrow: string; title: string; description: string }> = {
  customer: {
    eyebrow: "Customer care workspace",
    title: "Your repairs, without the guesswork.",
    description: "Submit a device, approve transparent quotes, and follow every workshop update from intake to pickup.",
  },
  technician: {
    eyebrow: "Technician workbench",
    title: "A clear queue for focused repair work.",
    description: "Record diagnostics, prepare quotes, and move approved jobs through a traceable quality workflow.",
  },
  administrator: {
    eyebrow: "Service operations overview",
    title: "Keep every repair moving.",
    description: "Route new work, balance technician capacity, and monitor the service operation from one connected view.",
  },
};

type WorkspaceShellProps = {
  cloudMode?: boolean;
  accountName?: string | null;
};

export function WorkspaceShell({ cloudMode = false, accountName = null }: WorkspaceShellProps) {
  return (
    <RepairStoreProvider>
      <Workspace cloudMode={cloudMode} accountName={accountName} />
    </RepairStoreProvider>
  );
}

function Workspace({ cloudMode, accountName }: Required<Pick<WorkspaceShellProps, "cloudMode">> & Pick<WorkspaceShellProps, "accountName">) {
  const { state, dispatch } = useRepairStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [guideReplay, setGuideReplay] = useState(0);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");

  const roleTickets = useMemo(
    () => ticketsForRole(state).slice().sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [state],
  );
  const visibleActivity = useMemo(() => {
    const ticketIds = new Set(roleTickets.map((ticket) => ticket.id));
    return state.activity.filter((item) => ticketIds.has(item.ticketId));
  }, [roleTickets, state.activity]);
  const filteredTickets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return roleTickets;
    return roleTickets.filter((ticket) =>
      `${ticket.id} ${ticket.device} ${ticket.customerName} ${ticket.issue}`.toLowerCase().includes(normalized),
    );
  }, [query, roleTickets]);
  const selectedTicket = state.tickets.find((ticket) => ticket.id === state.selectedTicketId);
  const metrics = getWorkspaceMetrics(state);
  const intro = roleIntro[state.currentRole];

  function changeRole(role: RepairRole) {
    dispatch({ type: "set-role", role });
    setQuery("");
    showNotice(`Workspace changed to ${roleLabels[role]} view.`);
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice((current) => current === message ? "" : current), 4200);
  }

  function createTicket(input: CreateTicketInput) {
    dispatch({ type: "create-ticket", input });
    setCreateOpen(false);
    showNotice("Repair request created. It is now visible in the service desk queue.");
  }

  function resetDemo() {
    if (!window.confirm("Reset all workspace changes and restore the seeded RepairFlow demo?")) return;
    dispatch({ type: "reset-demo" });
    setQuery("");
    showNotice("The RepairFlow demo has been restored.");
  }

  return (
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="RepairFlow home">
          <span className={styles.brandMark}><Wrench size={18} /></span>
          <span>REPAIRFLOW</span>
        </Link>
        <div className={styles.topbarStatus}>
          <span className={styles.liveDot} /> {cloudMode ? `Cloud account - ${accountName || "signed in"}` : "Browser portfolio mode"}
        </div>
        <div className={styles.topbarActions}>
          <RoleMenu value={state.currentRole} onChange={changeRole} />
          <button type="button" className={styles.avatarButton} aria-label={`${roleLabels[state.currentRole]} profile`}>
            {state.currentRole === "customer" ? "MS" : state.currentRole === "technician" ? "NR" : "AD"}
          </button>
        </div>
      </header>

      <aside className={styles.sidebar} aria-label="Workspace navigation">
        <nav>
          <a href="#overview" className={styles.navActive}><LayoutDashboard size={18} /><span>Overview</span></a>
          <a href="#queue"><ClipboardList size={18} /><span>Tickets</span></a>
          <a href="#activity"><Activity size={18} /><span>Activity</span></a>
          <a href="#inventory"><Boxes size={18} /><span>Inventory</span></a>
          <a href="#team"><UsersRound size={18} /><span>Team</span></a>
        </nav>
        <div className={styles.sidebarBottom}>
          <button type="button" onClick={() => setGuideReplay((value) => value + 1)}><CircleHelp size={18} /><span>Demo guide</span></button>
          <button type="button" onClick={resetDemo}><RefreshCcw size={18} /><span>Reset demo</span></button>
          <Link href={cloudMode ? "/auth/sign-out" : "/"}><LogOut size={18} /><span>{cloudMode ? "Sign out" : "Exit workspace"}</span></Link>
        </div>
      </aside>

      <main className={styles.main}>
        <section id="overview" className={styles.heroRow}>
          <div>
            <p className={styles.eyebrow}>{intro.eyebrow}</p>
            <h1>{intro.title}</h1>
            <p>{intro.description}</p>
          </div>
          <div className={styles.heroActions}>
            {state.currentRole === "customer" ? (
              <button type="button" className={styles.primaryButton} onClick={() => setCreateOpen(true)}>
                <Plus size={17} /> New repair request
              </button>
            ) : null}
            <button type="button" className={styles.secondaryButton} onClick={() => setGuideReplay((value) => value + 1)}>
              <Sparkles size={16} /> Tour this view
            </button>
          </div>
        </section>

        <section className={styles.metricsGrid} aria-label="Workspace metrics">
          {metrics.map((metric) => (
            <article key={metric.label} className={`${styles.metricCard} ${styles[`metric_${metric.tone}`]}`}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </article>
          ))}
        </section>

        <div className={styles.searchRow}>
          <label className={styles.searchBox}>
            <Search size={17} />
            <span className={styles.visuallyHidden}>Search tickets</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ID, device, customer, or issue" />
          </label>
          <span>{filteredTickets.length} visible tickets</span>
        </div>

        <section id="queue" className={styles.workspaceGrid}>
          <TicketQueue
            tickets={filteredTickets}
            selectedId={state.selectedTicketId}
            onSelect={(ticketId) => dispatch({ type: "select-ticket", ticketId })}
          />
          <TicketDetail
            ticket={selectedTicket}
            role={state.currentRole}
            technicians={state.technicians}
            dispatch={dispatch}
            onComplete={showNotice}
          />
        </section>

        <section className={styles.insightGrid}>
          <article id="activity" className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><p className={styles.eyebrow}>Across RepairFlow</p><h2>Recent activity</h2></div>
              <Activity size={19} />
            </div>
            <div className={styles.activityList}>
              {visibleActivity.slice(0, 7).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => dispatch({ type: "select-ticket", ticketId: item.ticketId })}
                >
                  <span className={styles.activityIcon}>{activityIcon(item.kind)}</span>
                  <span><strong>{item.title}</strong><small>{item.ticketId} - {item.actor}</small></span>
                  <time dateTime={item.at}>{formatDate(item.at, true)}</time>
                </button>
              ))}
            </div>
          </article>

          <article id="inventory" className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><p className={styles.eyebrow}>Workshop stock</p><h2>Inventory watch</h2></div>
              <Boxes size={19} />
            </div>
            <div className={styles.inventoryList}>
              {state.inventory.map((item) => {
                const low = item.quantity <= item.reorderAt;
                return (
                  <div key={item.id}>
                    <span className={low ? styles.stockIconLow : styles.stockIcon}><Boxes size={16} /></span>
                    <span><strong>{item.name}</strong><small>{item.category}</small></span>
                    <span className={low ? styles.stockLow : styles.stockGood}>{item.quantity} {item.unit}<small>{low ? "Reorder soon" : "Stock healthy"}</small></span>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <section id="team" className={`${styles.panel} ${styles.teamPanel}`}>
          <div className={styles.panelHeader}>
            <div><p className={styles.eyebrow}>Workshop team</p><h2>Capacity at a glance</h2></div>
            <UsersRound size={19} />
          </div>
          <div className={styles.teamGrid}>
            {state.technicians.map((technician) => (
              <article key={technician.id}>
                <span className={styles.teamAvatar}>{technician.initials}</span>
                <div><strong>{technician.name}</strong><small>{technician.specialty}</small></div>
                <span className={styles.capacity}>
                  <span><i style={{ width: `${Math.min(100, technician.activeTickets / technician.capacity * 100)}%` }} /></span>
                  <small>{technician.activeTickets} of {technician.capacity} active</small>
                </span>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.workspaceFooter}>
          <span><ShieldCheck size={16} /> {cloudMode ? "Supabase identity is active. Portfolio records stay in this browser." : "Portfolio data is stored in this browser."}</span>
          <span><Settings size={16} /> RepairFlow portfolio build 1.0</span>
        </footer>
      </main>

      <button type="button" className={styles.helpButton} onClick={() => setGuideReplay((value) => value + 1)} aria-label="Open workspace guide">
        <CircleHelp size={22} />
      </button>

      <CreateTicketDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createTicket} />
      <WorkspaceGuide replaySignal={guideReplay} />
      <div className={`${styles.toast} ${notice ? styles.toastVisible : ""}`} role="status" aria-live="polite">
        <CheckIcon />
        <span>{notice}</span>
      </div>
    </div>
  );
}

function activityIcon(kind: string) {
  if (kind === "assignment") return <UsersRound size={15} />;
  if (kind === "repair" || kind === "diagnosis") return <Wrench size={15} />;
  if (kind === "approval" || kind === "pickup") return <ShieldCheck size={15} />;
  return <ClipboardList size={15} />;
}

function CheckIcon() {
  return <ShieldCheck size={18} aria-hidden="true" />;
}
