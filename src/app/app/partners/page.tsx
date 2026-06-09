import { requireAdmin } from "@/lib/auth/profile";
import { PartnersManager } from "@/components/partners/partners-manager";

export const metadata = { title: "Partners · Mensis Partner Portal" };

export default async function PartnersPage() {
  await requireAdmin();
  return <PartnersManager />;
}
