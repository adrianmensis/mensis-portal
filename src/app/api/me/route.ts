import { withAuth, json } from "@/lib/api/middleware";

export const GET = withAuth(async ({ supabase, user }) => {
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!data) return json({ error: "Profile not found" }, 404);
  return data;
});
