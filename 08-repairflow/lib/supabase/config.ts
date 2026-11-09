export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

function normalized(value: string | undefined) {
  return value?.trim() || "";
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = normalized(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = normalized(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!url || !publishableKey) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") return null;
  } catch {
    return null;
  }

  return { url, publishableKey };
}

export function isSupabaseConfigured() {
  return getSupabasePublicConfig() !== null;
}

export function requireSupabasePublicConfig() {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return config;
}
