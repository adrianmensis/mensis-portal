import { withAuth, json } from "@/lib/api/middleware";
import { getOpportunity, updateOpportunity, type UpdateOpportunityInput } from "@/lib/services/opportunities";

export const GET = withAuth(async ({ supabase, params }) => {
  const opp = await getOpportunity(supabase, params.id);
  if (!opp) return json({ error: "Oportunidad no encontrada." }, 404);
  return json(opp);
});

// Partner-or-admin update. The service strips fields the caller can't edit
// (partners never write provisioning) and gates stage changes on the
// client-request block being complete.
export const PATCH = withAuth(async ({ supabase, user, request, params }) => {
  const body = (await request.json().catch(() => ({}))) as UpdateOpportunityInput;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = (profile as { role?: string } | null)?.role === "admin";
  try {
    const opp = await updateOpportunity(supabase, params.id, body, { isAdmin, userId: user.id });
    return json(opp);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Failed" }, 400);
  }
});
