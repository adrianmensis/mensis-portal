import { withAuth, json } from "@/lib/api/middleware";
import { getDashboard } from "@/lib/services/dashboard";
import type { Profile } from "@/lib/types";

export const GET = withAuth(async ({ supabase, user }) => {
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const profile = data as Profile | null;
  if (!profile) return json({ error: "Profile not found" }, 404);
  return getDashboard(supabase, profile);
});
