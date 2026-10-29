"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  Clock3,
  Laptop,
  ListFilter,
  MessageSquareText,
  Plus,
  Search,
  ShieldCheck,
  TicketCheck,
  UserRoundCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import { SystemShell, WorkflowButton, useOperations } from "@/components/system-shell";
import { MetricCard, Panel, ProgressBar, StatusBadge } from "@/components/ui";
import styles from "./page.module.css";

type DeskView = "command" | "tickets" | "assets";
type TicketStatus = "New" | "Assigned" | "Waiting" | "Escalated" | "Resolved";

type Ticket = {
  id: string;
  title: string;
  requester: string;
  team: string;
  priority: "P1" | "P2" | "P3";
  status: TicketStatus;
  sla: number;
  due: string;
  assignee: string;
  channel: string;
  updated: string;
};

const tickets: Ticket[] = [
  { id: "INC-2048", title: "Finance VPN drops every 10 minutes", requester: "Mara Santos", team: "Finance", priority: "P1", status: "Escalated", sla: 18, due: "18 min", assignee: "Aljon M.", channel: "Portal", updated: "4 min ago" },
  { id: "INC-2051", title: "Shared drive unavailable on Level 4", requester: "Celine Yu", team: "Operations", priority: "P1", status: "Assigned", sla: 42, due: "42 min", assignee: "Bea R.", channel: "Teams", updated: "8 min ago" },
  { id: "SR-1182", title: "Provision Figma seat for product team", requester: "Theo Cruz", team: "Product", priority: "P3", status: "Waiting", sla: 74, due: "5h 12m", assignee: "Nina S.", channel: "Email", updated: "21 min ago" },
  { id: "INC-2043", title: "Warehouse printer is producing blank labels", requester: "Nico Reyes", team: "Warehouse", priority: "P2", status: "Assigned", sla: 61, due: "1h 46m", assignee: "Aljon M.", channel: "Portal", updated: "34 min ago" },
  { id: "SR-1179", title: "New starter laptop and access bundle", requester: "Aya Lim", team: "Procurement", priority: "P2", status: "New", sla: 86, due: "7h 30m", assignee: "Unassigned", channel: "Portal", updated: "47 min ago" },
  { id: "INC-2037", title: "Outlook search returns incomplete results", requester: "Jose Alba", team: "Sales", priority: "P3", status: "Resolved", sla: 100, due: "Met", assignee: "Bea R.", channel: "Phone", updated: "1h ago" },
];

const assets = [
  { tag: "NS-LT-0842", name: "MacBook Pro 14\"", owner: "Mara Santos", team: "Finance", health: 92, state: "Compliant", detail: "Warranty · 18 months", checked: "7 min ago" },
  { tag: "NS-LT-0761", name: "ThinkPad X1 Carbon", owner: "Theo Cruz", team: "Product", health: 64, state: "Attention", detail: "Battery service due", checked: "24 min ago" },
  { tag: "NS-WS-0318", name: "Dell Precision 3660", owner: "Celine Yu", team: "Operations", health: 88, state: "Compliant", detail: "Patched · 28 Oct", checked: "31 min ago" },
  { tag: "NS-PR-0124", name: "Zebra ZT411", owner: "Warehouse 04", team: "Warehouse", health: 38, state: "Incident open", detail: "Linked to INC-2043", checked: "34 min ago" },
  { tag: "NS-LT-0899", name: "Surface Laptop 6", owner: "Aya Lim", team: "Procurement", health: 78, state: "Review", detail: "Encryption sync pending", checked: "52 min ago" },
  { tag: "NS-MB-0027", name: "iPhone 16", owner: "Jose Alba", team: "Sales", health: 96, state: "Compliant", detail: "Managed · Online", checked: "1h ago" },
];

