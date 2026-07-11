import { withAuth } from "@/lib/api/middleware";
import { listTargetAccounts } from "@/lib/services/accounts";

// Read-only: the accounts inside a use case (?use_case=<id>), or all of them.
export const GET = withAuth(async ({ supabase, request }) => {
  const useCase = new URL(request.url).searchParams.get("use_case") ?? undefined;
  return listTargetAccounts(supabase, useCase);
});
