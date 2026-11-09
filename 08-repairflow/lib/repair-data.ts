import type {
  InventoryItem,
  RepairActivity,
  RepairRole,
  RepairState,
  RepairTicket,
  Technician,
} from "./repair-types";

export const DEMO_CUSTOMER_ID = "customer-maya";
export const DEMO_TECHNICIAN_ID = "tech-noah";

export const roleLabels: Record<RepairRole, string> = {
  customer: "Customer",
  technician: "Technician",
  administrator: "Administrator",
};

export const statusLabels: Record<RepairTicket["status"], string> = {
  submitted: "Submitted",
  triage: "In triage",
  "awaiting-approval": "Awaiting approval",
  approved: "Quote approved",
  "in-repair": "In repair",
  "ready-for-pickup": "Ready for pickup",
  completed: "Completed",
};

export const statusOrder: RepairTicket["status"][] = [
  "submitted",
  "triage",
  "awaiting-approval",
  "approved",
  "in-repair",
  "ready-for-pickup",
  "completed",
];

const technicians: Technician[] = [
  {
    id: "tech-noah",
    name: "Noah Reyes",
    initials: "NR",
    specialty: "Mobile and tablets",
    activeTickets: 2,
    capacity: 4,
    status: "available",
  },
  {
    id: "tech-aya",
    name: "Aya Lim",
    initials: "AL",
    specialty: "Laptops and boards",
    activeTickets: 3,
    capacity: 4,
    status: "busy",
  },
  {
    id: "tech-miguel",
    name: "Miguel Cruz",
    initials: "MC",
    specialty: "Audio and wearables",
    activeTickets: 1,
    capacity: 3,
    status: "available",
  },
];

const inventory: InventoryItem[] = [
  { id: "part-screen", name: "OLED display assembly", category: "Mobile", quantity: 8, reorderAt: 4, unit: "units" },
  { id: "part-battery", name: "High-cycle battery pack", category: "Power", quantity: 3, reorderAt: 5, unit: "units" },
  { id: "part-usbc", name: "USB-C port module", category: "Boards", quantity: 12, reorderAt: 6, unit: "units" },
  { id: "part-thermal", name: "Thermal compound", category: "Workshop", quantity: 14, reorderAt: 5, unit: "tubes" },
];

