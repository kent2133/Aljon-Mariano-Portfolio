import { describe, expect, it } from "vitest";
import { can } from "./rbac";

describe("portfolio demo permissions", () => {
  it("keeps requester actions narrower than technician actions", () => {
    expect(can("pulsedesk", "requester", "ticket:create")).toBe(true);
    expect(can("pulsedesk", "requester", "ticket:resolve")).toBe(false);
    expect(can("pulsedesk", "technician", "ticket:resolve")).toBe(true);
  });

  it("requires an approver for final approval", () => {
    expect(can("approve", "reviewer", "request:approve")).toBe(false);
    expect(can("approve", "approver", "request:approve")).toBe(true);
  });
});
