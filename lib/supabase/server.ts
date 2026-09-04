import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

/**
 * Inferred from the installed @supabase/ssr factory — version-proof against
 * supabase-js generic changes.
 */
export type TypedSupabaseClient = Awaited<
  ReturnType<typeof createServerClient<Database>>
>;

/**
 * Server-side Supabase client for Server Components, Server Actions and
 * Route Handlers (Next.js 15 — `cookies()` is async).
 *
 * Uses the public URL + anon key. Sessions are carried in cookies; RLS
 * applies to every query using the caller's JWT.
 */
export async function createClient(): Promise<TypedSupabaseClient> {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example)."
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — cookies cannot be set there.
          // Session refresh happens in middleware.
        }
      },
    },
  });
}