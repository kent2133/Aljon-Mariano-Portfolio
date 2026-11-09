"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";
import type { Database } from "./database.types";

let browserClient: SupabaseClient<Database> | undefined;

export function createSupabaseBrowserClient() {
  const config = getSupabasePublicConfig();
  if (!config) return null;

  browserClient ??= createBrowserClient<Database>(
    config.url,
    config.publishableKey,
  );

  return browserClient;
}
