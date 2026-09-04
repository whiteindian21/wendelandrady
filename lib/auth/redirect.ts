/**
 * Sanitizes a user-supplied redirect target so it can never become an open
 * redirect. Only same-origin, root-relative paths are allowed.
 *
 *   "/dashboard"        → kept
 *   "/dashboard/team"   → kept
 *   "https://evil.com"  → fallback (not root-relative)
 *   "//evil.com"        → fallback (scheme-relative)
 *   "/\evil.com"        → fallback (backslash is treated as "/" by browsers)
 */
export function getSafeRedirectPath(
  raw: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!raw) {
    return fallback;
  }

  if (raw.length > 512) {
    return fallback;
  }

  if (!raw.startsWith("/")) {
    return fallback;
  }

  if (raw.startsWith("//")) {
    return fallback;
  }

  if (raw.includes("\\") || raw.includes("\n") || raw.includes("\r")) {
    return fallback;
  }

  return raw;
}