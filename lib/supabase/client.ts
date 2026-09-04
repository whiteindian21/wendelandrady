import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * Inferred from the installed @supabase/ssr factory — stays correct across
 * supabase-js version changes (the SupabaseClient generics differ between
 * minor versions, so hand-annotating them breaks on upgrades).
 */
export type TypedSupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

let browserClient: TypedSupabaseClient | undefined;

/**
 * Browser-side Supabase client (singleton).
 *
 * Uses the public URL + anon key only. All database access from the browser
 * is subject to Row Level Security — the anon key can never bypass policies.
 */
export function createClient(): TypedSupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example)."
    );
  }

  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}