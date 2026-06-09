import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. Use ONLY in server actions / route
// handlers for privileged admin operations (creating partner accounts,
// resetting passwords). Never import this into client components.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