const technicians = [
  { name: "Aljon Mariano", initials: "AM", active: 5, capacity: 76, focus: "Network / hardware", status: "At capacity" },
  { name: "Bea Ramos", initials: "BR", active: 4, capacity: 58, focus: "Identity / workplace", status: "Available" },
  { name: "Nina Sy", initials: "NS", active: 3, capacity: 43, focus: "Apps / onboarding", status: "Available" },
  { name: "Marco Ong", initials: "MO", active: 2, capacity: 31, focus: "Field support", status: "On site" },
];

const navigation: { id: DeskView; label: string; count?: number }[] = [
  { id: "command", label: "Command center" },
  { id: "tickets", label: "Ticket queue", count: 24 },
  { id: "assets", label: "Asset estate", count: 318 },
];

function toneForTicket(status: TicketStatus) {
  if (status === "Resolved") return "good" as const;
  if (status === "Escalated") return "danger" as const;
  if (status === "Waiting") return "warn" as const;
  if (status === "Assigned") return "info" as const;
  return "neutral" as const;
}

function PulseDeskWorkspace() {
  const { session, events } = useOperations();
  const [view, setView] = useState<DeskView>("command");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<"All" | Ticket["priority"]>("All");
  const [selectedId, setSelectedId] = useState("INC-2048");
  const [createdTickets, setCreatedTickets] = useState<Ticket[]>([]);
  const [ticketUpdates, setTicketUpdates] = useState<Record<string, Partial<Ticket>>>({});
  const [followUps, setFollowUps] = useState<Record<string, number>>({});
  const [assetActivity, setAssetActivity] = useState<Record<string, string>>({});

  const role = session?.role || "requester";
  const allTickets = useMemo(() => [...createdTickets, ...tickets]
    .map((ticket) => ({ ...ticket, ...ticketUpdates[ticket.id] })), [createdTickets, ticketUpdates]);
  const visibleTickets = useMemo(() => allTickets
    .filter((ticket) => priority === "All" || ticket.priority === priority)
    .filter((ticket) => `${ticket.id} ${ticket.title} ${ticket.requester} ${ticket.team}`.toLowerCase().includes(query.toLowerCase())), [allTickets, priority, query]);
  const selected = allTickets.find((ticket) => ticket.id === selectedId) || allTickets[0];
  const selectedStatus = selected.status;
  const createdCount = createdTickets.length;
  const resolvedInSession = Object.entries(ticketUpdates).filter(([id, update]) => update.status === "Resolved" && tickets.find((ticket) => ticket.id === id)?.status !== "Resolved").length;
  const openTicketCount = 24 + createdCount - resolvedInSession;
  const nextTicketId = `REQ-DEMO-${String(createdCount + 1).padStart(3, "0")}`;
  const selectedFollowUps = followUps[selected.id] || 0;
  const canWorkTickets = role === "technician" || role === "administrator";

  const primaryAction = selectedStatus === "New" ? "ticket:assign" : selectedStatus === "Resolved" ? "ticket:comment" : "ticket:resolve";
  const primaryLabel = selectedStatus === "New" ? "Assign to me" : selectedStatus === "Resolved" ? "Add follow-up" : "Resolve ticket";

  return (
    <>
      <header className="system-header">
        <div>
          <p className="system-eyebrow">Live service operations · Tuesday, 28 October</p>
          <h1>Keep work moving <em>before the clock turns red.</em></h1>
          <p className="system-header-copy">One operational view for requests, service levels, technician capacity, and every device entrusted to the IT team.</p>
        </div>
        <div className="system-actions">
          <button onClick={() => setView("tickets")}><ListFilter size={14} /> Review queue</button>
          <WorkflowButton action="ticket:create" recordId={nextTicketId} note="Created from the PulseDesk portfolio demo" className="primary" onSuccess={() => {
            const newTicket: Ticket = {
              id: nextTicketId,
              title: "Demo support request",
              requester: session?.name || "Demo requester",
              team: "Portfolio demo",
              priority: "P3",
              status: "New",
              sla: 92,
              due: "8h 00m",
              assignee: "Unassigned",
              channel: "Portal",
              updated: "Just now",
            };
            setCreatedTickets((current) => [newTicket, ...current]);
            setSelectedId(nextTicketId);
            setPriority("All");
            setQuery("");
            setView("tickets");
          }}><Plus size={14} /> New request</WorkflowButton>
        </div>
      </header>

      <nav className={styles.viewNav} aria-label="PulseDesk sections">
        {navigation.map((item) => <button key={item.id} aria-pressed={view === item.id} className={view === item.id ? styles.active : ""} onClick={() => setView(item.id)}><span>{item.label}</span>{item.count && <b>{item.id === "tickets" ? openTicketCount : item.count}</b>}</button>)}
      </nav>

      {view === "command" && (
        <div className={styles.viewStack}>
          <section className="metric-grid" aria-label="Current service metrics">
            <MetricCard label="Open tickets" value={`${openTicketCount}`} delta="-8%" detail="Across incidents and requests" tone="good" />
            <MetricCard label="SLA at risk" value="03" delta="Next · 18m" detail="Two incidents, one request" tone="warn" />
            <MetricCard label="First response" value="12m" delta="-3m" detail="Rolling seven-day median" tone="good" />
            <MetricCard label="Asset compliance" value="94.7%" delta="+1.2%" detail="301 of 318 managed assets" tone="good" />
          </section>

          <div className="dashboard-grid">
            <Panel eyebrow="Priority desk" title="Service-level pressure" action={<button className="icon-button" onClick={() => setView("tickets")} aria-label="Open ticket queue"><ChevronRight size={15} /></button>}>
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Ticket</th><th>Priority</th><th>Owner</th><th>SLA remaining</th><th>Status</th></tr></thead>
                  <tbody>{allTickets.slice(0, 5).map((ticket) => {
                    const status = ticket.status;
                    return <tr key={ticket.id} tabIndex={0} aria-label={`Open ${ticket.id}: ${ticket.title}`} onClick={() => { setSelectedId(ticket.id); setView("tickets"); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedId(ticket.id); setView("tickets"); } }} className={styles.clickableRow}>
                      <td><strong>{ticket.title}</strong><small>{ticket.id} · {ticket.team}</small></td>
                      <td><span className={`${styles.priority} ${styles[`priority${ticket.priority}`]}`}>{ticket.priority}</span></td>
                      <td><strong>{ticket.assignee}</strong><small>{ticket.updated}</small></td>
                      <td><div className={styles.slaCell}><strong>{ticket.due}</strong><ProgressBar value={ticket.sla} /></div></td>
                      <td><StatusBadge tone={toneForTicket(status)}>{status}</StatusBadge></td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
            </Panel>

            <div className={styles.sideStack}>
              <Panel eyebrow="Shift intelligence" title="Technician workload">
                <div className={styles.workloadList}>{technicians.map((technician) => <article key={technician.name} className={styles.workloadItem}>
                  <div className="avatar">{technician.initials}</div>
                  <div><strong>{technician.name}</strong><span>{technician.focus}</span><ProgressBar value={technician.capacity} /></div>
                  <div><b>{technician.active}</b><span>active</span></div>
                </article>)}</div>
              </Panel>
              <Panel eyebrow="Control room" title="Today at a glance">
                <div className={styles.signalGrid}>
                  <div><TicketCheck size={18} /><strong>18</strong><span>resolved today</span></div>
                  <div><MessageSquareText size={18} /><strong>4.8</strong><span>CSAT average</span></div>
                  <div><UsersRound size={18} /><strong>07</strong><span>agents online</span></div>
                  <div><ShieldCheck size={18} /><strong>99.1%</strong><span>SLA achieved</span></div>
                </div>
              </Panel>
            </div>
          </div>

          <div className="dashboard-grid equal">
            <Panel eyebrow="Estate watch" title="Assets requiring attention" action={<button className={styles.textButton} onClick={() => setView("assets")}>View estate <ChevronRight size={13} /></button>}>
              <div className={styles.assetStrip}>{assets.filter((asset) => asset.health < 80).map((asset) => <article key={asset.tag}>
                <div className={styles.assetIcon}><Laptop size={18} /></div><div><strong>{asset.name}</strong><span>{asset.tag} · {asset.owner}</span><ProgressBar value={asset.health} label={`Health · ${asset.state}`} /></div>
              </article>)}</div>
            </Panel>
            <Panel eyebrow="Audit stream" title="Recorded workflow activity">
              <div className={styles.activityList}>
                {events.length ? events.slice(0, 4).map((event) => <article key={event.id}><Activity size={14} /><div><strong>{event.action.replaceAll(":", " ")}</strong><span>{event.actorName} · {event.actorRole}</span></div><time>{new Date(event.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></article>) : <div className={styles.activityEmpty}><CircleGauge size={20} /><div><strong>No demo actions yet</strong><span>Use a workflow button to record a server-validated event.</span></div></div>}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {view === "tickets" && (
        <div className={styles.viewStack}>
          <div className={styles.queueToolbar}>
            <label className={styles.searchField}><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tickets, people, or teams" aria-label="Search tickets, people, or teams" /></label>
            <div className={styles.filterGroup} aria-label="Filter tickets by priority">{(["All", "P1", "P2", "P3"] as const).map((item) => <button key={item} aria-pressed={priority === item} className={priority === item ? styles.active : ""} onClick={() => setPriority(item)}>{item}</button>)}</div>
            <span className={styles.resultCount}>{visibleTickets.length} of {allTickets.length} records</span>
          </div>
          <div className={styles.ticketWorkspace}>
            <Panel eyebrow="Live queue" title="Incidents and requests" className={styles.queuePanel}>
              <div className={styles.ticketList}>
                {visibleTickets.map((ticket) => <button key={ticket.id} className={`${styles.ticketRow} ${selectedId === ticket.id ? styles.selected : ""}`} onClick={() => setSelectedId(ticket.id)}>
                  <span className={`${styles.priority} ${styles[`priority${ticket.priority}`]}`}>{ticket.priority}</span>
                  <div><strong>{ticket.title}</strong><span>{ticket.id} · {ticket.requester} · {ticket.team}</span></div>
                  <div className={styles.ticketMeta}><StatusBadge tone={toneForTicket(ticket.status)}>{ticket.status}</StatusBadge><span><Clock3 size={12} /> {ticket.due}</span></div>
                  <ChevronRight size={15} />
                </button>)}
                {!visibleTickets.length && <div className={styles.noResults}><Search size={22} /><strong>No matching tickets</strong><span>Try a broader search or another priority.</span></div>}
              </div>
            </Panel>

            <aside className={styles.ticketDetail} aria-live="polite">
              <div className={styles.detailTop}><span className={`${styles.priority} ${styles[`priority${selected.priority}`]}`}>{selected.priority}</span><StatusBadge tone={toneForTicket(selectedStatus)}>{selectedStatus}</StatusBadge></div>
              <p>{selected.id} · {selected.channel}</p>
              <h2>{selected.title}</h2>
              <div className={styles.slaCard}><div><CircleGauge size={18} /><span>SLA remaining</span><strong>{selected.due}</strong></div><ProgressBar value={selected.sla} /></div>
              <dl className={styles.detailList}>
                <div><dt>Requester</dt><dd>{selected.requester}</dd></div>
                <div><dt>Business team</dt><dd>{selected.team}</dd></div>
                <div><dt>Assigned to</dt><dd>{selected.assignee}</dd></div>
                <div><dt>Last update</dt><dd>{selected.updated}</dd></div>
              </dl>
              <div className={styles.timeline}>
                {selectedFollowUps > 0 && <p><i></i><span><strong>Follow-up added just now</strong>{selectedFollowUps} session follow-up{selectedFollowUps === 1 ? "" : "s"} recorded on this request.</span></p>}
                <p><i></i><span><strong>Latest signal</strong>Automated monitoring attached device and network diagnostics.</span></p>
                <p><i></i><span><strong>Requester update</strong>The issue is affecting a time-sensitive team workflow.</span></p>
                <p><i></i><span><strong>Intake</strong>Request created through {selected.channel.toLowerCase()}.</span></p>
              </div>
              {canWorkTickets ? <WorkflowButton action={primaryAction} recordId={selected.id} note={`${primaryLabel} from ticket workspace`} className="primary" onSuccess={() => {
                if (primaryAction === "ticket:comment") {
                  setFollowUps((current) => ({ ...current, [selected.id]: (current[selected.id] || 0) + 1 }));
                  return;
                }
                setTicketUpdates((current) => ({
                  ...current,
                  [selected.id]: {
                    ...current[selected.id],
                    status: primaryAction === "ticket:assign" ? "Assigned" : "Resolved",
                    assignee: primaryAction === "ticket:assign" ? (session?.name || "Current technician") : selected.assignee,
                    due: primaryAction === "ticket:resolve" ? "Met" : selected.due,
                    updated: "Just now",
                  },
                }));
              }}>{primaryAction === "ticket:assign" ? <UserRoundCheck size={14} /> : primaryAction === "ticket:comment" ? <MessageSquareText size={14} /> : <CheckCircle2 size={14} />} {primaryLabel}</WorkflowButton> : <WorkflowButton action="ticket:comment" recordId={selected.id} note="Requester added a follow-up from the portfolio demo" onSuccess={() => setFollowUps((current) => ({ ...current, [selected.id]: (current[selected.id] || 0) + 1 }))}><MessageSquareText size={14} /> Add follow-up</WorkflowButton>}
              <p className={styles.permissionNote}>Action adapts to the selected demo role and is checked by the server.</p>
            </aside>
          </div>
        </div>
      )}

      {view === "assets" && (
        <div className={styles.viewStack}>
          <div className={styles.assetHeader}>
            <div><span>Managed estate</span><strong>318 assets · 17 need attention</strong></div>
            <label className={styles.searchField}><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search asset or owner" aria-label="Search asset or owner" /></label>
          </div>
          <div className={styles.assetGrid}>{assets.filter((asset) => `${asset.tag} ${asset.name} ${asset.owner} ${asset.team}`.toLowerCase().includes(query.toLowerCase())).map((asset) => <article className={styles.assetCard} key={asset.tag}>
            <header><div className={styles.assetIcon}><Laptop size={20} /></div><StatusBadge tone={asset.health > 85 ? "good" : asset.health > 60 ? "warn" : "danger"}>{asset.state}</StatusBadge></header>
            <p>{asset.tag}</p><h2>{asset.name}</h2><span>{asset.owner} · {asset.team}</span>
            <div className={styles.health}><ProgressBar value={asset.health} label="Device health" /></div>
            <footer><div><Wrench size={13} /><span>{asset.detail}</span></div><small aria-live="polite">{assetActivity[asset.tag] || `Checked ${asset.checked}`}</small></footer>
            {role !== "requester" && <WorkflowButton action={role === "administrator" ? "asset:manage" : "asset:view"} recordId={asset.tag} note={role === "administrator" ? "Opened asset maintenance controls" : "Opened asset record"} onSuccess={() => setAssetActivity((current) => ({ ...current, [asset.tag]: role === "administrator" ? "Maintenance controls ready - opened just now" : "Asset record inspected just now" }))}>{assetActivity[asset.tag] ? (role === "administrator" ? "Controls ready" : "Record inspected") : (role === "administrator" ? "Open controls" : "Inspect record")} <ChevronRight size={13} /></WorkflowButton>}
          </article>)}</div>
          {role === "requester" && <div className={styles.roleBanner}><AlertTriangle size={16} /><div><strong>Asset details are protected</strong><span>Switch to Technician or Administrator to inspect managed-device records.</span></div></div>}
        </div>
      )}
    </>
  );
}

export default function PulseDeskPage() {
  return <SystemShell systemId="pulsedesk" activeArea="Service command center"><PulseDeskWorkspace /></SystemShell>;
}
