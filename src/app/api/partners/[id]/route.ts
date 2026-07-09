import { withPartnerAdmin, json } from "@/lib/api/middleware";
import { getPartner, updatePartner, deletePartner, type UpdatePartnerInput } from "@/lib/services/partners";

export const GET = withPartnerAdmin(async ({ supabase, params }) => {
  const partner = await getPartner(supabase, params.id);
  if (!partner) return json({ error: "Partner no encontrado." }, 404);
  return json(partner);
});

// The service whitelists the writable columns and refuses to touch a Mensis
// staff account, so the body goes straight through.
export const PATCH = withPartnerAdmin(async ({ admin, request, params }) => {
  const body = (await request.json().catch(() => ({}))) as UpdatePartnerInput;
  try {
    return json(await updatePartner(admin, params.id, body));
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Failed" }, 400);
  }
});

// Cascades: the partner's opportunities are deleted with the auth user.
export const DELETE = withPartnerAdmin(async ({ admin, params }) => {
  try {
    return json(await deletePartner(admin, params.id));
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Failed" }, 400);
  }
});
