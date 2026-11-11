"use client";

import { ArrowRight, Check, Play, Send, UserRoundPlus, Wrench } from "lucide-react";
import { useState, type FormEvent } from "react";
import { formatCurrency } from "@/lib/repair-store";
import type { RepairAction, RepairRole, RepairTicket, Technician } from "@/lib/repair-types";
import styles from "./workspace.module.css";

interface WorkflowActionsProps {
  ticket: RepairTicket;
  role: RepairRole;
  technicians: Technician[];
  dispatch: React.Dispatch<RepairAction>;
  onComplete: (message: string) => void;
}

export function WorkflowActions({ ticket, role, technicians, dispatch, onComplete }: WorkflowActionsProps) {
  const [technicianId, setTechnicianId] = useState(ticket.assignedTechnicianId ?? technicians[0]?.id ?? "");
  const [diagnosis, setDiagnosis] = useState("");
  const [parts, setParts] = useState("");
  const [labor, setLabor] = useState("");
  const [summary, setSummary] = useState("");

  function submit(event: FormEvent, action: RepairAction, message: string) {
    event.preventDefault();
    dispatch(action);
    onComplete(message);
  }

  if (role === "customer" && ticket.status === "awaiting-approval" && ticket.quote) {
    return (
      <div className={styles.nextAction} data-tour="quote-decision">
        <span className={styles.actionIcon}><Send size={18} /></span>
        <div className={styles.actionCopy}>
          <p className={styles.eyebrow}>Your next action</p>
          <h3>Approve the repair quote</h3>
          <p>Authorize {formatCurrency(ticket.quote.total)} so the workshop can begin.</p>
        </div>
        <div className={styles.quoteDecisionActions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              dispatch({ type: "approve-quote", ticketId: ticket.id });
              onComplete("Quote approved. The workshop can now begin the repair.");
            }}
          >
            Approve quote <ArrowRight size={16} />
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              dispatch({ type: "decline-quote", ticketId: ticket.id });
              onComplete("Quote declined. The technician can now revise the recommendation.");
            }}
          >
            Decline quote
          </button>
        </div>
      </div>
    );
  }

  if ((role === "customer" || role === "administrator") && ticket.status === "ready-for-pickup") {
    return (
      <div className={styles.nextAction} data-tour="confirm-pickup">
        <span className={styles.actionIcon}><Check size={18} /></span>
        <div className={styles.actionCopy}>
          <p className={styles.eyebrow}>Final step</p>
          <h3>Confirm device pickup</h3>
          <p>Close the ticket after the repaired device has been released.</p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            dispatch({ type: "confirm-pickup", ticketId: ticket.id });
            onComplete("Pickup confirmed. The repair ticket is now complete.");
          }}
        >
          Confirm pickup <Check size={16} />
        </button>
      </div>
    );
  }

  if (role === "administrator" && (ticket.status === "submitted" || ticket.status === "triage")) {
    return (
      <form
        className={styles.actionForm}
        data-tour="admin-assign"
        onSubmit={(event) => submit(
          event,
          { type: "assign-technician", ticketId: ticket.id, technicianId },
          "Technician assigned. The ticket is now in the diagnostic queue.",
        )}
      >
        <div className={styles.actionFormHeading}>
          <span className={styles.actionIcon}><UserRoundPlus size={18} /></span>
          <div>
            <p className={styles.eyebrow}>Route the work</p>
            <h3>Assign a technician</h3>
          </div>
        </div>
        <label className={styles.field}>
          <span>Workshop specialist</span>
          <select value={technicianId} onChange={(event) => setTechnicianId(event.target.value)} required>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name} - {technician.specialty} - {technician.activeTickets}/{technician.capacity} active
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={styles.primaryButton}>
          Assign ticket <ArrowRight size={16} />
        </button>
      </form>
    );
  }

  if (role === "technician" && ticket.status === "triage" && !ticket.diagnosis) {
    return (
      <form
        className={styles.actionForm}
        data-tour="record-diagnosis"
        onSubmit={(event) => submit(
          event,
          { type: "record-diagnosis", ticketId: ticket.id, diagnosis },
          "Diagnosis saved. You can now prepare the customer quote.",
        )}
      >
        <div className={styles.actionFormHeading}>
          <span className={styles.actionIcon}><Wrench size={18} /></span>
          <div>
            <p className={styles.eyebrow}>Workshop action</p>
            <h3>Record your diagnosis</h3>
          </div>
        </div>
        <label className={styles.field}>
          <span>Inspection findings</span>
          <textarea
            value={diagnosis}
            onChange={(event) => setDiagnosis(event.target.value)}
            placeholder="Describe the fault, affected parts, and inspection result."
            rows={4}
            minLength={12}
            required
          />
        </label>
        <button type="submit" className={styles.primaryButton}>
          Save diagnosis <Check size={16} />
        </button>
      </form>
    );
  }

  if (role === "technician" && ticket.status === "triage" && ticket.diagnosis) {
    const total = (Number(parts) || 0) + (Number(labor) || 0);
    return (
      <form
        className={styles.actionForm}
        data-tour={ticket.quote?.status === "declined" ? "revise-quote" : "prepare-quote"}
        onSubmit={(event) => submit(
          event,
          { type: "submit-quote", ticketId: ticket.id, quote: { parts: Number(parts), labor: Number(labor) } },
          "Quote sent. The customer will see it in their approval queue.",
        )}
      >
        <div className={styles.actionFormHeading}>
          <span className={styles.actionIcon}><Send size={18} /></span>
          <div>
            <p className={styles.eyebrow}>Workshop action</p>
            <h3>Prepare a repair quote</h3>
          </div>
        </div>
        <div className={styles.twoFields}>
          <label className={styles.field}>
            <span>Parts cost in PHP</span>
            <input type="number" min="0" step="50" value={parts} onChange={(event) => setParts(event.target.value)} required />
          </label>
          <label className={styles.field}>
            <span>Labor cost in PHP</span>
            <input type="number" min="0" step="50" value={labor} onChange={(event) => setLabor(event.target.value)} required />
          </label>
        </div>
        <div className={styles.quoteTotal}><span>Customer total</span><strong>{formatCurrency(total)}</strong></div>
        <button type="submit" className={styles.primaryButton} disabled={total <= 0}>
          Send quote <ArrowRight size={16} />
        </button>
      </form>
    );
  }

  if (role === "technician" && ticket.status === "approved") {
    return (
      <div className={styles.nextAction} data-tour="start-repair">
        <span className={styles.actionIcon}><Play size={18} /></span>
        <div className={styles.actionCopy}>
          <p className={styles.eyebrow}>Approved work</p>
          <h3>Move the device to your workbench</h3>
          <p>The customer has approved the quote. Start the tracked repair.</p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            dispatch({ type: "start-repair", ticketId: ticket.id });
            onComplete("Repair started. The customer can now track active progress.");
          }}
        >
          Start repair <Play size={16} />
        </button>
      </div>
    );
  }

  if (role === "technician" && ticket.status === "in-repair") {
    return (
      <form
        className={styles.actionForm}
        data-tour="complete-repair"
        onSubmit={(event) => submit(
          event,
          { type: "complete-repair", ticketId: ticket.id, summary },
          "Repair completed. The device is now ready for customer pickup.",
        )}
      >
        <div className={styles.actionFormHeading}>
          <span className={styles.actionIcon}><Check size={18} /></span>
          <div>
            <p className={styles.eyebrow}>Quality check</p>
            <h3>Complete the repair</h3>
          </div>
        </div>
        <label className={styles.field}>
          <span>Work performed and test result</span>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="List the repair performed and the final quality checks."
            rows={4}
            minLength={12}
            required
          />
        </label>
        <button type="submit" className={styles.primaryButton}>
          Mark ready for pickup <Check size={16} />
        </button>
      </form>
    );
  }

  return (
    <div className={styles.waitingAction}>
      <span className={styles.liveDot} />
      <div>
        <strong>{waitingTitle(ticket, role)}</strong>
        <p>{waitingDetail(ticket, role)}</p>
      </div>
    </div>
  );
}

function waitingTitle(ticket: RepairTicket, role: RepairRole): string {
  if (ticket.status === "completed") return "This repair is complete";
  if (ticket.status === "awaiting-approval") return role === "technician" ? "Waiting for customer approval" : "Quote awaiting a decision";
  if (ticket.status === "in-repair") return "Repair work is in progress";
  if (ticket.status === "submitted") return "Waiting for service desk assignment";
  if (ticket.status === "approved") return "The quote has been approved";
  return "No action is needed from this role";
}

function waitingDetail(ticket: RepairTicket, role: RepairRole): string {
  if (ticket.status === "completed") return "The full service record remains available in the timeline.";
  if (ticket.status === "awaiting-approval") return role === "technician" ? "The customer has the quote in their workspace." : "Open the Customer view to approve this quote.";
  if (ticket.status === "in-repair") return role === "customer" ? "The assigned technician will post the final test result here." : "Open the Technician view to complete workshop work.";
  if (ticket.status === "submitted") return "An administrator can route this ticket to the right specialist.";
  if (ticket.status === "approved") return "The assigned technician can move this device to the workbench.";
  return "Switch roles to continue the connected workflow.";
}
