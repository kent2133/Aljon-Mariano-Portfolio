"use client";

import { AlertCircle, ChevronRight, Clock3 } from "lucide-react";
import { formatDate } from "@/lib/repair-store";
import { statusLabels } from "@/lib/repair-data";
import type { RepairTicket } from "@/lib/repair-types";
import styles from "./workspace.module.css";

interface TicketQueueProps {
  tickets: RepairTicket[];
  selectedId: string;
  onSelect: (ticketId: string) => void;
}

export function TicketQueue({ tickets, selectedId, onSelect }: TicketQueueProps) {
  return (
    <section className={styles.panel} aria-labelledby="ticket-queue-title">
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Live work</p>
          <h2 id="ticket-queue-title">Ticket queue</h2>
        </div>
        <span className={styles.countBadge}>{tickets.length}</span>
      </div>
      <div className={styles.ticketList}>
        {tickets.length ? (
          tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              className={`${styles.ticketRow} ${selectedId === ticket.id ? styles.ticketRowActive : ""}`}
              aria-pressed={selectedId === ticket.id}
              onClick={() => onSelect(ticket.id)}
            >
              <span className={styles.ticketRowTop}>
                <span className={styles.ticketId}>{ticket.id}</span>
                <span className={`${styles.statusBadge} ${styles[`status_${ticket.status}`]}`}>
                  {statusLabels[ticket.status]}
                </span>
              </span>
              <strong>{ticket.device}</strong>
              <span className={styles.ticketIssue}>{ticket.issue}</span>
              <span className={styles.ticketMeta}>
                {ticket.priority === "urgent" ? (
                  <span className={styles.urgentText}><AlertCircle size={13} /> Urgent</span>
                ) : (
                  <span><Clock3 size={13} /> Standard</span>
                )}
                <span>{formatDate(ticket.updatedAt)}</span>
                <ChevronRight size={16} aria-hidden="true" />
              </span>
            </button>
          ))
        ) : (
          <div className={styles.emptyState}>
            <span>0</span>
            <h3>No tickets in this view</h3>
            <p>Switch roles or create a repair request to begin.</p>
          </div>
        )}
      </div>
    </section>
  );
}
