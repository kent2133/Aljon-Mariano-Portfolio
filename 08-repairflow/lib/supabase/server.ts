import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabasePublicConfig, requireSupabasePublicConfig } from "./config";
import type { Database } from "./database.types";

async function buildServerClient(
  config: NonNullable<ReturnType<typeof getSupabasePublicConfig>>,
) {
  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. Route Handlers and Server
          // Actions can, and the session refresh helper handles middleware writes.
        }
      },
    },
  });
}

export async function createSupabaseServerClient(): Promise<SupabaseClient<Database> | null> {
  const config = getSupabasePublicConfig();
  return config ? buildServerClient(config) : null;
}

export async function requireSupabaseServerClient() {
  return buildServerClient(requireSupabasePublicConfig());
}
