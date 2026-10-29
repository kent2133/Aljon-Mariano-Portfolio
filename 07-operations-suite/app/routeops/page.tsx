"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { CheckCircle2, Clock3, Map, MapPin, Navigation, Plus, RotateCcw, Route, SlidersHorizontal, Truck, Wrench } from "lucide-react";
import { SystemShell, WorkflowButton, useOperations } from "@/components/system-shell";
import { MetricCard, Panel, StatusBadge } from "@/components/ui";
import styles from "./page.module.css";

type JobStatus = "Unassigned" | "En route" | "On site" | "Complete";
type JobActivity = { id: string; title: string; detail: string };
type Job = {
  id: string;
  customer: string;
  service: string;
  address: string;
  status: JobStatus;
  eta: string;
  technician: string;
  window: string;
  x: number;
  y: number;
  priority: "Standard" | "Urgent";
  notes: number;
  activity: JobActivity[];
};
type RoutePlan = { optimized: boolean; plannedKm: number; avoidedKm: number; onTime: string; delta: string; chart: number[] };

const sessionStateKey = "routeops-demo-state-v2";

function activity(id: string, title: string, detail: string): JobActivity {
  return { id, title, detail };
}

const initialJobs: Job[] = [
  { id: "WO-2048", customer: "Mira Foods", service: "Cold-room sensor fault", address: "Ortigas Center, Pasig", status: "On site", eta: "10:28", technician: "Paolo Diaz", window: "10:00-11:00", x: 63, y: 31, priority: "Urgent", notes: 0, activity: [activity("2048-confirmed", "Work order confirmed", "Today - 08:42"), activity("2048-arrived", "Paolo Diaz arrived on site", "Today - 10:28")] },
  { id: "WO-2049", customer: "Northbank Dental", service: "Network access point", address: "BGC, Taguig", status: "En route", eta: "10:46", technician: "Mika Torres", window: "10:30-12:00", x: 74, y: 62, priority: "Standard", notes: 0, activity: [activity("2049-confirmed", "Work order confirmed", "Today - 08:55"), activity("2049-departed", "Mika Torres started the route", "Today - 10:12")] },
  { id: "WO-2050", customer: "Common Ground", service: "Preventive maintenance", address: "Makati City", status: "Unassigned", eta: "-", technician: "Unassigned", window: "13:00-15:00", x: 46, y: 71, priority: "Standard", notes: 0, activity: [activity("2050-confirmed", "Work order confirmed", "Today - 09:04"), activity("2050-waiting", "Awaiting dispatch", "Today - 09:05")] },
  { id: "WO-2046", customer: "Aster Hotel", service: "Door controller replacement", address: "Mandaluyong City", status: "Complete", eta: "Completed", technician: "Jules Ramos", window: "09:00-10:30", x: 47, y: 42, priority: "Standard", notes: 1, activity: [activity("2046-confirmed", "Work order confirmed", "Today - 07:50"), activity("2046-complete", "Visit completed by Jules Ramos", "Today - 09:52"), activity("2046-proof", "Completion proof captured", "Today - 09:54")] },
  { id: "WO-2051", customer: "Fieldstone Labs", service: "Backup power inspection", address: "Quezon City", status: "Unassigned", eta: "-", technician: "Unassigned", window: "14:00-16:00", x: 29, y: 23, priority: "Urgent", notes: 0, activity: [activity("2051-confirmed", "Work order confirmed", "Today - 09:16"), activity("2051-waiting", "Awaiting dispatch", "Today - 09:17")] },
];

const initialRoutePlan: RoutePlan = { optimized: false, plannedKm: 128, avoidedKm: 19, onTime: "94.2%", delta: "+3.1%", chart: [42, 58, 78, 66, 86, 94, 72, 51] };

const technicianRoster = [
  { name: "Paolo Diaz", initials: "PD", baseLoad: 3, color: "#ffb547" },
  { name: "Mika Torres", initials: "MT", baseLoad: 2, color: "#53d8ff" },
  { name: "Jules Ramos", initials: "JR", baseLoad: 2, color: "#8ee694" },
];

function cloneInitialJobs() {
  return initialJobs.map((job) => ({ ...job, activity: job.activity.map((entry) => ({ ...entry })) }));
}

