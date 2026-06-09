import { withAdmin, json } from "@/lib/api/middleware";
import { setPartnerActive } from "@/lib/services/partners";

export const POST = withAdmin(async ({ admin, request, params }) => {
  const body = await request.json().catch(() => ({}));
  if (typeof body.active !== "boolean") return json({ error: "`active` boolean required." }, 400);
  return setPartnerActive(admin, params.id, body.active);
});
