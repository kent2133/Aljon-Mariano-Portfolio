"use client";

import { CalendarClock, CircleUserRound, PackageCheck, ReceiptText, Smartphone, Wrench } from "lucide-react";
import { statusLabels, statusOrder } from "@/lib/repair-data";
import { formatCurrency, formatDate } from "@/lib/repair-store";
import type { RepairAction, RepairRole, RepairTicket, Technician } from "@/lib/repair-types";
import { WorkflowActions } from "./workflow-actions";
import styles from "./workspace.module.css";

interface TicketDetailProps {
  ticket?: RepairTicket;
  role: RepairRole;
  technicians: Technician[];
  dispatch: React.Dispatch<RepairAction>;
  onComplete: (message: string) => void;
}

export function TicketDetail({ ticket, role, technicians, dispatch, onComplete }: TicketDetailProps) {
  if (!ticket) {
    return (
      <section className={`${styles.panel} ${styles.detailPanel}`}>
        <div className={styles.emptyState}>
          <Smartphone size={28} />
          <h2>Select a ticket</h2>
          <p>Choose a repair from the queue to see its live service record.</p>
        </div>
      </section>
    );
  }

  const technician = technicians.find((item) => item.id === ticket.assignedTechnicianId);
  const progress = statusOrder.indexOf(ticket.status);

  return (
    <section className={`${styles.panel} ${styles.detailPanel}`} aria-labelledby="ticket-detail-title">
      <div className={styles.detailHeader}>
        <div>
          <span className={styles.ticketId}>{ticket.id}</span>
          <h2 id="ticket-detail-title">{ticket.device}</h2>
          <p>{ticket.deviceCategory} repair for {ticket.customerName}</p>
        </div>
        <span className={`${styles.statusBadge} ${styles[`status_${ticket.status}`]}`}>
          {statusLabels[ticket.status]}
        </span>
      </div>

      <div className={styles.progressTrack} aria-label={`Repair progress: ${statusLabels[ticket.status]}`}>
        {statusOrder.map((status, index) => (
          <span
            key={status}
            className={index <= progress ? styles.progressStepActive : styles.progressStep}
            title={statusLabels[status]}
          />
        ))}
      </div>

      <div className={styles.detailFacts}>
        <div><CircleUserRound size={17} /><span><small>Customer</small><strong>{ticket.customerName}</strong></span></div>
        <div><Wrench size={17} /><span><small>Technician</small><strong>{technician?.name ?? "Unassigned"}</strong></span></div>
        <div><CalendarClock size={17} /><span><small>Last update</small><strong>{formatDate(ticket.updatedAt, true)}</strong></span></div>
        <div><PackageCheck size={17} /><span><small>Priority</small><strong>{ticket.priority === "urgent" ? "Urgent" : "Standard"}</strong></span></div>
      </div>

      <div className={styles.issueCard}>
        <p className={styles.eyebrow}>Reported issue</p>
        <p>{ticket.issue}</p>
      </div>

      {ticket.diagnosis ? (
        <div className={styles.diagnosisCard}>
          <p className={styles.eyebrow}>Workshop diagnosis</p>
          <p>{ticket.diagnosis}</p>
        </div>
      ) : null}

      {ticket.quote ? (
        <div className={styles.quoteCard}>
          <div className={styles.quoteCardHeading}>
            <span><ReceiptText size={18} /> Repair quote</span>
            <strong>{ticket.quote.status}</strong>
          </div>
          <div><span>Parts</span><strong>{formatCurrency(ticket.quote.parts)}</strong></div>
          <div><span>Labor</span><strong>{formatCurrency(ticket.quote.labor)}</strong></div>
          <div className={styles.quoteGrandTotal}><span>Total</span><strong>{formatCurrency(ticket.quote.total)}</strong></div>
        </div>
      ) : null}

      <WorkflowActions
        key={`${ticket.id}-${ticket.status}-${role}-${ticket.diagnosis ?? "none"}`}
        ticket={ticket}
        role={role}
        technicians={technicians}
        dispatch={dispatch}
        onComplete={onComplete}
      />

      <div className={styles.timelineSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Audit trail</p>
            <h3>Repair timeline</h3>
          </div>
          <span>{ticket.timeline.length} events</span>
        </div>
        <ol className={styles.timeline}>
          {ticket.timeline.map((event, index) => (
            <li key={event.id}>
              <span className={index === 0 ? styles.timelineMarkerActive : styles.timelineMarker} />
              <div>
                <span className={styles.timelineMeta}>{formatDate(event.at, true)} - {event.actor}</span>
                <strong>{event.title}</strong>
                <p>{event.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
