import { requireProfile } from "@/lib/auth/profile";
import { UseCaseGrid } from "@/components/accounts/use-case-grid";

export const metadata = { title: "Cuentas objetivo · Mensis Partner Portal" };

// Entry point: a grid of use-case cards. Any signed-in user can browse; the
// list itself is read-only for now.
export default async function AccountsPage() {
  await requireProfile();
  return <UseCaseGrid />;
}
