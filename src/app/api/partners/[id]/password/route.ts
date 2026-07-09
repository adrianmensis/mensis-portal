import { withPartnerAdmin, json } from "@/lib/api/middleware";
import { resetPartnerPassword } from "@/lib/services/partners";

export const POST = withPartnerAdmin(async ({ admin, params }) => {
  try {
    return json(await resetPartnerPassword(admin, params.id));
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Failed" }, 400);
  }
});
