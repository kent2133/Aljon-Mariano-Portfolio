"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  Clock3,
  MapPin,
  PhoneCall,
  Play,
  Plus,
  Search,
  Stethoscope,
  TimerReset,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { SystemShell, WorkflowButton, useOperations } from "@/components/system-shell";
import { MetricCard, Panel, ProgressBar, StatusBadge } from "@/components/ui";
import styles from "./page.module.css";

type QueueStatus = "Waiting" | "Called" | "In service" | "Complete";

type QueueEntry = {
  id: string;
  number: string;
  client: string;
  initials: string;
  service: string;
  provider: string;
  room: string;
  appointment: string;
  arrived: string;
  wait: number;
  status: QueueStatus;
  priority?: boolean;
  lastUpdate?: string;
};

type Appointment = {
  id: string;
  time: string;
  client: string;
  service: string;
  provider: string;
  state: "Arrived" | "Confirmed" | "Due soon" | "Cancelled";
  lastUpdate?: string;
};

const initialQueue: QueueEntry[] = [
  { id: "VIS-1821", number: "A-021", client: "Angela Reyes", initials: "AR", service: "Primary consultation", provider: "Dr. Luis Flores", room: "Room 03", appointment: "09:20", arrived: "09:08", wait: 14, status: "In service" },
  { id: "VIS-1822", number: "A-022", client: "Noel Bautista", initials: "NB", service: "Results review", provider: "Dr. Luis Flores", room: "Room 03", appointment: "09:40", arrived: "09:23", wait: 17, status: "Called", priority: true },
  { id: "VIS-1823", number: "B-014", client: "Marites Go", initials: "MG", service: "Vaccination", provider: "Nurse Bea Cruz", room: "Care Bay 02", appointment: "09:45", arrived: "09:31", wait: 9, status: "Waiting" },
  { id: "VIS-1824", number: "A-023", client: "Dino Santos", initials: "DS", service: "Primary consultation", provider: "Dr. Luis Flores", room: "Room 03", appointment: "10:00", arrived: "09:39", wait: 6, status: "Waiting" },
  { id: "VIS-1825", number: "C-008", client: "Joyce Tan", initials: "JT", service: "Diagnostics", provider: "Tech Mark Villanueva", room: "Lab 01", appointment: "10:10", arrived: "09:42", wait: 3, status: "Waiting" },
];

const initialAppointments: Appointment[] = [
  { id: "APT-4081", time: "09:20", client: "Angela Reyes", service: "Primary consultation", provider: "Dr. Luis Flores", state: "Arrived" },
  { id: "APT-4082", time: "09:40", client: "Noel Bautista", service: "Results review", provider: "Dr. Luis Flores", state: "Arrived" },
  { id: "APT-4083", time: "09:45", client: "Marites Go", service: "Vaccination", provider: "Nurse Bea Cruz", state: "Arrived" },
  { id: "APT-4084", time: "10:00", client: "Dino Santos", service: "Primary consultation", provider: "Dr. Luis Flores", state: "Arrived" },
  { id: "APT-4085", time: "10:10", client: "Joyce Tan", service: "Diagnostics", provider: "Tech Mark Villanueva", state: "Arrived" },
  { id: "APT-4086", time: "10:30", client: "Lea Mendoza", service: "Wellness consultation", provider: "Dr. Luis Flores", state: "Due soon" },
  { id: "APT-4087", time: "10:45", client: "Paolo Garcia", service: "Vaccination", provider: "Nurse Bea Cruz", state: "Confirmed" },
  { id: "APT-4088", time: "11:00", client: "Mae Lim", service: "Diagnostics", provider: "Tech Mark Villanueva", state: "Confirmed" },
  { id: "APT-4089", time: "11:20", client: "Jamie Garcia", service: "Wellness consultation", provider: "Dr. Luis Flores", state: "Confirmed" },
];

