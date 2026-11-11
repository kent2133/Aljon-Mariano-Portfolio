export type RepairRole = "customer" | "technician" | "administrator";

export type TicketStatus =
  | "submitted"
  | "triage"
  | "awaiting-approval"
  | "approved"
  | "in-repair"
  | "ready-for-pickup"
  | "completed";

export type TicketPriority = "standard" | "urgent";

export type QuoteStatus = "pending" | "approved" | "declined";

export type ActivityKind =
  | "created"
  | "assignment"
  | "diagnosis"
  | "quote"
  | "approval"
  | "repair"
  | "pickup"
  | "note";

export interface TimelineEvent {
  id: string;
  at: string;
  title: string;
  detail: string;
  actor: string;
  kind: ActivityKind;
}

export interface RepairQuote {
  parts: number;
  labor: number;
  total: number;
  status: QuoteStatus;
  submittedAt: string;
  approvedAt?: string;
}

export interface RepairTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  device: string;
  deviceCategory: string;
  issue: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  estimatedCompletion?: string;
  assignedTechnicianId?: string;
  diagnosis?: string;
  quote?: RepairQuote;
  repairSummary?: string;
  timeline: TimelineEvent[];
}

export interface Technician {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  activeTickets: number;
  capacity: number;
  status: "available" | "busy" | "offline";
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  reorderAt: number;
  unit: string;
}

export interface RepairActivity {
  id: string;
  ticketId: string;
  at: string;
  title: string;
  detail: string;
  actor: string;
  kind: ActivityKind;
}

export interface RepairState {
  version: 1;
  currentRole: RepairRole;
  selectedTicketId: string;
  tickets: RepairTicket[];
  technicians: Technician[];
  inventory: InventoryItem[];
  activity: RepairActivity[];
}

export interface CreateTicketInput {
  device: string;
  deviceCategory: string;
  issue: string;
  priority: TicketPriority;
}

export interface QuoteInput {
  parts: number;
  labor: number;
}

export type RepairAction =
  | { type: "hydrate"; state: RepairState }
  | { type: "set-role"; role: RepairRole }
  | { type: "select-ticket"; ticketId: string }
  | { type: "create-ticket"; input: CreateTicketInput; now?: string; id?: string }
  | { type: "assign-technician"; ticketId: string; technicianId: string; now?: string }
  | { type: "record-diagnosis"; ticketId: string; diagnosis: string; now?: string }
  | { type: "submit-quote"; ticketId: string; quote: QuoteInput; now?: string }
  | { type: "approve-quote"; ticketId: string; now?: string }
  | { type: "decline-quote"; ticketId: string; now?: string }
  | { type: "start-repair"; ticketId: string; now?: string }
  | { type: "complete-repair"; ticketId: string; summary: string; now?: string }
  | { type: "confirm-pickup"; ticketId: string; now?: string }
  | { type: "start-tutorial" }
  | { type: "reset-demo" };

export interface WorkspaceMetric {
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "acid" | "teal" | "orange";
}
