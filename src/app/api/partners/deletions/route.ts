import { withPartnerAdmin, json } from "@/lib/api/middleware";
import { listPartnerDeletions } from "@/lib/services/partners";

// Bitácora de partners eliminados. Solo lectura: las filas las escribe
// DELETE /api/partners/[id] y nunca se editan ni se borran.
export const GET = withPartnerAdmin(async ({ supabase }) => {
  try {
    return json(await listPartnerDeletions(supabase));
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Failed" }, 400);
  }
});
