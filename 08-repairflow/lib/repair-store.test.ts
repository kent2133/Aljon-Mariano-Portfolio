import { describe, expect, it } from "vitest";
import { createSeedState, DEMO_CUSTOMER_ID } from "./repair-data";
import { getWorkspaceMetrics, repairReducer, ticketsForRole } from "./repair-store";

const times = {
  create: "2026-11-09T01:00:00.000Z",
  assign: "2026-11-09T01:10:00.000Z",
  diagnose: "2026-11-09T01:20:00.000Z",
  quote: "2026-11-09T01:30:00.000Z",
  approve: "2026-11-09T01:40:00.000Z",
  start: "2026-11-09T01:50:00.000Z",
  complete: "2026-11-09T02:50:00.000Z",
  pickup: "2026-11-09T03:15:00.000Z",
};

describe("repairReducer", () => {
  it("creates a customer ticket and makes it the selected repair", () => {
    const initial = repairReducer(createSeedState(), { type: "set-role", role: "customer" });
    const next = repairReducer(initial, {
      type: "create-ticket",
      id: "RF-1200",
      now: times.create,
      input: {
        device: "Galaxy S25",
        deviceCategory: "Smartphone",
        issue: "The device does not charge with a verified working cable.",
        priority: "urgent",
      },
    });

    expect(next.selectedTicketId).toBe("RF-1200");
    expect(next.tickets).toHaveLength(initial.tickets.length + 1);
    expect(next.tickets[0]).toMatchObject({
      id: "RF-1200",
      customerId: DEMO_CUSTOMER_ID,
      status: "submitted",
      priority: "urgent",
    });
    expect(next.activity[0]).toMatchObject({ ticketId: "RF-1200", kind: "created" });
  });

  it("moves one repair through the complete connected workflow", () => {
    let state = repairReducer(createSeedState(), { type: "set-role", role: "customer" });
    state = repairReducer(state, {
      type: "create-ticket",
      id: "RF-1201",
      now: times.create,
      input: {
        device: "Steam Deck OLED",
        deviceCategory: "Console",
        issue: "The right trigger no longer registers a full press.",
        priority: "standard",
      },
    });

    state = repairReducer(state, { type: "set-role", role: "administrator" });
    const technicianLoadBefore = state.technicians.find((item) => item.id === "tech-noah")!.activeTickets;
    state = repairReducer(state, {
      type: "assign-technician",
      ticketId: "RF-1201",
      technicianId: "tech-noah",
      now: times.assign,
    });
    expect(ticket(state, "RF-1201")).toMatchObject({ status: "triage", assignedTechnicianId: "tech-noah" });
    expect(state.technicians.find((item) => item.id === "tech-noah")!.activeTickets).toBe(technicianLoadBefore + 1);

    state = repairReducer(state, { type: "set-role", role: "technician" });
    state = repairReducer(state, {
      type: "record-diagnosis",
      ticketId: "RF-1201",
      diagnosis: "The trigger spring fractured. The sensor and main board passed inspection.",
      now: times.diagnose,
    });
    expect(ticket(state, "RF-1201").diagnosis).toContain("trigger spring");

    state = repairReducer(state, {
      type: "submit-quote",
      ticketId: "RF-1201",
      quote: { parts: 1200, labor: 800 },
      now: times.quote,
    });
    expect(ticket(state, "RF-1201")).toMatchObject({
      status: "awaiting-approval",
      quote: { parts: 1200, labor: 800, total: 2000, status: "pending" },
    });

    state = repairReducer(state, { type: "set-role", role: "customer" });
    state = repairReducer(state, { type: "approve-quote", ticketId: "RF-1201", now: times.approve });
    expect(ticket(state, "RF-1201")).toMatchObject({ status: "approved", quote: { status: "approved" } });

    state = repairReducer(state, { type: "set-role", role: "technician" });
    state = repairReducer(state, { type: "start-repair", ticketId: "RF-1201", now: times.start });
    expect(ticket(state, "RF-1201").status).toBe("in-repair");

    state = repairReducer(state, {
      type: "complete-repair",
      ticketId: "RF-1201",
      summary: "Replaced the trigger spring and passed input calibration tests.",
      now: times.complete,
    });
    expect(ticket(state, "RF-1201")).toMatchObject({
      status: "ready-for-pickup",
      repairSummary: "Replaced the trigger spring and passed input calibration tests.",
    });

    state = repairReducer(state, { type: "set-role", role: "customer" });
    state = repairReducer(state, { type: "confirm-pickup", ticketId: "RF-1201", now: times.pickup });
    const complete = ticket(state, "RF-1201");
    expect(complete.status).toBe("completed");
    expect(complete.timeline[0]).toMatchObject({ kind: "pickup", title: "Repair completed" });
    expect(complete.timeline).toHaveLength(8);
    expect(state.activity[0]).toMatchObject({ ticketId: "RF-1201", kind: "pickup" });
    expect(state.technicians.find((item) => item.id === "tech-noah")!.activeTickets).toBe(technicianLoadBefore);
  });

  it("rejects transitions that do not match the current ticket state", () => {
    const initial = createSeedState();
    const next = repairReducer(initial, {
      type: "start-repair",
      ticketId: "RF-1029",
      now: times.start,
    });
    const quoteAttempt = repairReducer(initial, {
      type: "submit-quote",
      ticketId: "RF-1036",
      quote: { parts: 1000, labor: 500 },
      now: times.quote,
    });

    expect(next).toBe(initial);
    expect(quoteAttempt).toBe(initial);
  });

  it("filters the queue when switching role perspectives", () => {
    const initial = createSeedState();
    const customerTickets = ticketsForRole({ ...initial, currentRole: "customer" });
    const technicianTickets = ticketsForRole({ ...initial, currentRole: "technician" });
    const adminTickets = ticketsForRole(initial);

    expect(customerTickets.every((item) => item.customerId === DEMO_CUSTOMER_ID)).toBe(true);
    expect(technicianTickets.every((item) => item.assignedTechnicianId === "tech-noah")).toBe(true);
    expect(adminTickets).toHaveLength(initial.tickets.length);
  });

  it("recalculates customer metrics after quote approval", () => {
    let state = repairReducer(createSeedState(), { type: "set-role", role: "customer" });
    const before = getWorkspaceMetrics(state);
    state = repairReducer(state, {
      type: "approve-quote",
      ticketId: "RF-1048",
      now: times.approve,
    });
    const after = getWorkspaceMetrics(state);

    expect(before.find((metric) => metric.label === "Needs your approval")?.value).toBe("1");
    expect(after.find((metric) => metric.label === "Needs your approval")?.value).toBe("0");
  });

  it("returns a declined quote to the technician for revision", () => {
    let state = repairReducer(createSeedState(), { type: "set-role", role: "customer" });
    state = repairReducer(state, {
      type: "decline-quote",
      ticketId: "RF-1048",
      now: times.approve,
    });

    expect(ticket(state, "RF-1048")).toMatchObject({
      status: "triage",
      quote: { status: "declined" },
    });
    expect(ticket(state, "RF-1048").timeline[0]).toMatchObject({
      title: "Quote declined",
      kind: "approval",
    });
  });

  it("restores the original seeded state", () => {
    const changed = repairReducer(createSeedState(), { type: "set-role", role: "customer" });
    const reset = repairReducer(changed, { type: "reset-demo" });

    expect(reset.currentRole).toBe("administrator");
    expect(reset.selectedTicketId).toBe("RF-1029");
    expect(reset.tickets).toHaveLength(5);
  });
});

function ticket(state: ReturnType<typeof createSeedState>, id: string) {
  const found = state.tickets.find((item) => item.id === id);
  if (!found) throw new Error(`Missing test ticket ${id}`);
  return found;
}
