export const systemIds = ["pulsedesk", "stockflow", "approve", "carequeue", "routeops"] as const;

export type SystemId = (typeof systemIds)[number];

export type DemoRole = {
  id: string;
  label: string;
  name: string;
  email: string;
  description: string;
};

export type SystemMeta = {
  id: SystemId;
  index: string;
  name: string;
  descriptor: string;
  eyebrow: string;
  summary: string;
  href: string;
  accent: string;
  accentRgb: string;
  glyph: string;
  roles: readonly DemoRole[];
};

export const systemCatalog: readonly SystemMeta[] = [
  {
    id: "pulsedesk",
    index: "01",
    name: "PulseDesk",
    descriptor: "Service desk + assets",
    eyebrow: "IT OPERATIONS",
    summary: "Resolve support requests, protect service levels, and keep every assigned device accountable.",
    href: "/pulsedesk",
    accent: "#53d8ff",
    accentRgb: "83, 216, 255",
    glyph: "PD",
    roles: [
      { id: "requester", label: "Requester", name: "Mara Santos", email: "mara@northstar.demo", description: "Creates and follows support requests" },
      { id: "technician", label: "Technician", name: "Aljon Mariano", email: "aljon@northstar.demo", description: "Triages, assigns, and resolves tickets" },
      { id: "administrator", label: "Administrator", name: "Jordan Lee", email: "jordan@northstar.demo", description: "Manages service rules, people, and assets" },
    ],
  },
  {
    id: "stockflow",
    index: "02",
    name: "StockFlow",
    descriptor: "Inventory + procurement",
    eyebrow: "SUPPLY OPERATIONS",
    summary: "Move stock with confidence from supplier order through receiving, storage, and replenishment.",
    href: "/stockflow",
    accent: "#b8f34a",
    accentRgb: "184, 243, 74",
    glyph: "SF",
    roles: [
      { id: "clerk", label: "Warehouse clerk", name: "Nico Reyes", email: "nico@harbor.demo", description: "Receives and counts physical stock" },
      { id: "purchaser", label: "Purchaser", name: "Aya Lim", email: "aya@harbor.demo", description: "Creates orders and manages suppliers" },
      { id: "manager", label: "Operations manager", name: "Rina Cruz", email: "rina@harbor.demo", description: "Approves spend and monitors inventory health" },
    ],
  },
  {
    id: "approve",
    index: "03",
    name: "Approve",
    descriptor: "Controlled document workflow",
    eyebrow: "GOVERNANCE",
    summary: "Turn requests, evidence, review, and final decisions into one traceable approval record.",
    href: "/approve",
    accent: "#a98cff",
    accentRgb: "169, 140, 255",
    glyph: "AP",
    roles: [
      { id: "submitter", label: "Submitter", name: "Emil Navarro", email: "emil@aperture.demo", description: "Creates requests and supplies evidence" },
      { id: "reviewer", label: "Reviewer", name: "Sofia Tan", email: "sofia@aperture.demo", description: "Checks completeness and recommends decisions" },
      { id: "approver", label: "Approver", name: "Dani Villanueva", email: "dani@aperture.demo", description: "Makes controlled final decisions" },
    ],
  },
  {
    id: "carequeue",
    index: "04",
    name: "CareQueue",
    descriptor: "Appointments + live queue",
    eyebrow: "SERVICE DELIVERY",
    summary: "Coordinate bookings, arrivals, providers, and a calm live queue without losing the human context.",
    href: "/carequeue",
    accent: "#ff8b6b",
    accentRgb: "255, 139, 107",
    glyph: "CQ",
    roles: [
      { id: "client", label: "Client", name: "Jamie Garcia", email: "jamie@care.demo", description: "Books and monitors an appointment" },
      { id: "receptionist", label: "Receptionist", name: "Bea Ramos", email: "bea@care.demo", description: "Checks in clients and controls the queue" },
      { id: "provider", label: "Provider", name: "Dr. Luis Flores", email: "luis@care.demo", description: "Calls, serves, and completes visits" },
    ],
  },
  {
    id: "routeops",
    index: "05",
    name: "RouteOps",
    descriptor: "Field service + dispatch",
    eyebrow: "FIELD OPERATIONS",
    summary: "Assign work, understand field capacity, and follow every visit from dispatch to proof of completion.",
    href: "/routeops",
    accent: "#ffb547",
    accentRgb: "255, 181, 71",
    glyph: "RO",
    roles: [
      { id: "dispatcher", label: "Dispatcher", name: "Kai Mendoza", email: "kai@vector.demo", description: "Plans routes and assigns field work" },
      { id: "technician", label: "Field technician", name: "Paolo Diaz", email: "paolo@vector.demo", description: "Updates visits and captures completion proof" },
      { id: "administrator", label: "Administrator", name: "Sam Ong", email: "sam@vector.demo", description: "Manages teams, territories, and service rules" },
    ],
  },
] as const;

export function getSystemMeta(id: string) {
  return systemCatalog.find((system) => system.id === id);
}

export function isSystemId(value: string): value is SystemId {
  return systemIds.includes(value as SystemId);
}
