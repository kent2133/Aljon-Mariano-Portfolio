import { DEMO_TECHNICIAN_ID } from "../../lib/repair-data";
import type { RepairState, RepairTicket } from "../../lib/repair-types";

export const TUTORIAL_TICKET_ID = "RF-1048";
export const TUTORIAL_START_STEP: TutorialStepId = "admin-assign";
export const TUTORIAL_MILESTONES = ["Route", "Diagnose", "Quote", "Decide", "Repair", "Handoff"] as const;

export type TutorialStepId =
  | "admin-assign"
  | "switch-technician-diagnose"
  | "record-diagnosis"
  | "prepare-quote"
  | "switch-customer-decision"
  | "quote-decision"
  | "switch-technician-revise"
  | "revise-quote"
  | "switch-customer-revised"
  | "revised-decision"
  | "switch-technician-repair"
  | "start-repair"
  | "complete-repair"
  | "switch-administrator-handoff"
  | "confirm-pickup";

export type TutorialStep = {
  eyebrow: string;
  title: string;
  text: string;
  target: string;
  milestone: number;
};

export const tutorialSteps: Record<TutorialStepId, TutorialStep> = {
  "admin-assign": {
    eyebrow: "Administrator strand",
    title: "Assign the Pixel 9 Pro repair",
    text: "Review the submitted ticket, keep Noah Reyes selected, then choose Assign ticket to route it into the workshop.",
    target: "admin-assign",
    milestone: 0,
  },
  "switch-technician-diagnose": {
    eyebrow: "Connected handoff",
    title: "Switch to the Technician view",
    text: "Open Viewing as in the top-right corner and select Technician. The assigned Pixel 9 Pro will stay selected.",
    target: "role-menu",
    milestone: 1,
  },
  "record-diagnosis": {
    eyebrow: "Technician strand",
    title: "Record the workshop diagnosis",
    text: "Describe the display fault and inspection result, then save the diagnosis to the shared repair record.",
    target: "record-diagnosis",
    milestone: 1,
  },
  "prepare-quote": {
    eyebrow: "Technician strand",
    title: "Prepare the customer quote",
    text: "Enter a parts cost and labor cost, then send the quote for the customer's decision.",
    target: "prepare-quote",
    milestone: 2,
  },
  "switch-customer-decision": {
    eyebrow: "Connected handoff",
    title: "Switch to the Customer view",
    text: "Use Viewing as to open the Customer workspace and review the same repair from Maya's perspective.",
    target: "role-menu",
    milestone: 3,
  },
  "quote-decision": {
    eyebrow: "Customer decision",
    title: "Choose what happens to the quote",
    text: "Approve or decline the quote. Both choices are valid and the tutorial will follow the path you choose.",
    target: "quote-decision",
    milestone: 3,
  },
  "switch-technician-revise": {
    eyebrow: "Revision branch",
    title: "Return the declined quote to the Technician",
    text: "Switch to Technician so the workshop can revise the declined recommendation instead of leaving the workflow stuck.",
    target: "role-menu",
    milestone: 2,
  },
  "revise-quote": {
    eyebrow: "Revision branch",
    title: "Revise and resend the quote",
    text: "Enter updated parts and labor values, then send the revised quote back to the customer.",
    target: "revise-quote",
    milestone: 2,
  },
  "switch-customer-revised": {
    eyebrow: "Connected handoff",
    title: "Return to the Customer view",
    text: "Switch to Customer to review the revised recommendation and make another decision.",
    target: "role-menu",
    milestone: 3,
  },
  "revised-decision": {
    eyebrow: "Customer decision",
    title: "Decide on the revised quote",
    text: "Approve to begin the repair, or decline again to send the quote through another review cycle.",
    target: "quote-decision",
    milestone: 3,
  },
  "switch-technician-repair": {
    eyebrow: "Approved handoff",
    title: "Switch back to the Technician view",
    text: "The customer approved the quote. Open Technician to move the authorized work onto the bench.",
    target: "role-menu",
    milestone: 4,
  },
  "start-repair": {
    eyebrow: "Technician strand",
    title: "Start the approved repair",
    text: "Choose Start repair and watch the status, timeline, and operational metrics update together.",
    target: "start-repair",
    milestone: 4,
  },
  "complete-repair": {
    eyebrow: "Technician strand",
    title: "Complete the workshop record",
    text: "Describe the work performed and final test result, then mark the device ready for pickup.",
    target: "complete-repair",
    milestone: 4,
  },
  "switch-administrator-handoff": {
    eyebrow: "Final handoff",
    title: "Return to the Administrator view",
    text: "Switch to Administrator to complete the service-desk handoff and close the connected workflow.",
    target: "role-menu",
    milestone: 5,
  },
  "confirm-pickup": {
    eyebrow: "Administrator strand",
    title: "Confirm the customer handoff",
    text: "Choose Confirm pickup to release the repaired device, close the ticket, and complete its audit trail.",
    target: "confirm-pickup",
    milestone: 5,
  },
};

