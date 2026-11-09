const DEFAULT_AUTH_DESTINATION = "/workspace";

export function safeAuthRedirect(
  candidate: string | null | undefined,
  fallback = DEFAULT_AUTH_DESTINATION,
) {
  if (!candidate) return fallback;

  if (
    candidate.startsWith("/") &&
    !candidate.startsWith("//") &&
    !candidate.includes("\\")
  ) {
    return candidate;
  }

  return fallback;
}
