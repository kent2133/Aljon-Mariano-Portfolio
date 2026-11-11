import { describe, expect, it } from "vitest";
import { createSeedState, DEMO_TECHNICIAN_ID } from "../../lib/repair-data";
import { repairReducer } from "../../lib/repair-store";
import type { RepairState } from "../../lib/repair-types";
import {
  getNextTutorialStep,
  getTutorialTicket,
  isDeclinedDecision,
  isTutorialStepComplete,
} from "./workspace-guide-logic";

const times = {
  assign: "2026-11-11T01:00:00.000Z",
  diagnose: "2026-11-11T01:10:00.000Z",
  quote: "2026-11-11T01:20:00.000Z",
  decide: "2026-11-11T01:30:00.000Z",
  revise: "2026-11-11T01:40:00.000Z",
  decideAgain: "2026-11-11T01:50:00.000Z",
  start: "2026-11-11T02:00:00.000Z",
  complete: "2026-11-11T03:00:00.000Z",
  pickup: "2026-11-11T03:20:00.000Z",
};

describe("RepairFlow workspace tutorial", () => {
  it("starts with an administrator assignment on a dedicated submitted ticket", () => {
    const seeded = createSeedState();
    const tutorial = repairReducer(seeded, { type: "start-tutorial" });
    const ticket = getTutorialTicket(tutorial);

    expect(tutorial.currentRole).toBe("administrator");
    expect(tutorial.selectedTicketId).toBe("RF-1048");
    expect(ticket).toMatchObject({ status: "submitted" });
    expect(ticket?.assignedTechnicianId).toBeUndefined();
    expect(ticket?.diagnosis).toBeUndefined();
    expect(ticket?.quote).toBeUndefined();
    expect(isTutorialStepComplete("admin-assign", tutorial)).toBe(false);
    expect(tutorial.technicians.find((item) => item.id === DEMO_TECHNICIAN_ID)?.activeTickets).toBe(
      seeded.technicians.find((item) => item.id === DEMO_TECHNICIAN_ID)!.activeTickets - 1,
    );
  });

  it("covers administrator, technician, customer, and handoff on the approval path", () => {
    let state = reachFirstDecision();
    state = repairReducer(state, { type: "approve-quote", ticketId: "RF-1048", now: times.decide });

    expect(isTutorialStepComplete("quote-decision", state)).toBe(true);
    expect(isDeclinedDecision("quote-decision", state)).toBe(false);
    expect(getNextTutorialStep("quote-decision", state)).toBe("switch-technician-repair");

    state = repairReducer(state, { type: "set-role", role: "technician" });
    expect(isTutorialStepComplete("switch-technician-repair", state)).toBe(true);
    state = repairReducer(state, { type: "start-repair", ticketId: "RF-1048", now: times.start });
    expect(isTutorialStepComplete("start-repair", state)).toBe(true);
    state = repairReducer(state, {
      type: "complete-repair",
      ticketId: "RF-1048",
      summary: "Replaced the OLED assembly and passed touch, display, and seal tests.",
      now: times.complete,
    });
    expect(isTutorialStepComplete("complete-repair", state)).toBe(true);

    state = repairReducer(state, { type: "set-role", role: "administrator" });
    expect(isTutorialStepComplete("switch-administrator-handoff", state)).toBe(true);
    state = repairReducer(state, { type: "confirm-pickup", ticketId: "RF-1048", now: times.pickup });
    expect(isTutorialStepComplete("confirm-pickup", state)).toBe(true);
    expect(getNextTutorialStep("confirm-pickup", state)).toBeNull();
  });

  it("branches into quote revision when the customer declines and rejoins after approval", () => {
    let state = reachFirstDecision();
    state = repairReducer(state, { type: "decline-quote", ticketId: "RF-1048", now: times.decide });

    expect(isTutorialStepComplete("quote-decision", state)).toBe(true);
    expect(isDeclinedDecision("quote-decision", state)).toBe(true);
    expect(getNextTutorialStep("quote-decision", state)).toBe("switch-technician-revise");

    state = repairReducer(state, { type: "set-role", role: "technician" });
    expect(isTutorialStepComplete("switch-technician-revise", state)).toBe(true);
    state = repairReducer(state, {
      type: "submit-quote",
      ticketId: "RF-1048",
      quote: { parts: 8600, labor: 1700 },
      now: times.revise,
    });
    expect(isTutorialStepComplete("revise-quote", state)).toBe(true);
    expect(getNextTutorialStep("revise-quote", state)).toBe("switch-customer-revised");

    state = repairReducer(state, { type: "set-role", role: "customer" });
    state = repairReducer(state, { type: "approve-quote", ticketId: "RF-1048", now: times.decideAgain });
    expect(isTutorialStepComplete("revised-decision", state)).toBe(true);
    expect(getNextTutorialStep("revised-decision", state)).toBe("switch-technician-repair");
  });

  it("keeps repeated declines inside the revision branch instead of stalling", () => {
    let state = reachFirstDecision();
    state = repairReducer(state, { type: "decline-quote", ticketId: "RF-1048", now: times.decide });
    state = repairReducer(state, { type: "set-role", role: "technician" });
    state = repairReducer(state, {
      type: "submit-quote",
      ticketId: "RF-1048",
      quote: { parts: 8200, labor: 1500 },
      now: times.revise,
    });
    state = repairReducer(state, { type: "set-role", role: "customer" });
    state = repairReducer(state, { type: "decline-quote", ticketId: "RF-1048", now: times.decideAgain });

    expect(isTutorialStepComplete("revised-decision", state)).toBe(true);
    expect(isDeclinedDecision("revised-decision", state)).toBe(true);
    expect(getNextTutorialStep("revised-decision", state)).toBe("switch-technician-revise");
  });
});

function reachFirstDecision(): RepairState {
  let state = repairReducer(createSeedState(), { type: "start-tutorial" });
  state = repairReducer(state, {
    type: "assign-technician",
    ticketId: "RF-1048",
    technicianId: DEMO_TECHNICIAN_ID,
    now: times.assign,
  });
  expect(isTutorialStepComplete("admin-assign", state)).toBe(true);

  state = repairReducer(state, { type: "set-role", role: "technician" });
  state = repairReducer(state, {
    type: "record-diagnosis",
    ticketId: "RF-1048",
    diagnosis: "Impact damaged the OLED panel while the frame and main board passed inspection.",
    now: times.diagnose,
  });
  state = repairReducer(state, {
    type: "submit-quote",
    ticketId: "RF-1048",
    quote: { parts: 9200, labor: 1800 },
    now: times.quote,
  });
  state = repairReducer(state, { type: "set-role", role: "customer" });

  expect(isTutorialStepComplete("switch-customer-decision", state)).toBe(true);
  expect(isTutorialStepComplete("quote-decision", state)).toBe(false);
  return state;
}
