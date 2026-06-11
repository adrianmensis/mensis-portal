import { withAdmin } from "@/lib/api/middleware";
import { deleteMaterial } from "@/lib/services/materials";

export const DELETE = withAdmin(async ({ admin, params }) => {
  return deleteMaterial(admin, params.id);
});
