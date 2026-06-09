import { withAdmin } from "@/lib/api/middleware";
import { resetPartnerPassword } from "@/lib/services/partners";

export const POST = withAdmin(async ({ admin, params }) => {
  return resetPartnerPassword(admin, params.id);
});
