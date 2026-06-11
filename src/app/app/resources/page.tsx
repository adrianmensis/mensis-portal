import { requireProfile } from "@/lib/auth/profile";
import { PageHeader } from "@/components/ui/page-header";
import { AcademyLibrary } from "@/components/support/academy-library";
import { MaterialLibrary } from "@/components/support/material-library";
import { UploadedMaterials } from "@/components/support/uploaded-materials";

export const metadata = { title: "Material de apoyo · Mensis Partner Portal" };

export default async function ResourcesPage() {
  const profile = await requireProfile();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Material de apoyo"
        subtitle="Academia, guías de implementación, casos de uso y material de marketing."
      />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Academia</h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Listas de reproducción de formación, organizadas por tema.
          </p>
        </div>
        <AcademyLibrary />
      </section>

      <UploadedMaterials isAdmin={profile.role === "admin"} />

      <MaterialLibrary />
    </div>
  );
}