function timeLabel() {
  return `Today - ${new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}

function RouteOpsDashboard() {
  const { session } = useOperations();
  const [jobs, setJobs] = useState(cloneInitialJobs);
  const [selectedId, setSelectedId] = useState("WO-2048");
  const [view, setView] = useState<"map" | "list">("map");
  const [routePlan, setRoutePlan] = useState(initialRoutePlan);
  const [lastChange, setLastChange] = useState("");
  const [changedId, setChangedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const selected = jobs.find((job) => job.id === selectedId) || jobs[0];
  const role = session?.role ?? "dispatcher";
  const completed = jobs.filter((job) => job.status === "Complete").length;
  const active = jobs.filter((job) => job.status === "En route" || job.status === "On site").length;
  const unassigned = jobs.filter((job) => job.status === "Unassigned").length;
  const grouped = useMemo(() => (["Unassigned", "En route", "On site", "Complete"] as JobStatus[]).map((status) => ({ status, jobs: jobs.filter((job) => job.status === status) })), [jobs]);
  const nextWorkOrderId = `WO-${Math.max(2051, ...jobs.map((job) => Number(job.id.replace("WO-", "")) || 0)) + 1}`;
  const technicians = useMemo(() => technicianRoster.map((tech) => {
    const activeJobs = jobs.filter((job) => job.technician === tech.name && (job.status === "En route" || job.status === "On site"));
    const activeJob = activeJobs[0];
    return {
      ...tech,
      load: tech.baseLoad + activeJobs.length,
      state: activeJob ? (activeJob.status === "On site" ? "On site" : `Driving - ETA ${activeJob.eta}`) : "Available",
      activeJob,
    };
  }), [jobs]);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(sessionStateKey);
      if (stored) {
        const state = JSON.parse(stored) as { jobs?: Job[]; selectedId?: string; view?: "map" | "list"; routePlan?: RoutePlan; lastChange?: string };
        if (Array.isArray(state.jobs) && state.jobs.length && state.jobs.every((job) => Array.isArray(job.activity))) {
          setJobs(state.jobs);
          if (state.selectedId && state.jobs.some((job) => job.id === state.selectedId)) setSelectedId(state.selectedId);
        }
        if (state.view === "map" || state.view === "list") setView(state.view);
        if (state.routePlan) setRoutePlan(state.routePlan);
        if (typeof state.lastChange === "string") setLastChange(state.lastChange);
      }
    } catch {
      window.sessionStorage.removeItem(sessionStateKey);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(sessionStateKey, JSON.stringify({ jobs, selectedId, view, routePlan, lastChange }));
    } catch {
      // The visible demo still works when browser storage is unavailable.
    }
  }, [hydrated, jobs, lastChange, routePlan, selectedId, view]);

  function announceChange(message: string, id?: string) {
    setLastChange(message);
    setChangedId(id || null);
  }

  function appendJobActivity(id: string, title: string, patch: Partial<Job> = {}) {
    const entry = activity(`${id}-${Date.now()}`, title, timeLabel());
    setJobs((current) => current.map((job) => job.id === id ? { ...job, ...patch, activity: [...job.activity, entry] } : job));
  }

  function assignJob(id: string) {
    const job = jobs.find((candidate) => candidate.id === id);
    const wasAssigned = job?.technician && job.technician !== "Unassigned";
    appendJobActivity(id, wasAssigned ? `Reassigned from ${job.technician} to Jules Ramos` : "Assigned to Jules Ramos", { status: "En route", technician: "Jules Ramos", eta: "13:18" });
    announceChange(`${id} moved to En route and Jules Ramos now owns the visit.`, id);
  }

  function markArrived(id: string) {
    appendJobActivity(id, `${session?.name || "Technician"} arrived on site`, { status: "On site", eta: "Arrived" });
    announceChange(`${id} moved from En route to On site.`, id);
  }

  function completeVisit(id: string) {
    const completedAt = timeLabel();
    setJobs((current) => current.map((job) => job.id === id ? {
      ...job,
      status: "Complete",
      eta: "Completed",
      activity: [
        ...job.activity,
        activity(`${id}-complete-${Date.now()}`, `Visit completed by ${session?.name || job.technician}`, completedAt),
        activity(`${id}-proof-${Date.now()}`, "Completion proof captured", completedAt),
      ],
    } : job));
    announceChange(`${id} moved to Complete and its proof was attached.`, id);
  }

  function reviewJob(id: string) {
    appendJobActivity(id, `Work order reviewed by ${session?.name || "Technician"}`);
    announceChange(`${id} review was added to the activity timeline.`, id);
  }

  function addServiceNote(id: string) {
    const entry = activity(`${id}-note-${Date.now()}`, `Service note added by ${session?.name || "Technician"}`, timeLabel());
    setJobs((current) => current.map((job) => job.id === id ? { ...job, notes: job.notes + 1, activity: [...job.activity, entry] } : job));
    announceChange(`${id} now has one more service note in its timeline.`, id);
  }

  function optimizeRoutes() {
    const optimizedPositions: Record<string, { x: number; y: number; eta?: string; window?: string }> = {
      "WO-2048": { x: 59, y: 33, eta: "10:24" },
      "WO-2049": { x: 69, y: 57, eta: "10:38" },
      "WO-2050": { x: 43, y: 67, window: "12:45-14:45" },
      "WO-2051": { x: 34, y: 27, window: "13:40-15:40" },
    };
    const updatedAt = timeLabel();
    setJobs((current) => current.map((job) => {
      if (job.status === "Complete") return job;
      const position = optimizedPositions[job.id] || { x: Math.min(84, job.x + 2), y: Math.max(15, job.y - 2) };
      return { ...job, ...position, activity: [...job.activity, activity(`${job.id}-optimized-${Date.now()}`, "Route sequence optimized", updatedAt)] };
    }));
    setRoutePlan({ optimized: true, plannedKm: 111, avoidedKm: 36, onTime: "96.8%", delta: "+5.7%", chart: [48, 62, 83, 72, 91, 98, 80, 58] });
    announceChange("Routes recalculated - 17 km removed and arrival windows refreshed.");
  }

  function createWorkOrder(id: string) {
    const sequence = Number(id.replace("WO-", ""));
    const templates = [
      { customer: "Harbor Point", service: "Access reader inspection", address: "Pasay City", window: "16:00-17:30", priority: "Standard" as const },
      { customer: "Cedar and Co.", service: "Emergency power check", address: "San Juan City", window: "15:30-17:00", priority: "Urgent" as const },
      { customer: "Westline Clinic", service: "Network cabinet service", address: "Makati City", window: "17:00-18:30", priority: "Standard" as const },
    ];
    const template = templates[sequence % templates.length];
    const createdAt = timeLabel();
    const job: Job = {
      id,
      ...template,
      status: "Unassigned",
      eta: "-",
      technician: "Unassigned",
      x: 22 + ((sequence * 11) % 58),
      y: 18 + ((sequence * 7) % 61),
      notes: 0,
      activity: [activity(`${id}-created`, `Created by ${session?.name || "Dispatcher"}`, createdAt), activity(`${id}-waiting`, "Awaiting dispatch", createdAt)],
    };
    setJobs((current) => [...current, job]);
    setSelectedId(id);
    setView("map");
    announceChange(`${id} was added as an unassigned work order and opened on the map.`, id);
  }

  function resetDemo() {
    setJobs(cloneInitialJobs());
    setSelectedId("WO-2048");
    setView("map");
    setRoutePlan(initialRoutePlan);
    setChangedId(null);
    setLastChange("Starting dispatch data restored.");
  }

  return (
    <>
      <header className="system-header">
        <div><p className="system-eyebrow">05 / FIELD SERVICE CONTROL</p><h1>Every visit,<br /><em>under control.</em></h1><p className="system-header-copy">Dispatch live work, balance technician capacity, and preserve a clear chain of events from assignment to customer proof.</p></div>
        <div className="system-actions"><button aria-pressed={view === "list"} onClick={() => setView(view === "map" ? "list" : "map")}><SlidersHorizontal size={13} /> {view === "map" ? "List view" : "Map view"}</button>{role !== "technician" && <><WorkflowButton action="route:optimize" note="Morning Manila route plan recalculated" onSuccess={optimizeRoutes}>Optimize routes</WorkflowButton><WorkflowButton className="primary" action="job:create" recordId={nextWorkOrderId} note="Created from the dispatch workspace" onSuccess={() => createWorkOrder(nextWorkOrderId)}><Plus size={13} /> New work order</WorkflowButton></>}</div>
      </header>

      {lastChange && <div className={styles.changeNotice} role="status" aria-live="polite"><CheckCircle2 size={18} /><div><strong>Demo data updated</strong><span>{lastChange}</span></div><button type="button" onClick={resetDemo}><RotateCcw size={13} /> Reset demo</button></div>}

      <section className="metric-grid" aria-label="Field service metrics">
        <MetricCard label="Active visits" value={String(active).padStart(2, "0")} delta="Live" detail="Technicians currently driving or working" tone="good" />
        <MetricCard label="On-time arrival" value={routePlan.onTime} delta={routePlan.delta} detail={routePlan.optimized ? "Updated from the optimized route plan" : "Across the last 30 field visits"} tone="good" />
        <MetricCard label="Unassigned" value={String(unassigned).padStart(2, "0")} delta={unassigned ? "Needs action" : "Clear"} detail={`${unassigned} ${unassigned === 1 ? "job remains" : "jobs remain"} inside the service window`} tone={unassigned ? "warn" : "good"} />
        <MetricCard label="First-time fix" value="87%" delta="+5%" detail={`${completed + 14} visits completed this week`} />
      </section>

      {view === "map" ? (
        <div className={styles.mapLayout}>
          <Panel eyebrow="METRO MANILA / LIVE" title="Dispatch map" action={<span className={styles.live}><i></i> 3 technicians online</span>} className={styles.mapPanel}>
            <div className={`${styles.mapCanvas} ${routePlan.optimized ? styles.optimizedMap : ""}`}>
              <div className={styles.mapLabels}><span>QUEZON CITY</span><span>PASIG</span><span>MAKATI</span><span>TAGUIG</span></div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M17 21 C35 30, 31 48, 47 43 S64 24, 64 32 S55 55, 74 62 S62 78, 45 72" /></svg>
              {jobs.map((job) => <button key={job.id} className={`${styles.jobPin} ${selectedId === job.id ? styles.selected : ""} ${changedId === job.id ? styles.changed : ""} ${styles[`pin${job.status.replace(" ", "")}`]}`} style={{ "--x": `${job.x}%`, "--y": `${job.y}%` } as CSSProperties} onClick={() => setSelectedId(job.id)} aria-label={`Open ${job.id}, ${job.customer}`}><MapPin size={15} /><span>{job.id}</span></button>)}
              {technicians.filter((tech) => tech.activeJob).map((tech) => <div key={tech.name} className={styles.technicianDot} style={{ left: `${Math.max(8, (tech.activeJob?.x || 50) - 5)}%`, top: `${Math.min(88, (tech.activeJob?.y || 50) + 8)}%` }}><Navigation size={11} /><span>{tech.name.split(" ")[0]}</span></div>)}
            </div>
          </Panel>

          <aside className={styles.jobDetail}>
            <div className={styles.detailHead}><div><span>{selected.id}</span><StatusBadge tone={selected.status === "Complete" ? "good" : selected.priority === "Urgent" ? "warn" : "info"}>{selected.status}</StatusBadge></div><h2>{selected.customer}</h2><p>{selected.service}</p></div>
            <dl className={styles.jobFacts}><div><dt><MapPin size={13} /> Location</dt><dd>{selected.address}</dd></div><div><dt><Clock3 size={13} /> Service window</dt><dd>{selected.window}</dd></div><div><dt><Wrench size={13} /> Technician</dt><dd>{selected.technician}</dd></div><div><dt><Navigation size={13} /> Expected arrival</dt><dd>{selected.eta}</dd></div></dl>
            <div className={styles.detailTimeline}><p>Activity - {selected.notes} service {selected.notes === 1 ? "note" : "notes"}</p><ol>{selected.activity.slice(-4).map((entry) => <li key={entry.id}><i></i><div><strong>{entry.title}</strong><span>{entry.detail}</span></div></li>)}{selected.status !== "Complete" && <li className={styles.pending}><i></i><div><strong>Completion proof</strong><span>Required before close</span></div></li>}</ol></div>
            <div className={styles.detailActions}>
              {role === "technician" ? <>
                {selected.status === "Unassigned" && <WorkflowButton action="job:view" recordId={selected.id} note="Reviewed an unassigned work order" onSuccess={() => reviewJob(selected.id)}>Review work order</WorkflowButton>}
                {selected.status === "En route" && <WorkflowButton className="primary" action="job:arrive" recordId={selected.id} note="Technician arrived at the customer site" onSuccess={() => markArrived(selected.id)}>Mark arrived</WorkflowButton>}
                {selected.status === "On site" && <WorkflowButton className="primary" action="job:complete" recordId={selected.id} note="Completion proof captured" onSuccess={() => completeVisit(selected.id)}>Complete visit</WorkflowButton>}
                {selected.status === "Complete" && <WorkflowButton action="proof:add" recordId={selected.id} note="Added a completion note" onSuccess={() => addServiceNote(selected.id)}>Add service note</WorkflowButton>}
              </> : role === "administrator" ? <>
                {selected.status === "Unassigned" && <WorkflowButton action="job:assign" recordId={selected.id} note="Assigned from dispatch board" onSuccess={() => assignJob(selected.id)}>Assign Jules</WorkflowButton>}
                {selected.status === "En route" && <WorkflowButton className="primary" action="job:arrive" recordId={selected.id} note="Administrator marked the visit as arrived" onSuccess={() => markArrived(selected.id)}>Mark arrived</WorkflowButton>}
                {selected.status === "On site" && <WorkflowButton className="primary" action="job:complete" recordId={selected.id} note="Administrator completed the visit" onSuccess={() => completeVisit(selected.id)}>Complete visit</WorkflowButton>}
                {selected.status === "Complete" && <WorkflowButton action="proof:add" recordId={selected.id} note="Added a completion note" onSuccess={() => addServiceNote(selected.id)}>Add service note</WorkflowButton>}
                {selected.status !== "Complete" && selected.status !== "Unassigned" && <WorkflowButton action="job:assign" recordId={selected.id} note="Reassigned from dispatch board" onSuccess={() => assignJob(selected.id)}>Reassign Jules</WorkflowButton>}
                <button type="button" className="workflow-button primary" onClick={() => setView("list")}>Open dispatch board</button>
              </> : <>
                {selected.status !== "Complete" && <WorkflowButton action="job:assign" recordId={selected.id} note="Assigned from dispatch board" onSuccess={() => assignJob(selected.id)}>{selected.status === "Unassigned" ? "Assign Jules" : "Reassign Jules"}</WorkflowButton>}
                <button type="button" className="workflow-button primary" onClick={() => setView("list")}>Open dispatch board</button>
              </>}
            </div>
          </aside>
        </div>
      ) : (
        <Panel eyebrow={`TODAY / ${jobs.length} WORK ORDERS`} title="Dispatch board" action={<button className="icon-button" onClick={() => setView("map")} aria-label="Open map"><Map size={15} /></button>}>
          <div className={styles.board}>{grouped.map((group) => <section key={group.status}><header><span>{group.status}</span><b>{group.jobs.length}</b></header>{group.jobs.map((job) => <button key={job.id} className={`${styles.boardCard} ${changedId === job.id ? styles.changed : ""}`} onClick={() => { setSelectedId(job.id); setView("map"); }}><div><span>{job.id}</span>{job.priority === "Urgent" && <i>Urgent</i>}</div><strong>{job.customer}</strong><p>{job.service}</p><small><Clock3 size={11} /> {job.window}</small><small><Truck size={11} /> {job.technician}</small></button>)}</section>)}</div>
        </Panel>
      )}

      <div className={styles.lowerGrid}>
        <Panel eyebrow="FIELD CAPACITY" title="Technician workload"><div className={styles.techList}>{technicians.map((tech) => <article key={tech.name}><span className="avatar" style={{ background: tech.color }}>{tech.initials}</span><div><strong>{tech.name}</strong><small>{tech.state}</small></div><b>{tech.load} jobs</b><i><span style={{ width: `${Math.min(100, tech.load * 18)}%`, background: tech.color }}></span></i></article>)}</div></Panel>
        <Panel eyebrow="SERVICE HEALTH" title="Today's operating window"><div className={styles.windowChart}><div className={styles.chartBars}>{routePlan.chart.map((height, index) => <i key={index} style={{ height: `${height}%` }}></i>)}</div><div><span>08:00</span><span>12:00</span><span>16:00</span></div><p><Route size={14} /> {routePlan.plannedKm} km planned - {routePlan.avoidedKm} km avoided after optimization</p></div></Panel>
      </div>
    </>
  );
}

export default function RouteOpsPage() {
  return <SystemShell systemId="routeops" activeArea="Dispatch"><RouteOpsDashboard /></SystemShell>;
}
