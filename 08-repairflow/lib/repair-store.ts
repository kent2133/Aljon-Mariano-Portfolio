"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { createSeedState, DEMO_CUSTOMER_ID, DEMO_TECHNICIAN_ID } from "./repair-data";
import type {
  RepairAction,
  RepairActivity,
  RepairRole,
  RepairState,
  RepairTicket,
  TimelineEvent,
  WorkspaceMetric,
} from "./repair-types";

const STORAGE_KEY = "repairflow-demo-state-v1";

const roleActor: Record<RepairRole, string> = {
  customer: "Maya Santos",
  technician: "Noah Reyes",
  administrator: "Service desk",
};

function actionTime(now?: string): string {
  return now ?? new Date().toISOString();
}

function eventId(ticketId: string, at: string, kind: TimelineEvent["kind"]): string {
  return `${ticketId}-${kind}-${at}`;
}

function addEvent(
  state: RepairState,
  ticket: RepairTicket,
  event: Omit<TimelineEvent, "id">,
  patch: Partial<RepairTicket>,
): RepairState {
  const timelineEvent: TimelineEvent = {
    ...event,
    id: eventId(ticket.id, event.at, event.kind),
  };
  const updatedTicket: RepairTicket = {
    ...ticket,
    ...patch,
    updatedAt: event.at,
    timeline: [timelineEvent, ...ticket.timeline],
  };
  const activity: RepairActivity = { ...timelineEvent, ticketId: ticket.id };

  return {
    ...state,
    tickets: state.tickets.map((item) => (item.id === ticket.id ? updatedTicket : item)),
    activity: [activity, ...state.activity].slice(0, 30),
  };
}

function updateTechnicianLoad(
  technicians: RepairState["technicians"],
  previousId: string | undefined,
  nextId: string | undefined,
): RepairState["technicians"] {
  if (previousId === nextId) return technicians;

  return technicians.map((technician) => {
    if (technician.id === previousId) {
      return { ...technician, activeTickets: Math.max(0, technician.activeTickets - 1) };
    }
    if (technician.id === nextId) {
      return { ...technician, activeTickets: technician.activeTickets + 1 };
    }
    return technician;
  });
}

