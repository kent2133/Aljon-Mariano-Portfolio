"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Clock3, List, Map, MapPin, Navigation, Plus, Route, SlidersHorizontal, Truck, Wrench } from "lucide-react";
import { SystemShell, WorkflowButton, useOperations } from "@/components/system-shell";
import { MetricCard, Panel, StatusBadge } from "@/components/ui";
import styles from "./page.module.css";

type JobStatus = "Unassigned" | "En route" | "On site" | "Complete";
type Job = { id: string; customer: string; service: string; address: string; status: JobStatus; eta: string; technician: string; window: string; x: number; y: number; priority: "Standard" | "Urgent" };

const initialJobs: Job[] = [
  { id: "WO-2048", customer: "Mira Foods", service: "Cold-room sensor fault", address: "Ortigas Center, Pasig", status: "On site", eta: "10:28", technician: "Paolo Diaz", window: "10:00-11:00", x: 63, y: 31, priority: "Urgent" },
  { id: "WO-2049", customer: "Northbank Dental", service: "Network access point", address: "BGC, Taguig", status: "En route", eta: "10:46", technician: "Mika Torres", window: "10:30-12:00", x: 74, y: 62, priority: "Standard" },
  { id: "WO-2050", customer: "Common Ground", service: "Preventive maintenance", address: "Makati City", status: "Unassigned", eta: "-", technician: "Unassigned", window: "13:00-15:00", x: 46, y: 71, priority: "Standard" },
  { id: "WO-2046", customer: "Aster Hotel", service: "Door controller replacement", address: "Mandaluyong City", status: "Complete", eta: "09:52", technician: "Jules Ramos", window: "09:00-10:30", x: 47, y: 42, priority: "Standard" },
  { id: "WO-2051", customer: "Fieldstone Labs", service: "Backup power inspection", address: "Quezon City", status: "Unassigned", eta: "-", technician: "Unassigned", window: "14:00-16:00", x: 29, y: 23, priority: "Urgent" },
];

const technicians = [
  { name: "Paolo Diaz", initials: "PD", state: "On site", load: 4, color: "#ffb547" },
  { name: "Mika Torres", initials: "MT", state: "Driving · 12 min", load: 3, color: "#53d8ff" },
  { name: "Jules Ramos", initials: "JR", state: "Available", load: 2, color: "#8ee694" },
];

