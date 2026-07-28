"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { downloadCsv, stampedFilename, toCsv, type CsvColumn } from "@/lib/csv";
import { partnerCode } from "@/lib/format";
import { countryByCode, countryLabel } from "@/lib/countries";
import { partnerHealth, HEALTH_LABELS } from "@/lib/partner-health";
import {
  PARTNER_CATEGORY_LABELS,
  PARTNER_STAGE_TONES,
  ROLE_LABELS,
  isPartnerStage,
  type PartnerStage,
} from "@/lib/types";
import type { PartnerWithCount } from "@/lib/services/partners";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/spinner";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/table";
import { CreatePartnerModal } from "./create-partner-modal";
import { PartnerDeletionsModal } from "./partner-deletions-modal";
import { PartnerHealthBadge } from "./partner-health-badge";
import { PartnersOverview, computeStats } from "./partners-overview";
import { PartnerStatusToggle } from "./partner-status-toggle";

// Filas por página. La lista completa ya viene del API y se pagina en el
// cliente: con la red actual (decenas) sobra, y así el panel, el buscador y la
// descarga siguen viendo el total sin pedir nada extra.
const PAGE_SIZE = 15;

// Columnas del CSV. Van más campos que en la tabla: el archivo es para
// trabajarlo fuera (Excel, reportes), no para leerlo en pantalla.
const CSV_COLUMNS: CsvColumn<PartnerWithCount>[] = [
  { header: "Código", value: (p) => partnerCode(p.seq) },
  { header: "Nombre", value: (p) => p.full_name },
  { header: "Correo", value: (p) => p.email },
  { header: "Rol", value: (p) => ROLE_LABELS[p.role] },
  { header: "Categoría", value: (p) => (p.category ? PARTNER_CATEGORY_LABELS[p.category] : "") },
  { header: "Etapa", value: (p) => p.process_stage },
  { header: "País", value: (p) => countryByCode(p.country)?.name ?? p.country },
  { header: "Teléfono", value: (p) => p.phone },
  { header: "Fecha de ingreso", value: (p) => p.entry_date },
  { header: "Sitio web o LinkedIn", value: (p) => p.linkedin_url },
  { header: "Referido por", value: (p) => p.referred_by },
  { header: "Referencia", value: (p) => p.reference },
  { header: "Oportunidades", value: (p) => p.opportunity_count },
  {
    header: "Última oportunidad",
    value: (p) => (p.last_opportunity_at ? p.last_opportunity_at.slice(0, 10) : ""),
  },
  { header: "Salud", value: (p) => HEALTH_LABELS[partnerHealth(p).health] },
  { header: "Estado", value: (p) => (p.active ? "Activo" : "Inactivo") },
  { header: "Registrado", value: (p) => p.created_at.slice(0, 10) },
];

