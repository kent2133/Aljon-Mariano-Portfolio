import type { User } from "@supabase/supabase-js";
import type { AppRole } from "@/lib/supabase/database.types";

export const APP_ROLES = [
  "owner",
  "administrator",
  "service_advisor",
  "technician",
  "customer",
] as const satisfies readonly AppRole[];

export const ROLE_LABELS: Record<AppRole, string> = {
  owner: "Owner",
  administrator: "Administrator",
  service_advisor: "Service advisor",
  technician: "Technician",
  customer: "Customer",
};

export type OrganizationMembership = {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: AppRole;
};

export type AuthenticatedProfile = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
};

export type CurrentUser = {
  user: User;
  profile: AuthenticatedProfile;
  memberships: OrganizationMembership[];
};
