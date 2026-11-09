import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";
import type { Database } from "./database.types";

export function createSupabaseAdminClient(): SupabaseClient<Database> | null {
  const config = getSupabasePublicConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!config || !serviceRoleKey) return null;

  return createClient<Database>(config.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function requireSupabaseAdminClient() {
  const client = createSupabaseAdminClient();

  if (!client) {
    throw new Error(
      "The Supabase service role is not configured. Keep SUPABASE_SERVICE_ROLE_KEY on the server only.",
    );
  }

  return client;
}