function RouteOpsDashboard() {
  const { session } = useOperations();
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedId, setSelectedId] = useState("WO-2048");
  const [view, setView] = useState<"map" | "list">("map");
  const selected = jobs.find((job) => job.id === selectedId) || jobs[0];
  const role = session?.role ?? "dispatcher";
  const completed = jobs.filter((job) => job.status === "Complete").length;
  const active = jobs.filter((job) => job.status === "En route" || job.status === "On site").length;
  const grouped = useMemo(() => (["Unassigned", "En route", "On site", "Complete"] as JobStatus[]).map((status) => ({ status, jobs: jobs.filter((job) => job.status === status) })), [jobs]);

  function setJobStatus(id: string, status: JobStatus, technician?: string) {
    setJobs((current) => current.map((job) => job.id === id ? { ...job, status, technician: technician || job.technician } : job));
  }

  return (
    <>
      <header className="system-header">
        <div><p className="system-eyebrow">05 / FIELD SERVICE CONTROL</p><h1>Every visit,<br /><em>under control.</em></h1><p className="system-header-copy">Dispatch live work, balance technician capacity, and preserve a clear chain of events from assignment to customer proof.</p></div>
        <div className="system-actions"><button aria-pressed={view === "list"} onClick={() => setView(view === "map" ? "list" : "map")}><SlidersHorizontal size={13} /> {view === "map" ? "List view" : "Map view"}</button>{role !== "technician" && <><WorkflowButton action="route:optimize" note="Morning Manila route plan recalculated">Optimize routes</WorkflowButton><WorkflowButton className="primary" action="job:create" recordId="WO-2052"><Plus size={13} /> New work order</WorkflowButton></>}</div>
      </header>

      <section className="metric-grid" aria-label="Field service metrics">
        <MetricCard label="Active visits" value={String(active).padStart(2, "0")} delta="Live" detail="Technicians currently driving or working" tone="good" />
        <MetricCard label="On-time arrival" value="94.2%" delta="+3.1%" detail="Across the last 30 field visits" tone="good" />
        <MetricCard label="Unassigned" value={String(jobs.filter((job) => job.status === "Unassigned").length).padStart(2, "0")} delta="Needs action" detail="Two jobs remain inside their service window" tone="warn" />
        <MetricCard label="First-time fix" value="87%" delta="+5%" detail={`${completed + 14} visits completed this week`} />
      </section>

      {view === "map" ? (
        <div className={styles.mapLayout}>
          <Panel eyebrow="METRO MANILA / LIVE" title="Dispatch map" action={<span className={styles.live}><i></i> 3 technicians online</span>} className={styles.mapPanel}>
            <div className={styles.mapCanvas}>
              <div className={styles.mapLabels}><span>QUEZON CITY</span><span>PASIG</span><span>MAKATI</span><span>TAGUIG</span></div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M17 21 C35 30, 31 48, 47 43 S64 24, 64 32 S55 55, 74 62 S62 78, 45 72" /></svg>
              {jobs.map((job) => <button key={job.id} className={`${styles.jobPin} ${selectedId === job.id ? styles.selected : ""} ${styles[`pin${job.status.replace(" ", "")}`]}`} style={{ "--x": `${job.x}%`, "--y": `${job.y}%` } as CSSProperties} onClick={() => setSelectedId(job.id)} aria-label={`Open ${job.id}, ${job.customer}`}><MapPin size={15} /><span>{job.id}</span></button>)}
              <div className={styles.technicianDot} style={{ left: "58%", top: "39%" }}><Navigation size={11} /><span>Paolo</span></div>
              <div className={styles.technicianDot} style={{ left: "67%", top: "54%" }}><Navigation size={11} /><span>Mika</span></div>
            </div>
          </Panel>

          <aside className={styles.jobDetail}>
            <div className={styles.detailHead}><div><span>{selected.id}</span><StatusBadge tone={selected.status === "Complete" ? "good" : selected.priority === "Urgent" ? "warn" : "info"}>{selected.status}</StatusBadge></div><h2>{selected.customer}</h2><p>{selected.service}</p></div>
            <dl className={styles.jobFacts}><div><dt><MapPin size={13} /> Location</dt><dd>{selected.address}</dd></div><div><dt><Clock3 size={13} /> Service window</dt><dd>{selected.window}</dd></div><div><dt><Wrench size={13} /> Technician</dt><dd>{selected.technician}</dd></div><div><dt><Navigation size={13} /> Expected arrival</dt><dd>{selected.eta}</dd></div></dl>
            <div className={styles.detailTimeline}><p>Activity</p><ol><li><i></i><div><strong>Work order confirmed</strong><span>Today · 08:42</span></div></li><li><i></i><div><strong>{selected.status === "Unassigned" ? "Awaiting dispatch" : "Technician status updated"}</strong><span>Today · 09:18</span></div></li><li className={styles.pending}><i></i><div><strong>Completion proof</strong><span>Required before close</span></div></li></ol></div>
            <div className={styles.detailActions}>
              {role === "technician" ? <>
                {selected.status === "Unassigned" && <WorkflowButton action="job:view" recordId={selected.id} note="Opened an unassigned work order">Awaiting dispatch</WorkflowButton>}
                {selected.status === "En route" && <WorkflowButton className="primary" action="job:arrive" recordId={selected.id} onSuccess={() => setJobStatus(selected.id, "On site", session?.name)}>Mark arrived</WorkflowButton>}
                {selected.status === "On site" && <WorkflowButton className="primary" action="job:complete" recordId={selected.id} note="Completion proof captured" onSuccess={() => setJobStatus(selected.id, "Complete", session?.name)}>Complete visit</WorkflowButton>}
                {selected.status === "Complete" && <WorkflowButton action="proof:add" recordId={selected.id} note="Added a completion note">Add service note</WorkflowButton>}
              </> : <>
                {selected.status !== "Complete" && <WorkflowButton action="job:assign" recordId={selected.id} note="Assigned from dispatch board" onSuccess={() => setJobStatus(selected.id, "En route", "Jules Ramos")}>{selected.status === "Unassigned" ? "Assign Jules" : "Reassign Jules"}</WorkflowButton>}
                <button type="button" className="workflow-button primary" onClick={() => setView("list")}>Open dispatch board</button>
              </>}
            </div>
          </aside>
        </div>
      ) : (
        <Panel eyebrow="TODAY / 5 WORK ORDERS" title="Dispatch board" action={<button className="icon-button" onClick={() => setView("map")} aria-label="Open map"><Map size={15} /></button>}>
          <div className={styles.board}>{grouped.map((group) => <section key={group.status}><header><span>{group.status}</span><b>{group.jobs.length}</b></header>{group.jobs.map((job) => <button key={job.id} className={styles.boardCard} onClick={() => { setSelectedId(job.id); setView("map"); }}><div><span>{job.id}</span>{job.priority === "Urgent" && <i>Urgent</i>}</div><strong>{job.customer}</strong><p>{job.service}</p><small><Clock3 size={11} /> {job.window}</small><small><Truck size={11} /> {job.technician}</small></button>)}</section>)}</div>
        </Panel>
      )}

      <div className={styles.lowerGrid}>
        <Panel eyebrow="FIELD CAPACITY" title="Technician workload"><div className={styles.techList}>{technicians.map((tech) => <article key={tech.name}><span className="avatar" style={{ background: tech.color }}>{tech.initials}</span><div><strong>{tech.name}</strong><small>{tech.state}</small></div><b>{tech.load} jobs</b><i><span style={{ width: `${tech.load * 18}%`, background: tech.color }}></span></i></article>)}</div></Panel>
        <Panel eyebrow="SERVICE HEALTH" title="Today’s operating window"><div className={styles.windowChart}><div className={styles.chartBars}>{[42,58,78,66,86,94,72,51].map((height, index) => <i key={index} style={{ height: `${height}%` }}></i>)}</div><div><span>08:00</span><span>12:00</span><span>16:00</span></div><p><Route size={14} /> 128 km planned · 19 km avoided after optimization</p></div></Panel>
      </div>
    </>
  );
}

export default function RouteOpsPage() {
  return <SystemShell systemId="routeops" activeArea="Dispatch"><RouteOpsDashboard /></SystemShell>;
}
