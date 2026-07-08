import { requireProfile } from "@/lib/auth/profile";
import { PageHeader } from "@/components/ui/page-header";
import { QuotesView } from "@/components/quotes/quotes-view";

export const metadata = { title: "Cotizadores · Mensis Partner Portal" };

export default async function QuotesPage() {
  await requireProfile();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Cotizadores"
        subtitle="Calcula precios y cotizaciones para tus prospectos."
      />

      <QuotesView />
    </div>
  );
}
