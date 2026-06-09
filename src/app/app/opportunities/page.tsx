import { requireProfile } from "@/lib/auth/profile";
import { OpportunitiesTable } from "@/components/opportunities/opportunities-table";

export const metadata = { title: "Opportunities · Mensis Partner Portal" };

export default async function OpportunitiesPage() {
  const profile = await requireProfile();
  return (
    <OpportunitiesTable
      title={profile.role === "admin" ? "Todos los prospectos" : "Mis prospectos"}
    />
  );
}