export function PartnersManager() {
  const router = useRouter();
  const { data: partners, loading, error, reload } = useResource(() => api.partners.list());
  const [showDeletions, setShowDeletions] = useState(false);
  const [stageFilter, setStageFilter] = useState<PartnerStage | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  // El panel siempre resume la red completa: filtrar la tabla no cambia los
  // totales de arriba.
  const stats = useMemo(() => computeStats(partners ?? []), [partners]);

  // Buscar por nombre, correo, código o país cubre lo que se tiene a mano al
  // buscar a alguien — sobre todo el correo, para saber si ya está cargado.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (partners ?? []).filter((p) => {
      if (stageFilter && p.process_stage !== stageFilter) return false;
      if (!q) return true;
      return [p.full_name, p.email, partnerCode(p.seq), countryByCode(p.country)?.name]
        .some((field) => field?.toLowerCase().includes(q));
    });
  }, [partners, stageFilter, query]);

  // Un filtro puede dejar menos páginas de las que había: sin esto la tabla se
  // queda en una página vacía.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  const filtering = stageFilter !== null || query.trim() !== "";

  function applyStageFilter(stage: PartnerStage | null) {
    setStageFilter(stage);
    setPage(0);
  }

  function applyQuery(value: string) {
    setQuery(value);
    setPage(0);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Partners"
        subtitle={
          partners ? `${partners.length} partner${partners.length === 1 ? "" : "s"} in the network.` : undefined
        }
        action={
          <div className="flex items-center gap-2">
            <SecondaryAction onClick={() => setShowDeletions(true)}>
              <TrashIcon />
              Eliminados
            </SecondaryAction>
            {/* Baja lo que está filtrado, no solo la página visible. */}
            <SecondaryAction
              onClick={() => downloadCsv(stampedFilename("partners"), toCsv(CSV_COLUMNS, filtered))}
              disabled={filtered.length === 0}
            >
              <DownloadIcon />
              Descargar
            </SecondaryAction>
            <CreatePartnerModal onCreated={reload} />
          </div>
        }
      />

      {loading && <LoadingRow label="Loading partners…" />}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

      {partners && partners.length > 0 && (
        <PartnersOverview stats={stats} stageFilter={stageFilter} onStageFilter={applyStageFilter} />
      )}

      {!loading && partners && partners.length === 0 && (
        <EmptyState
          message="No partners yet."
          action={<CreatePartnerModal onCreated={reload} label="Create your first partner" />}
        />
      )}

      {partners && partners.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SearchField value={query} onChange={applyQuery} />
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            {filtering && (
              <>
                <span>
                  {filtered.length} de {partners.length}
                  {stageFilter && <> en <span className="font-medium text-zinc-700">{stageFilter}</span></>}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    applyStageFilter(null);
                    applyQuery("");
                  }}
                  className="font-medium text-brand transition-colors hover:underline"
                >
                  Limpiar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {partners && partners.length > 0 && filtered.length === 0 && (
        <EmptyState message="Ningún partner coincide con la búsqueda." />
      )}

      {pageRows.length > 0 && (
        <Table>
          <THead>
            <Th>Código</Th>
            <Th>Partner</Th>
            <Th>Etapa</Th>
            <Th>Categoría</Th>
            <Th>País</Th>
            <Th>Teléfono</Th>
            <Th>Salud</Th>
            <Th>Estado</Th>
          </THead>
          <TBody>
            {pageRows.map((p) => (
              <Tr key={p.id} onClick={() => router.push(`/app/partners/${p.id}`)}>
                <Td>
                  <span className="font-mono text-xs font-semibold text-brand">{partnerCode(p.seq)}</span>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-800">{p.full_name ?? "—"}</span>
                    {p.role === "partner_admin" && <Badge tone="brand">{ROLE_LABELS.partner_admin}</Badge>}
                  </div>
                  {p.email ? (
                    <a
                      href={`mailto:${p.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-zinc-400 transition-colors hover:text-brand hover:underline"
                    >
                      {p.email}
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </Td>
                <Td>
                  {/* Una etapa fuera de lista (dato viejo) se muestra tal cual
                      en gris en vez de romper el badge. */}
                  {p.process_stage ? (
                    <Badge tone={isPartnerStage(p.process_stage) ? PARTNER_STAGE_TONES[p.process_stage] : "neutral"}>
                      {p.process_stage}
                    </Badge>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </Td>
                <Td>
                  {p.category ? (
                    <Badge tone={p.category === "empresa" ? "blue" : "emerald"}>
                      {PARTNER_CATEGORY_LABELS[p.category]}
                    </Badge>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </Td>
                <Td className="text-zinc-500">{countryLabel(p.country)}</Td>
                <Td className="text-zinc-500">{p.phone ?? "—"}</Td>
                {/* Fecha de ingreso y enlace viven en la ficha del partner: en
                    la tabla solo alargaban la fila. */}
                <Td>
                  <PartnerHealthBadge partner={p} />
                </Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  {/* onChanged recarga la lista: sin eso el resto de la fila
                      seguía mostrando el estado anterior. */}
                  <PartnerStatusToggle partnerId={p.id} active={p.active} onChanged={reload} />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      {filtered.length > PAGE_SIZE && (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          from={currentPage * PAGE_SIZE + 1}
          to={currentPage * PAGE_SIZE + pageRows.length}
          total={filtered.length}
          onPage={setPage}
        />
      )}

      {showDeletions && <PartnerDeletionsModal onClose={() => setShowDeletions(false)} />}
    </div>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-full sm:w-80">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nombre, correo, código o país…"
        aria-label="Buscar partners"
        className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
      />
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  from,
  to,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const step =
    "inline-flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-zinc-500">
        Mostrando {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={step} onClick={() => onPage(page - 1)} disabled={page === 0}>
          Anterior
        </button>
        <span className="px-1 text-sm text-zinc-500">
          Página {page + 1} de {pageCount}
        </span>
        <button
          type="button"
          className={step}
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount - 1}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

function SecondaryAction({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M6 7l1 13h10l1-13" /><path d="M9 7V4h6v3" />
    </svg>
  );
}