const tickets: RepairTicket[] = [
  {
    id: "RF-1048",
    customerId: DEMO_CUSTOMER_ID,
    customerName: "Maya Santos",
    customerEmail: "maya.santos@example.com",
    device: "Pixel 9 Pro",
    deviceCategory: "Smartphone",
    issue: "Display flickers after a short drop and touch response fails near the top edge.",
    priority: "urgent",
    status: "awaiting-approval",
    createdAt: "2026-11-07T08:20:00.000Z",
    updatedAt: "2026-11-08T04:45:00.000Z",
    estimatedCompletion: "2026-11-11T09:00:00.000Z",
    assignedTechnicianId: "tech-noah",
    diagnosis: "Impact damaged the OLED panel and loosened the display connector. The frame remains within tolerance.",
    quote: {
      parts: 9200,
      labor: 1800,
      total: 11000,
      status: "pending",
      submittedAt: "2026-11-08T04:45:00.000Z",
    },
    timeline: [
      {
        id: "event-1048-3",
        at: "2026-11-08T04:45:00.000Z",
        title: "Quote ready for approval",
        detail: "OLED assembly replacement and labor were quoted at PHP 11,000.",
        actor: "Noah Reyes",
        kind: "quote",
      },
      {
        id: "event-1048-2",
        at: "2026-11-08T03:35:00.000Z",
        title: "Diagnosis recorded",
        detail: "The display assembly needs replacement. The chassis and main board passed inspection.",
        actor: "Noah Reyes",
        kind: "diagnosis",
      },
      {
        id: "event-1048-1",
        at: "2026-11-07T08:20:00.000Z",
        title: "Repair request submitted",
        detail: "Maya created a priority repair request for a Pixel 9 Pro.",
        actor: "Maya Santos",
        kind: "created",
      },
    ],
  },
  {
    id: "RF-1042",
    customerId: DEMO_CUSTOMER_ID,
    customerName: "Maya Santos",
    customerEmail: "maya.santos@example.com",
    device: "Sony WH-1000XM5",
    deviceCategory: "Headphones",
    issue: "The left channel cuts out when the headband is adjusted.",
    priority: "standard",
    status: "in-repair",
    createdAt: "2026-11-03T02:10:00.000Z",
    updatedAt: "2026-11-08T07:10:00.000Z",
    estimatedCompletion: "2026-11-10T08:00:00.000Z",
    assignedTechnicianId: "tech-miguel",
    diagnosis: "The internal flex cable is worn at the left hinge and needs replacement.",
    quote: {
      parts: 1450,
      labor: 950,
      total: 2400,
      status: "approved",
      submittedAt: "2026-11-04T06:20:00.000Z",
      approvedAt: "2026-11-04T07:12:00.000Z",
    },
    timeline: [
      {
        id: "event-1042-3",
        at: "2026-11-08T07:10:00.000Z",
        title: "Repair started",
        detail: "The device moved to the workbench for flex cable replacement.",
        actor: "Miguel Cruz",
        kind: "repair",
      },
      {
        id: "event-1042-2",
        at: "2026-11-04T07:12:00.000Z",
        title: "Quote approved",
        detail: "Maya approved the PHP 2,400 repair quote.",
        actor: "Maya Santos",
        kind: "approval",
      },
      {
        id: "event-1042-1",
        at: "2026-11-03T02:10:00.000Z",
        title: "Repair request submitted",
        detail: "Maya submitted the headphones for an intermittent audio issue.",
        actor: "Maya Santos",
        kind: "created",
      },
    ],
  },
  {
    id: "RF-1036",
    customerId: "customer-paolo",
    customerName: "Paolo Garcia",
    customerEmail: "paolo.garcia@example.com",
    device: "MacBook Air M3",
    deviceCategory: "Laptop",
    issue: "The laptop shuts down under sustained workloads.",
    priority: "standard",
    status: "triage",
    createdAt: "2026-11-06T05:30:00.000Z",
    updatedAt: "2026-11-08T01:15:00.000Z",
    assignedTechnicianId: "tech-aya",
    timeline: [
      {
        id: "event-1036-2",
        at: "2026-11-08T01:15:00.000Z",
        title: "Technician assigned",
        detail: "Aya will run thermal and board diagnostics.",
        actor: "Service desk",
        kind: "assignment",
      },
      {
        id: "event-1036-1",
        at: "2026-11-06T05:30:00.000Z",
        title: "Repair request submitted",
        detail: "Paolo reported shutdowns during video exports.",
        actor: "Paolo Garcia",
        kind: "created",
      },
    ],
  },
  {
    id: "RF-1029",
    customerId: "customer-ina",
    customerName: "Ina Villanueva",
    customerEmail: "ina.v@example.com",
    device: "iPad Pro 12.9",
    deviceCategory: "Tablet",
    issue: "The USB-C port no longer recognizes chargers or accessories.",
    priority: "urgent",
    status: "submitted",
    createdAt: "2026-11-08T09:12:00.000Z",
    updatedAt: "2026-11-08T09:12:00.000Z",
    timeline: [
      {
        id: "event-1029-1",
        at: "2026-11-08T09:12:00.000Z",
        title: "Repair request submitted",
        detail: "Ina requested an urgent charging port inspection.",
        actor: "Ina Villanueva",
        kind: "created",
      },
    ],
  },
  {
    id: "RF-1017",
    customerId: "customer-omar",
    customerName: "Omar Dela Cruz",
    customerEmail: "omar.dc@example.com",
    device: "Nintendo Switch OLED",
    deviceCategory: "Console",
    issue: "The console overheats and the fan makes a grinding sound.",
    priority: "standard",
    status: "ready-for-pickup",
    createdAt: "2026-10-29T03:40:00.000Z",
    updatedAt: "2026-11-08T06:30:00.000Z",
    estimatedCompletion: "2026-11-08T06:30:00.000Z",
    assignedTechnicianId: "tech-noah",
    diagnosis: "The cooling fan bearing failed and the heat sink was obstructed by dust.",
    quote: {
      parts: 1250,
      labor: 850,
      total: 2100,
      status: "approved",
      submittedAt: "2026-10-30T05:10:00.000Z",
      approvedAt: "2026-10-30T06:45:00.000Z",
    },
    repairSummary: "Replaced the cooling fan, cleaned the heat sink, and passed a 90 minute thermal stress test.",
    timeline: [
      {
        id: "event-1017-3",
        at: "2026-11-08T06:30:00.000Z",
        title: "Ready for pickup",
        detail: "Thermal testing passed and the console is ready at the service desk.",
        actor: "Noah Reyes",
        kind: "repair",
      },
      {
        id: "event-1017-2",
        at: "2026-10-31T01:20:00.000Z",
        title: "Repair started",
        detail: "Fan replacement and internal cleaning began.",
        actor: "Noah Reyes",
        kind: "repair",
      },
      {
        id: "event-1017-1",
        at: "2026-10-29T03:40:00.000Z",
        title: "Repair request submitted",
        detail: "Omar reported overheating during gameplay.",
        actor: "Omar Dela Cruz",
        kind: "created",
      },
    ],
  },
];

function activityFromTickets(source: RepairTicket[]): RepairActivity[] {
  return source
    .flatMap((ticket) =>
      ticket.timeline.map((event) => ({ ...event, ticketId: ticket.id })),
    )
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 14);
}

export function createSeedState(): RepairState {
  const freshTickets = structuredClone(tickets);

  return {
    version: 1,
    currentRole: "administrator",
    selectedTicketId: "RF-1029",
    tickets: freshTickets,
    technicians: structuredClone(technicians),
    inventory: structuredClone(inventory),
    activity: activityFromTickets(freshTickets),
  };
}
