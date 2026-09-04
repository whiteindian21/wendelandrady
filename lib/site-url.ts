/**
 * Canonical site URL for OAuth/email redirect targets.
 *
 * Env-driven and never hardcoded: development uses localhost, production is
 * whatever domain the boilerplate buyer deploys under (set
 * NEXT_PUBLIC_SITE_URL). The marketing product URL in config/site.ts is a
 * separate concern and is never used for auth redirects.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;

  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.trim().replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}