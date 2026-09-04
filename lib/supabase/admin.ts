import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Service-role Supabase client.
 *
 * ⚠️  SECURITY: This client BYPASSES Row Level Security.
 *
 * It MUST ONLY be used server-side in trusted contexts where:
 *   - The caller has been independently verified
 *     (e.g., Stripe webhook signature verified BEFORE any DB write)
 *   - All data has been validated before being written
 *
 * NEVER import this from a client component.
 * NEVER expose this client or its key to the browser.
 * NEVER create a public API endpoint that forwards arbitrary
 *   operations through this client.
 *
 * Currently used ONLY by:
 *   - app/api/stripe/webhook/route.ts (after signature verification)
 */

let _admin: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. The Stripe webhook requires this key to process billing events."
    );
  }
  if (!_admin) {
    _admin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _admin;
}