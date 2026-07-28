import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

// Service-role client — bypasses RLS. Use ONLY in server actions / route
// handlers for privileged admin operations (creating partner accounts,
// resetting passwords). Never import this into client components.
export function createAdminClient() {
  return createClient(
    supabaseEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    supabaseEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
