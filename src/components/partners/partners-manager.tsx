"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { downloadCsv, stampedFilename, toCsv, type CsvColumn } from "@/lib/csv";
import { fmtDate, partnerCode } from "@/lib/format";
import { countryByCode, countryLabel } from "@/lib/countries";
import { partnerHealth, HEALTH_LABELS } from "@/lib/partner-health";
import { PARTNER_CATEGORY_LABELS, PARTNER_STAGE_TONES, ROLE_LABELS, isPartnerStage } from "@/lib/types";
import type { PartnerWithCount } from "@/lib/services/partners";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/spinner";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/table";
import { CreatePartnerModal } from "./create-partner-modal";
import { PartnerDeletionsModal } from "./partner-deletions-modal";
import { PartnerHealthBadge } from "./partner-health-badge";
import { PartnerStatusToggle } from "./partner-status-toggle";

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
            <SecondaryAction
              onClick={() =>
                partners && downloadCsv(stampedFilename("partners"), toCsv(CSV_COLUMNS, partners))
              }
              disabled={!partners || partners.length === 0}
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

      {!loading && partners && partners.length === 0 && (
        <EmptyState
          message="No partners yet."
          action={<CreatePartnerModal onCreated={reload} label="Create your first partner" />}
        />
      )}

      {partners && partners.length > 0 && (
        <Table>
          <THead>
            <Th>Código</Th>
            <Th>Partner</Th>
            <Th>Etapa</Th>
            <Th>Categoría</Th>
            <Th>País</Th>
            <Th>Teléfono</Th>
            <Th>Ingreso</Th>
            <Th>Enlace</Th>
            <Th>Salud</Th>
            <Th>Estado</Th>
          </THead>
          <TBody>
            {partners.map((p) => (
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
                <Td className="text-zinc-500">{p.entry_date ? fmtDate(p.entry_date) : "—"}</Td>
                <Td>
                  {p.linkedin_url ? (
                    <a
                      href={p.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 font-medium text-brand transition-colors hover:underline"
                    >
                      Ver enlace
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17 17 7" /><path d="M7 7h10v10" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </Td>
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

      {showDeletions && <PartnerDeletionsModal onClose={() => setShowDeletions(false)} />}
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
