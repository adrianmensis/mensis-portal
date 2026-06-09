import { requireProfile } from "@/lib/auth/profile";
import { PageHeader } from "@/components/ui/page-header";
import { QuotesView } from "@/components/quotes/quotes-view";

export const metadata = { title: "Cotizadores · Mensis Partner Portal" };

const EXTERNAL_TOOLS = [
  {
    title: "ROI Calculator (sitio Mensis)",
    description: "Estima el retorno de inversión para presentar a tus prospectos.",
    url: "https://mensismentor.com",
  },
];

export default async function QuotesPage() {
  await requireProfile();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Cotizadores"
        subtitle="Calcula precios y cotizaciones para tus prospectos."
      />

      <QuotesView />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Otras herramientas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXTERNAL_TOOLS.map((t) => (
            <a
              key={t.title}
              href={t.url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <h3 className="text-sm font-semibold text-zinc-800">{t.title}</h3>
              <p className="flex-1 text-xs text-zinc-500">{t.description}</p>
              <span className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-brand">
                Abrir
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7" /><path d="M7 7h10v10" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
