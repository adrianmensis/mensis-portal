import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

export function createClient() {
  return createBrowserClient(
    supabaseEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    supabaseEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}
