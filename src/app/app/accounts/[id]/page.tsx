import { requireProfile } from "@/lib/auth/profile";
import { AccountsTable } from "@/components/accounts/accounts-table";

export const metadata = { title: "Cuentas objetivo · Mensis Partner Portal" };

// The accounts inside one use case, with a país filter. Read-only.
export default async function UseCaseAccountsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile();
  const { id } = await params;
  return <AccountsTable useCaseId={id} />;
}