export function repairReducer(state: RepairState, action: RepairAction): RepairState {
  if (action.type === "hydrate") return action.state;
  if (action.type === "reset-demo") return createSeedState();

  if (action.type === "set-role") {
    const available = ticketsForRole(state, action.role);
    const keepsSelection = available.some((ticket) => ticket.id === state.selectedTicketId);
    return {
      ...state,
      currentRole: action.role,
      selectedTicketId: keepsSelection ? state.selectedTicketId : (available[0]?.id ?? state.selectedTicketId),
    };
  }

  if (action.type === "select-ticket") {
    return state.tickets.some((ticket) => ticket.id === action.ticketId)
      ? { ...state, selectedTicketId: action.ticketId }
      : state;
  }

  if (action.type === "create-ticket") {
    const at = actionTime(action.now);
    const id = action.id ?? `RF-${Math.floor(1100 + Math.random() * 800)}`;
    const event: TimelineEvent = {
      id: eventId(id, at, "created"),
      at,
      title: "Repair request submitted",
      detail: `Maya created ${action.input.priority === "urgent" ? "an urgent" : "a standard"} repair request for ${action.input.device}.`,
      actor: "Maya Santos",
      kind: "created",
    };
    const ticket: RepairTicket = {
      id,
      customerId: DEMO_CUSTOMER_ID,
      customerName: "Maya Santos",
      customerEmail: "maya.santos@example.com",
      device: action.input.device,
      deviceCategory: action.input.deviceCategory,
      issue: action.input.issue,
      priority: action.input.priority,
      status: "submitted",
      createdAt: at,
      updatedAt: at,
      timeline: [event],
    };

    return {
      ...state,
      selectedTicketId: id,
      tickets: [ticket, ...state.tickets],
      activity: [{ ...event, ticketId: id }, ...state.activity].slice(0, 30),
    };
  }

  const ticketId = "ticketId" in action ? action.ticketId : undefined;
  const ticket = state.tickets.find((item) => item.id === ticketId);
  if (!ticket) return state;

  const at = actionTime("now" in action ? action.now : undefined);
  const actor = roleActor[state.currentRole];

  switch (action.type) {
    case "assign-technician": {
      if (ticket.status !== "submitted" && ticket.status !== "triage") return state;
      const technician = state.technicians.find((item) => item.id === action.technicianId);
      if (!technician) return state;
      const updated = addEvent(
        state,
        ticket,
        {
          at,
          title: "Technician assigned",
          detail: `${technician.name} received the ticket for diagnosis.`,
          actor,
          kind: "assignment",
        },
        { assignedTechnicianId: technician.id, status: "triage" },
      );
      return {
        ...updated,
        technicians: updateTechnicianLoad(state.technicians, ticket.assignedTechnicianId, technician.id),
      };
    }
    case "record-diagnosis":
      if (ticket.status !== "triage" || !action.diagnosis.trim()) return state;
      return addEvent(
        state,
        ticket,
        {
          at,
          title: "Diagnosis recorded",
          detail: action.diagnosis.trim(),
          actor,
          kind: "diagnosis",
        },
        { diagnosis: action.diagnosis.trim() },
      );
    case "submit-quote": {
      if (ticket.status !== "triage" || !ticket.diagnosis) return state;
      const parts = Math.max(0, action.quote.parts);
      const labor = Math.max(0, action.quote.labor);
      const total = parts + labor;
      if (total <= 0) return state;
      return addEvent(
        state,
        ticket,
        {
          at,
          title: "Quote ready for approval",
          detail: `Parts and labor were quoted at ${formatCurrency(total)}.`,
          actor,
          kind: "quote",
        },
        {
          status: "awaiting-approval",
          quote: { parts, labor, total, status: "pending", submittedAt: at },
        },
      );
    }
    case "approve-quote":
      if (ticket.status !== "awaiting-approval" || !ticket.quote) return state;
      return addEvent(
        state,
        ticket,
        {
          at,
          title: "Quote approved",
          detail: `${ticket.customerName} approved the ${formatCurrency(ticket.quote.total)} repair quote.`,
          actor,
          kind: "approval",
        },
        {
          status: "approved",
          quote: { ...ticket.quote, status: "approved", approvedAt: at },
        },
      );
    case "decline-quote":
      if (ticket.status !== "awaiting-approval" || !ticket.quote) return state;
      return addEvent(
        state,
        ticket,
        {
          at,
          title: "Quote declined",
          detail: `${ticket.customerName} declined the ${formatCurrency(ticket.quote.total)} quote and returned it for review.`,
          actor,
          kind: "approval",
        },
        {
          status: "triage",
          quote: { ...ticket.quote, status: "declined" },
        },
      );
    case "start-repair":
      if (ticket.status !== "approved") return state;
      return addEvent(
        state,
        ticket,
        {
          at,
          title: "Repair started",
          detail: "The approved repair moved to an active workbench.",
          actor,
          kind: "repair",
        },
        {
          status: "in-repair",
          estimatedCompletion: new Date(Date.parse(at) + 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      );
    case "complete-repair":
      if (ticket.status !== "in-repair" || !action.summary.trim()) return state;
      return addEvent(
        state,
        ticket,
        {
          at,
          title: "Ready for pickup",
          detail: action.summary.trim(),
          actor,
          kind: "repair",
        },
        { status: "ready-for-pickup", repairSummary: action.summary.trim(), estimatedCompletion: at },
      );
    case "confirm-pickup": {
      if (ticket.status !== "ready-for-pickup") return state;
      const updated = addEvent(
        state,
        ticket,
        {
          at,
          title: "Repair completed",
          detail: "The repaired device was released to the customer and the ticket was closed.",
          actor,
          kind: "pickup",
        },
        { status: "completed" },
      );
      return {
        ...updated,
        technicians: updateTechnicianLoad(state.technicians, ticket.assignedTechnicianId, undefined),
      };
    }
    default:
      return state;
  }
}

export function ticketsForRole(state: RepairState, role = state.currentRole): RepairTicket[] {
  if (role === "customer") {
    return state.tickets.filter((ticket) => ticket.customerId === DEMO_CUSTOMER_ID);
  }
  if (role === "technician") {
    return state.tickets.filter((ticket) => ticket.assignedTechnicianId === DEMO_TECHNICIAN_ID);
  }
  return state.tickets;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string, includeTime = false): string {
  const options: Intl.DateTimeFormatOptions = includeTime
    ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", year: "numeric" };
  return new Intl.DateTimeFormat("en-PH", options).format(new Date(value));
}

export function getWorkspaceMetrics(state: RepairState): WorkspaceMetric[] {
  const visible = ticketsForRole(state);
  const active = visible.filter((ticket) => ticket.status !== "completed");
  const awaiting = visible.filter((ticket) => ticket.status === "awaiting-approval");
  const ready = visible.filter((ticket) => ticket.status === "ready-for-pickup");
  const inRepair = visible.filter((ticket) => ticket.status === "in-repair");
  const completed = visible.filter((ticket) => ticket.status === "completed");
  const pipeline = visible.reduce((sum, ticket) => sum + (ticket.quote?.total ?? 0), 0);

  if (state.currentRole === "customer") {
    return [
      { label: "Active repairs", value: String(active.length), detail: "Across your devices", tone: "acid" },
      { label: "Needs your approval", value: String(awaiting.length), detail: "Quotes waiting", tone: "orange" },
      { label: "Ready for pickup", value: String(ready.length), detail: "At the service desk", tone: "teal" },
      { label: "Quoted value", value: formatCurrency(pipeline), detail: "Current and completed", tone: "neutral" },
    ];
  }

  if (state.currentRole === "technician") {
    return [
      { label: "Assigned tickets", value: String(active.length), detail: "Your current queue", tone: "acid" },
      { label: "Needs diagnosis", value: String(visible.filter((ticket) => ticket.status === "triage" && !ticket.diagnosis).length), detail: "Ready to inspect", tone: "orange" },
      { label: "On workbench", value: String(inRepair.length), detail: "Active repairs", tone: "teal" },
      { label: "Ready to release", value: String(ready.length), detail: "Quality check passed", tone: "neutral" },
    ];
  }

  return [
    { label: "Open tickets", value: String(active.length), detail: `${visible.filter((ticket) => ticket.priority === "urgent" && ticket.status !== "completed").length} marked urgent`, tone: "acid" },
    { label: "Awaiting approval", value: String(awaiting.length), detail: "Customer decisions", tone: "orange" },
    { label: "In repair", value: String(inRepair.length), detail: "Across all benches", tone: "teal" },
    { label: "Quote pipeline", value: formatCurrency(pipeline), detail: `${completed.length} completed tickets`, tone: "neutral" },
  ];
}

interface RepairStoreValue {
  state: RepairState;
  dispatch: Dispatch<RepairAction>;
  hasHydrated: boolean;
}

const RepairStoreContext = createContext<RepairStoreValue | null>(null);

function loadState(): RepairState {
  if (typeof window === "undefined") return createSeedState();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return createSeedState();
    const parsed = JSON.parse(stored) as RepairState;
    return parsed.version === 1 && Array.isArray(parsed.tickets) ? parsed : createSeedState();
  } catch {
    return createSeedState();
  }
}

export function RepairStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(repairReducer, undefined, createSeedState);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    dispatch({ type: "hydrate", state: loadState() });
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The workspace remains usable when browser storage is unavailable.
    }
  }, [hasHydrated, state]);

  const value = useMemo(() => ({ state, dispatch, hasHydrated }), [state, hasHydrated]);
  return createElement(RepairStoreContext.Provider, { value }, children);
}

export function useRepairStore(): RepairStoreValue {
  const value = useContext(RepairStoreContext);
  if (!value) throw new Error("useRepairStore must be used inside RepairStoreProvider");
  return value;
}