export function getTutorialTicket(state: RepairState): RepairTicket | undefined {
  return state.tickets.find((ticket) => ticket.id === TUTORIAL_TICKET_ID);
}

export function isTutorialStepComplete(step: TutorialStepId, state: RepairState): boolean {
  const ticket = getTutorialTicket(state);
  if (!ticket) return false;

  switch (step) {
    case "admin-assign":
      return ticket.status === "triage" && ticket.assignedTechnicianId === DEMO_TECHNICIAN_ID;
    case "switch-technician-diagnose":
    case "switch-technician-revise":
    case "switch-technician-repair":
      return state.currentRole === "technician";
    case "record-diagnosis":
      return Boolean(ticket.diagnosis?.trim());
    case "prepare-quote":
    case "revise-quote":
      return ticket.status === "awaiting-approval" && ticket.quote?.status === "pending";
    case "switch-customer-decision":
    case "switch-customer-revised":
      return state.currentRole === "customer";
    case "quote-decision":
    case "revised-decision":
      return ticket.quote?.status === "approved" || ticket.quote?.status === "declined";
    case "start-repair":
      return ["in-repair", "ready-for-pickup", "completed"].includes(ticket.status);
    case "complete-repair":
      return ["ready-for-pickup", "completed"].includes(ticket.status);
    case "switch-administrator-handoff":
      return state.currentRole === "administrator";
    case "confirm-pickup":
      return ticket.status === "completed";
  }
}

export function getNextTutorialStep(step: TutorialStepId, state: RepairState): TutorialStepId | null {
  const ticket = getTutorialTicket(state);

  switch (step) {
    case "admin-assign":
      return "switch-technician-diagnose";
    case "switch-technician-diagnose":
      return "record-diagnosis";
    case "record-diagnosis":
      return "prepare-quote";
    case "prepare-quote":
      return "switch-customer-decision";
    case "switch-customer-decision":
      return "quote-decision";
    case "quote-decision":
    case "revised-decision":
      return ticket?.quote?.status === "declined" ? "switch-technician-revise" : "switch-technician-repair";
    case "switch-technician-revise":
      return "revise-quote";
    case "revise-quote":
      return "switch-customer-revised";
    case "switch-customer-revised":
      return "revised-decision";
    case "switch-technician-repair":
      return "start-repair";
    case "start-repair":
      return "complete-repair";
    case "complete-repair":
      return "switch-administrator-handoff";
    case "switch-administrator-handoff":
      return "confirm-pickup";
    case "confirm-pickup":
      return null;
  }
}

export function tutorialCompletedMessage(step: TutorialStepId, state: RepairState): string {
  const ticket = getTutorialTicket(state);

  switch (step) {
    case "admin-assign":
      return "You routed the repair to Noah and updated the workshop capacity and activity feed.";
    case "switch-technician-diagnose":
      return "You opened the same assigned ticket from the workshop side.";
    case "record-diagnosis":
      return "The diagnosis is now part of the shared service record.";
    case "prepare-quote":
    case "revise-quote":
      return "The quote is now waiting in the customer's workspace.";
    case "switch-customer-decision":
    case "switch-customer-revised":
      return "You opened the repair from the customer's point of view.";
    case "quote-decision":
    case "revised-decision":
      return ticket?.quote?.status === "declined"
        ? "The decline was recorded and returned to the workshop. You can follow the revision branch or finish at this valid outcome."
        : "The approval moved the repair forward and added a new timeline event.";
    case "switch-technician-revise":
      return "The declined recommendation is back with the technician for revision.";
    case "switch-technician-repair":
      return "You are now looking at the approved job from the workshop side.";
    case "start-repair":
      return "RepairFlow moved the job onto the workbench and refreshed its operational metrics.";
    case "complete-repair":
      return "You documented the finished work and moved the device to the customer handoff queue.";
    case "switch-administrator-handoff":
      return "The service desk can now complete the final release from the same record.";
    case "confirm-pickup":
      return "The device was released, the ticket was closed, and the technician's capacity was restored.";
  }
}

export function isDeclinedDecision(step: TutorialStepId, state: RepairState): boolean {
  return (step === "quote-decision" || step === "revised-decision")
    && getTutorialTicket(state)?.quote?.status === "declined";
}
