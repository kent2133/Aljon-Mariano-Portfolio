import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/database.types";
import type { CurrentUser } from "./types";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, phone, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("memberships")
      .select("id, organization_id, role, organizations(name, slug)")
      .eq("user_id", user.id)
      .eq("status", "active"),
  ]);

  return {
    user,
    profile: {
      id: user.id,
      email: profile?.email ?? user.email ?? "",
      fullName:
        profile?.full_name ??
        String(user.user_metadata.full_name ?? user.email?.split("@")[0] ?? "User"),
      phone: profile?.phone ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    },
    memberships: (memberships ?? []).map((membership) => {
      const organization = membership.organizations as unknown as {
        name: string;
        slug: string;
      } | null;

      return {
        id: membership.id,
        organizationId: membership.organization_id,
        organizationName: organization?.name ?? "RepairFlow workspace",
        organizationSlug: organization?.slug ?? "workspace",
        role: membership.role as AppRole,
      };
    }),
  };
}
