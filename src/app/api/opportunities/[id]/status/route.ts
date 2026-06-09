import { withAdmin, json } from "@/lib/api/middleware";
import { updateOpportunityStatus } from "@/lib/services/opportunities";
import type { OpportunityStatus } from "@/lib/types";

export const POST = withAdmin(async ({ admin, request, params }) => {
  const body = await request.json().catch(() => ({}));
  const status = String(body.status ?? "") as OpportunityStatus;
  try {
    return await updateOpportunityStatus(admin, params.id, status);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Failed" }, 400);
  }
});
