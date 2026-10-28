import type { SystemId } from "./systems";

export const permissions: Record<SystemId, Record<string, readonly string[]>> = {
  pulsedesk: {
    requester: ["ticket:create", "ticket:comment"],
    technician: ["ticket:create", "ticket:comment", "ticket:assign", "ticket:resolve", "asset:view"],
    administrator: ["ticket:create", "ticket:comment", "ticket:assign", "ticket:resolve", "asset:view", "asset:manage", "settings:manage"],
  },
  stockflow: {
    clerk: ["stock:receive", "stock:count", "movement:view"],
    purchaser: ["purchase:create", "purchase:submit", "supplier:manage", "movement:view"],
    manager: ["purchase:create", "purchase:submit", "purchase:approve", "stock:adjust", "supplier:manage", "movement:view"],
  },
  approve: {
    submitter: ["request:create", "request:comment", "request:withdraw"],
    reviewer: ["request:comment", "request:review", "request:return"],
    approver: ["request:comment", "request:review", "request:approve", "request:reject"],
  },
  carequeue: {
    client: ["appointment:create", "appointment:cancel", "queue:view"],
    receptionist: ["appointment:create", "appointment:reschedule", "queue:checkin", "queue:skip", "queue:view"],
    provider: ["queue:call", "queue:serve", "queue:complete", "queue:view"],
  },
  routeops: {
    dispatcher: ["job:create", "job:assign", "route:optimize", "job:view"],
    technician: ["job:view", "job:depart", "job:arrive", "job:complete", "proof:add"],
    administrator: ["job:create", "job:assign", "route:optimize", "job:view", "job:depart", "job:arrive", "job:complete", "proof:add", "settings:manage"],
  },
};

export function can(system: SystemId, role: string, action: string) {
  return permissions[system]?.[role]?.includes(action) ?? false;
}
