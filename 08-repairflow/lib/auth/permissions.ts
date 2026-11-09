import type { AppRole } from "@/lib/supabase/database.types";

export const PERMISSIONS = [
  "organization:manage",
  "members:view",
  "members:manage",
  "customers:view",
  "customers:manage",
  "tickets:view",
  "tickets:create",
  "tickets:assign",
  "tickets:update",
  "quotes:view",
  "quotes:manage",
  "quotes:respond",
  "invoices:view",
  "invoices:manage",
  "comments:create",
  "comments:internal",
  "attachments:create",
  "attachments:manage",
  "audit:view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const allPermissions = new Set<Permission>(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<AppRole, ReadonlySet<Permission>> = {
  owner: allPermissions,
  administrator: allPermissions,
  service_advisor: new Set([
    "members:view",
    "customers:view",
    "customers:manage",
    "tickets:view",
    "tickets:create",
    "tickets:assign",
    "tickets:update",
    "quotes:view",
    "quotes:manage",
    "invoices:view",
    "invoices:manage",
    "comments:create",
    "comments:internal",
    "attachments:create",
    "attachments:manage",
  ]),
  technician: new Set([
    "customers:view",
    "tickets:view",
    "tickets:update",
    "quotes:view",
    "comments:create",
    "comments:internal",
    "attachments:create",
  ]),
  customer: new Set([
    "tickets:view",
    "tickets:create",
    "quotes:view",
    "quotes:respond",
    "invoices:view",
    "comments:create",
    "attachments:create",
  ]),
};

export function hasPermission(role: AppRole, permission: Permission) {
  return ROLE_PERMISSIONS[role].has(permission);
}

export function hasAnyPermission(role: AppRole, permissions: Permission[]) {
  return permissions.some((permission) => hasPermission(role, permission));
}