const providers = [
  { name: "Dr. Luis Flores", role: "Primary care", initials: "LF", room: "Room 03", load: 82, next: "Noel Bautista", state: "With client", seen: 6 },
  { name: "Nurse Bea Cruz", role: "Immunization", initials: "BC", room: "Care Bay 02", load: 58, next: "Marites Go", state: "Ready", seen: 9 },
  { name: "Tech Mark Villanueva", role: "Diagnostics", initials: "MV", room: "Lab 01", load: 71, next: "Joyce Tan", state: "Preparing", seen: 7 },
];

function queueTone(status: QueueStatus) {
  if (status === "Complete") return "good" as const;
  if (status === "In service") return "info" as const;
  if (status === "Called") return "warn" as const;
  return "neutral" as const;
}

function CareQueueWorkspace() {
  const { session, events } = useOperations();
  const [queue, setQueue] = useState(initialQueue);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [view, setView] = useState<"queue" | "appointments" | "capacity">("queue");
  const [queueFilter, setQueueFilter] = useState<"All" | QueueStatus>("All");
  const [query, setQuery] = useState("");
  const [scheduleOffset, setScheduleOffset] = useState(0);
  const [recentQueueId, setRecentQueueId] = useState<string | null>(null);
  const [recentAppointmentId, setRecentAppointmentId] = useState<string | null>(null);
  const role = session?.role ?? "client";

  const visibleQueue = useMemo(() => queue.filter((entry) => {
    const matchesStatus = queueFilter === "All" || entry.status === queueFilter;
    const normalized = query.trim().toLowerCase();
    const matchesQuery = !normalized || `${entry.number} ${entry.client} ${entry.service} ${entry.provider}`.toLowerCase().includes(normalized);
    return matchesStatus && matchesQuery;
  }), [queue, queueFilter, query]);

  const waiting = queue.filter((entry) => entry.status === "Waiting").length;
  const inService = queue.filter((entry) => entry.status === "In service").length;
  const averageWait = Math.round(queue.filter((entry) => entry.status === "Waiting").reduce((total, entry) => total + entry.wait, 0) / Math.max(1, waiting));
  const nextRecommended = queue.find((entry) => entry.status === "Waiting" && entry.priority) ?? queue.find((entry) => entry.status === "Waiting");
  const scheduleTitle = ["Tuesday, 27 October", "Wednesday, 28 October", "Thursday, 29 October"][scheduleOffset + 1];
  const completedToday = 18 + queue.filter((entry) => entry.status === "Complete").length;
  const scheduledToday = 34 + appointments.length - initialAppointments.length;
  const nextVisitRescheduled = appointments.find((appointment) => appointment.id === "APT-4086")?.time === "14:20";
  const nextAppointmentNumber = Math.max(...appointments.map((appointment) => Number(appointment.id.replace("APT-", "")))) + 1;
  const nextAppointmentId = `APT-${nextAppointmentNumber}`;
  const walkInCount = queue.filter((entry) => entry.id.startsWith("VIS-WALKIN")).length;
  const nextWalkInQueueId = `VIS-WALKIN-${walkInCount + 1}`;

  const updateQueue = (id: string, status: QueueStatus) => {
    const updateLabel: Record<QueueStatus, string> = {
      Waiting: "Waiting status restored just now",
      Called: "Called to the room just now",
      "In service": "Service started just now",
      Complete: "Visit completed just now",
    };
    setQueue((current) => current.map((entry) => entry.id === id ? { ...entry, status, wait: status === "Complete" ? 0 : entry.wait, lastUpdate: updateLabel[status] } : entry));
    setRecentQueueId(id);
  };

  const checkIn = (appointment: Appointment) => {
    setAppointments((current) => current.map((item) => item.id === appointment.id ? { ...item, state: "Arrived", lastUpdate: "Checked in just now" } : item));
    setRecentAppointmentId(appointment.id);
    if (!queue.some((entry) => entry.client === appointment.client)) {
      const id = `VIS-${1820 + queue.length + 1}`;
      setRecentQueueId(id);
      setQueue((current) => [...current, {
          id,
          number: `A-${String(21 + current.length).padStart(3, "0")}`,
          client: appointment.client,
          initials: appointment.client.split(" ").map((part) => part[0]).join("").slice(0, 2),
          service: appointment.service,
          provider: appointment.provider,
          room: appointment.provider.includes("Cruz") ? "Care Bay 02" : appointment.provider.includes("Villanueva") ? "Lab 01" : "Room 03",
          appointment: appointment.time,
          arrived: "Now",
          wait: 0,
          status: "Waiting",
          lastUpdate: "Checked in just now",
        }]);
    }
  };

  const addClientAppointment = () => {
    const addedCount = appointments.length - initialAppointments.length;
    const availableTimes = ["14:20", "14:40", "15:00", "15:20", "15:40"];
    const appointment: Appointment = {
      id: nextAppointmentId,
      time: availableTimes[addedCount % availableTimes.length],
      client: session?.name ?? "Jamie Garcia",
      service: "Wellness consultation",
      provider: "Dr. Luis Flores",
      state: "Confirmed",
      lastUpdate: "Booked in this session",
    };
    setAppointments((current) => [...current, appointment]);
    setRecentAppointmentId(appointment.id);
    setScheduleOffset(0);
    setView("appointments");
  };

  const addWalkIn = () => {
    const guests = ["Ana Dela Cruz", "Miguel Ramos", "Sofia Mendoza", "Rico Santos"];
    const client = guests[walkInCount % guests.length];
    const queueId = nextWalkInQueueId;
    const appointmentId = nextAppointmentId;
    const appointment: Appointment = {
      id: appointmentId,
      time: "Now",
      client,
      service: "Walk-in consultation",
      provider: "Dr. Luis Flores",
      state: "Arrived",
      lastUpdate: "Walk-in added just now",
    };
    const entry: QueueEntry = {
      id: queueId,
      number: `W-${String(walkInCount + 1).padStart(3, "0")}`,
      client,
      initials: client.split(" ").map((part) => part[0]).join("").slice(0, 2),
      service: appointment.service,
      provider: appointment.provider,
      room: "Room 03",
      appointment: "Walk-in",
      arrived: "Now",
      wait: 0,
      status: "Waiting",
      lastUpdate: "Walk-in added just now",
    };
    setAppointments((current) => [...current, appointment]);
    setQueue((current) => [...current, entry]);
    setRecentAppointmentId(appointmentId);
    setRecentQueueId(queueId);
    setQueueFilter("All");
    setView("queue");
  };

  const moveQueueLater = (entry: QueueEntry) => {
    setQueue((current) => [
      ...current.filter((item) => item.id !== entry.id),
      { ...entry, priority: false, lastUpdate: "Moved to a later position just now" },
    ]);
    setRecentQueueId(entry.id);
  };

  const cancelAppointment = (id: string) => {
    setAppointments((current) => current.map((item) => item.id === id ? { ...item, state: "Cancelled", lastUpdate: "Cancelled just now" } : item));
    setRecentAppointmentId(id);
  };

  const rescheduleNextVisit = () => {
    setAppointments((current) => current.map((item) => item.id === "APT-4086" ? { ...item, time: "14:20", state: "Confirmed", lastUpdate: "Rescheduled to 14:20 just now" } : item));
    setRecentAppointmentId("APT-4086");
  };

  return (
    <>
      <header className="system-header">
        <div>
          <p className="system-eyebrow">Wednesday, 28 October · Main clinic</p>
          <h1>A calmer queue, from <em>arrival to care.</em></h1>
          <p className="system-header-copy">One operational view for appointments, arrivals, room readiness, provider capacity, and the next person who needs attention.</p>
        </div>
        <div className="system-actions">
          <button onClick={() => setView("appointments")}><CalendarDays size={14} /> Today’s schedule</button>
          {role === "client" && <WorkflowButton action="appointment:create" recordId={nextAppointmentId} note="Created a new appointment" className="primary" onSuccess={addClientAppointment}>Book appointment <ArrowRight size={14} /></WorkflowButton>}
          {role === "receptionist" && <WorkflowButton action="appointment:create" recordId={nextAppointmentId} note="Created a walk-in appointment" className="primary" onSuccess={addWalkIn}><Plus size={14} /> Add walk-in</WorkflowButton>}
        </div>
      </header>

      <section className="metric-grid" aria-label="Queue metrics">
        <MetricCard label="People waiting" value={String(waiting)} delta="Live" detail="Two providers ready for their next client" />
        <MetricCard label="Average wait" value={`${averageWait}m`} delta="-3 min" detail="Below today’s 15-minute service target" tone="good" />
        <MetricCard label="In service" value={String(inService)} delta="3 rooms" detail="Across consultation, diagnostics, and care" />
        <MetricCard label="On-time today" value="91%" delta="+6.4%" detail="Appointments started within ten minutes" tone="good" />
      </section>

      <nav className={styles.viewTabs} aria-label="CareQueue views">
        <button aria-pressed={view === "queue"} className={view === "queue" ? styles.active : ""} onClick={() => setView("queue")}><Users size={15} /> Live queue <b>{queue.filter((entry) => entry.status !== "Complete").length}</b></button>
        <button aria-pressed={view === "appointments"} className={view === "appointments" ? styles.active : ""} onClick={() => setView("appointments")}><CalendarDays size={15} /> Appointments <b>{appointments.length}</b></button>
        <button aria-pressed={view === "capacity"} className={view === "capacity" ? styles.active : ""} onClick={() => setView("capacity")}><Activity size={15} /> Provider capacity</button>
      </nav>

      {view === "queue" && (
        <div className={styles.queueLayout}>
          <Panel
            eyebrow="Now serving"
            title="Live service board"
            className={styles.queuePanel}
            action={
              <label className={styles.search}>
                <Search size={14} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a client" aria-label="Search queue" />
              </label>
            }
          >
            <div className={styles.filterBar}>
              {(["All", "Waiting", "Called", "In service", "Complete"] as const).map((status) => (
                <button key={status} aria-pressed={queueFilter === status} className={queueFilter === status ? styles.filterActive : ""} onClick={() => setQueueFilter(status)}>{status}</button>
              ))}
            </div>
            <div className={styles.queueList}>
              {visibleQueue.map((entry) => (
                <article key={entry.id} className={`${styles.queueCard} ${entry.status === "Called" ? styles.isCalled : ""} ${entry.priority ? styles.priority : ""} ${recentQueueId === entry.id ? styles.recentlyUpdated : ""}`}>
                  <div className={styles.queueNumber}><span>{entry.number}</span><small>{entry.appointment}</small></div>
                  <div className={styles.clientAvatar}>{entry.initials}</div>
                  <div className={styles.clientInfo}>
                    <div><strong>{entry.client}</strong>{entry.priority && <span><AlertCircle size={11} /> Priority</span>}</div>
                    <p>{entry.service}</p>
                    <small>{entry.provider} · {entry.room}</small>
                  </div>
                  <div className={styles.waitBlock}>
                    <StatusBadge tone={queueTone(entry.status)}>{entry.status}</StatusBadge>
                    <small>{entry.lastUpdate ?? (entry.status === "Complete" ? "Visit closed" : `Arrived ${entry.arrived} · ${entry.wait}m`)}</small>
                  </div>
                  <div className={styles.queueActions}>
                    {role === "provider" && entry.status === "Waiting" && (
                      <WorkflowButton action="queue:call" recordId={entry.id} note={`Called ${entry.number} to ${entry.room}`} className="primary" onSuccess={() => updateQueue(entry.id, "Called")}><BellRing size={13} /> Call</WorkflowButton>
                    )}
                    {role === "provider" && entry.status === "Called" && (
                      <WorkflowButton action="queue:serve" recordId={entry.id} note={`Started service for ${entry.number}`} className="primary" onSuccess={() => updateQueue(entry.id, "In service")}><Play size={13} /> Start</WorkflowButton>
                    )}
                    {role === "provider" && entry.status === "In service" && (
                      <WorkflowButton action="queue:complete" recordId={entry.id} note={`Completed visit for ${entry.number}`} className="primary" onSuccess={() => updateQueue(entry.id, "Complete")}><Check size={13} /> Complete</WorkflowButton>
                    )}
                    {role === "receptionist" && entry.status === "Waiting" && (
                      <WorkflowButton action="queue:skip" recordId={entry.id} note={`Moved ${entry.number} to the end of the queue`} onSuccess={() => moveQueueLater(entry)}><TimerReset size={13} /> Move later</WorkflowButton>
                    )}
                    {role === "client" && <span className={styles.clientMessage}>{entry.status === "Called" ? "Please proceed" : "Updates are live"}</span>}
                  </div>
                </article>
              ))}
              {visibleQueue.length === 0 && <div className={styles.noQueue}>No visits match this view.</div>}
            </div>
          </Panel>

          <aside className={styles.sideColumn}>
            <section className={styles.nextCard}>
              <span>Next recommended call</span>
              {nextRecommended ? <>
                <div className={styles.nextNumber}>{nextRecommended.number}</div>
                <strong>{nextRecommended.client}</strong>
                <p>{nextRecommended.service} · waiting {nextRecommended.wait} minutes</p>
                <div><MapPin size={13} /> {nextRecommended.room} is ready</div>
                {role === "provider" ? (
                  <WorkflowButton action="queue:call" recordId={nextRecommended.id} note={`Called ${nextRecommended.number} from recommended queue`} className="primary" onSuccess={() => updateQueue(nextRecommended.id, "Called")}><PhoneCall size={14} /> Call {nextRecommended.number}</WorkflowButton>
                ) : <small>Switch to Provider to call the next client.</small>}
              </> : <div className={styles.queueClear}><CircleCheck size={20} /><strong>Queue clear</strong><p>No one is waiting to be called.</p></div>}
            </section>

            <section className={styles.flowCard}>
              <header><div><span>Service flow</span><strong>Last 90 minutes</strong></div><Activity size={17} /></header>
              <div className={styles.flowBars} aria-label="Arrivals and completed visits chart">
                {[34, 52, 41, 78, 62, 88, 70, 58, 82, 66, 93, 73].map((value, index) => <i key={index} style={{ height: `${value}%` }} />)}
              </div>
              <footer><span>08:30</span><span>10:00</span><b>{completedToday} completed</b></footer>
            </section>

            <section className={styles.activityCard}>
              <header><span>Recent activity</span><b>{events.length + 2} updates</b></header>
              <ul>
                {events.slice(0, 3).map((event) => <li key={event.id}><span></span><div><strong>{event.action.replaceAll(":", " ")}</strong><small>{event.actorName} · just now</small></div></li>)}
                <li><span></span><div><strong>A-022 was called</strong><small>Dr. Luis Flores · 2m ago</small></div></li>
                <li><span></span><div><strong>B-014 checked in</strong><small>Bea Ramos · 9m ago</small></div></li>
              </ul>
            </section>
          </aside>
        </div>
      )}

      {view === "appointments" && (
        <div className={styles.appointmentsLayout}>
          <Panel
            eyebrow="Day schedule"
            title={scheduleTitle}
            action={<div className={styles.dateControls}><button aria-label="Previous day" disabled={scheduleOffset === -1} onClick={() => setScheduleOffset((current) => Math.max(-1, current - 1))}><ChevronLeft size={15} /></button><button aria-pressed={scheduleOffset === 0} onClick={() => setScheduleOffset(0)}>Today</button><button aria-label="Next day" disabled={scheduleOffset === 1} onClick={() => setScheduleOffset((current) => Math.min(1, current + 1))}><ChevronRight size={15} /></button></div>}
          >
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Time</th><th>Client</th><th>Service</th><th>Provider</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className={recentAppointmentId === appointment.id ? styles.recentRow : ""}>
                      <td><strong>{appointment.time}</strong><small>{appointment.id}</small></td>
                      <td><strong>{appointment.client}</strong><small>{appointment.lastUpdate ?? "Mobile confirmed"}</small></td>
                      <td>{appointment.service}</td>
                      <td>{appointment.provider}</td>
                      <td><StatusBadge tone={appointment.state === "Arrived" ? "good" : appointment.state === "Due soon" ? "warn" : appointment.state === "Cancelled" ? "danger" : "info"}>{appointment.state}</StatusBadge></td>
                      <td>
                        {role === "receptionist" && appointment.state !== "Arrived" && appointment.state !== "Cancelled" && (
                          <WorkflowButton action="queue:checkin" recordId={appointment.id} note={`Checked in ${appointment.client}`} className="primary" onSuccess={() => checkIn(appointment)}><UserRoundCheck size={13} /> Check in</WorkflowButton>
                        )}
                        {role === "receptionist" && appointment.state === "Arrived" && <span className={styles.tableDone}><Check size={12} /> In queue</span>}
                        {role === "client" && appointment.client === (session?.name ?? "Jamie Garcia") && appointment.state !== "Cancelled" && <WorkflowButton action="appointment:cancel" recordId={appointment.id} note="Cancelled from the client appointment view" onSuccess={() => cancelAppointment(appointment.id)}>Cancel</WorkflowButton>}
                        {role === "client" && appointment.client === (session?.name ?? "Jamie Garcia") && appointment.state === "Cancelled" && <span className={styles.tableDone}>Cancelled</span>}
                        {role === "provider" && <span className={styles.tableDone}>Scheduled</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <section className={styles.scheduleSummary}>
            <span><CalendarDays size={17} /> Schedule health</span>
            <strong>{scheduledToday} visits</strong>
            <p>Five appointments remain this morning. The first available opening is at 14:20.</p>
            <ProgressBar value={26} max={34} label="Day progress" />
            <dl><div><dt>Confirmed</dt><dd>28</dd></div><div><dt>Walk-ins</dt><dd>04</dd></div><div><dt>Late arrivals</dt><dd>02</dd></div></dl>
            {role === "receptionist" && !nextVisitRescheduled && <WorkflowButton action="appointment:reschedule" recordId="APT-4086" note="Rescheduled APT-4086 to 14:20" onSuccess={rescheduleNextVisit}><Clock3 size={13} /> Reschedule next visit</WorkflowButton>}
            {role === "receptionist" && nextVisitRescheduled && <span className={styles.rescheduleComplete}><Check size={13} /> APT-4086 moved to 14:20</span>}
          </section>
        </div>
      )}

      {view === "capacity" && (
        <div className={styles.capacityGrid}>
          {providers.map((provider) => (
            <article className={styles.providerCard} key={provider.name}>
              <header><div className={styles.providerAvatar}>{provider.initials}</div><div><strong>{provider.name}</strong><span>{provider.role}</span></div><StatusBadge tone={provider.state === "Ready" ? "good" : provider.state === "With client" ? "info" : "warn"}>{provider.state}</StatusBadge></header>
              <div className={styles.loadRing} style={{ "--load": `${provider.load * 3.6}deg` } as React.CSSProperties}><div><strong>{provider.load}%</strong><span>utilized</span></div></div>
              <dl><div><dt>Location</dt><dd>{provider.room}</dd></div><div><dt>Seen today</dt><dd>{provider.seen} clients</dd></div><div><dt>Next</dt><dd>{provider.next}</dd></div></dl>
              <footer><span><Stethoscope size={14} /> On shift until 17:00</span><button onClick={() => setView("queue")}>View queue <ArrowRight size={13} /></button></footer>
            </article>
          ))}
          <article className={styles.capacityNote}>
            <ClipboardCheck size={24} />
            <span>Capacity recommendation</span>
            <h2>Move one 11:30 consultation to Nurse Bea’s care lane.</h2>
            <p>This keeps Dr. Flores below 85% utilization and protects the afternoon appointment buffer.</p>
            <button onClick={() => setView("appointments")}>Review schedule <ArrowRight size={14} /></button>
          </article>
        </div>
      )}
    </>
  );
}

export default function CareQueuePage() {
  return <SystemShell systemId="carequeue" activeArea="Live service board"><CareQueueWorkspace /></SystemShell>;
}
