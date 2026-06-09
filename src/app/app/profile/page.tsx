import { requireProfile } from "@/lib/auth/profile";
import { fmtDate } from "@/lib/format";
import { countryLabel } from "@/lib/countries";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { logout } from "../../login/actions";

export const metadata = { title: "Mi perfil · Mensis Partner Portal" };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-right text-sm font-medium text-zinc-800">{value || "—"}</span>
    </div>
  );
}

export default async function ProfilePage() {
  const p = await requireProfile();
  const isPartner = p.role === "partner";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader title="Mi perfil" subtitle="Tu información en el portal." />

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center gap-4 border-b border-zinc-100 bg-zinc-50/50 p-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
            {(p.full_name ?? p.email ?? "?")[0]?.toUpperCase()}
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold text-zinc-900">{p.full_name ?? "—"}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">{p.email}</span>
              <Badge tone={p.role === "admin" ? "brand" : "emerald"}>
                {p.role === "admin" ? "Admin" : "Partner"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-zinc-100 px-6 py-2">
          <Row label="País de residencia" value={countryLabel(p.country)} />
          <Row label="Teléfono" value={p.phone} />
          {isPartner && (
            <Row
              label="LinkedIn"
              value={
                p.linkedin_url ? (
                  <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                    Ver perfil ↗
                  </a>
                ) : null
              }
            />
          )}
          {isPartner && <Row label="Fecha de ingreso" value={p.entry_date ? fmtDate(p.entry_date) : null} />}
          {isPartner && <Row label="Referido de Mensis" value={p.referred_by} />}
        </div>
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
