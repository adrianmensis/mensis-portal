import { withPartnerAdmin, json } from "@/lib/api/middleware";
import { setPartnerActive } from "@/lib/services/partners";

export const POST = withPartnerAdmin(async ({ admin, request, params }) => {
  const body = await request.json().catch(() => ({}));
  if (typeof body.active !== "boolean") return json({ error: "`active` boolean required." }, 400);
  try {
    return json(await setPartnerActive(admin, params.id, body.active));
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Failed" }, 400);
  }
});
