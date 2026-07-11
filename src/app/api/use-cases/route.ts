import { withAuth } from "@/lib/api/middleware";
import { listUseCases } from "@/lib/services/accounts";

export const GET = withAuth(async ({ supabase }) => {
  return listUseCases(supabase);
});
