"use client";

import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { downloadCsv, stampedFilename, toCsv, type CsvColumn } from "@/lib/csv";
import { fmtDate, partnerCode } from "@/lib/format";
import { countryByCode } from "@/lib/countries";
import { PARTNER_CATEGORY_LABELS, type PartnerDeletion } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/spinner";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/table";

const COLUMNS: CsvColumn<PartnerDeletion>[] = [
  { header: "Código", value: (d) => (d.partner_seq ? partnerCode(d.partner_seq) : "") },
  { header: "Nombre", value: (d) => d.full_name },
  { header: "Correo", value: (d) => d.email },
  { header: "País", value: (d) => countryByCode(d.country)?.name ?? d.country },
  { header: "Teléfono", value: (d) => d.phone },
  { header: "Categoría", value: (d) => (d.category ? PARTNER_CATEGORY_LABELS[d.category] : "") },
  { header: "Etapa", value: (d) => d.process_stage },
  { header: "Fecha de ingreso", value: (d) => d.entry_date },
  { header: "Referencia", value: (d) => d.reference },
  { header: "Oportunidades borradas", value: (d) => d.opportunity_count },
  { header: "Eliminado el", value: (d) => new Date(d.deleted_at).toISOString() },
  { header: "Eliminado por", value: (d) => d.deleted_by_name ?? d.deleted_by_email },
];

// Bitácora de partners eliminados: quién era, cuántas oportunidades se fueron
// con él y quién lo borró.
//
// El componente se monta solo cuando se abre (lo decide quien lo usa), así la
// bitácora no se consulta en cada carga de la pestaña Partners.
export function PartnerDeletionsModal({ onClose }: { onClose: () => void }) {
  const { data, loading, error } = useResource(() => api.partners.deletions());

  return (
    <Modal
      open
      onClose={onClose}
      title="Partners eliminados"
      subtitle="Registro histórico de las bajas de la red."
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {loading && <LoadingRow label="Cargando eliminados…" />}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

        {data && data.length === 0 && <EmptyState message="Todavía no se eliminó ningún partner." />}

        {data && data.length > 0 && (
          <>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-zinc-500">
                {data.length} partner{data.length === 1 ? "" : "s"} eliminado
                {data.length === 1 ? "" : "s"}.
              </p>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(stampedFilename("partners-eliminados"), toCsv(COLUMNS, data))
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <DownloadIcon />
                Descargar CSV
              </button>
            </div>

            <Table>
              <THead>
                <Th>Código</Th>
                <Th>Partner</Th>
                <Th>Etapa</Th>
                <Th>Oportunidades</Th>
                <Th>Eliminado</Th>
              </THead>
              <TBody>
                {data.map((d) => (
                  <Tr key={d.id}>
                    <Td>
                      <span className="font-mono text-xs font-semibold text-zinc-400">
                        {d.partner_seq ? partnerCode(d.partner_seq) : "—"}
                      </span>
                    </Td>
                    <Td>
                      <p className="font-medium text-zinc-800">{d.full_name ?? "—"}</p>
                      <p className="text-xs text-zinc-400">{d.email ?? "—"}</p>
                    </Td>
                    <Td className="text-zinc-500">{d.process_stage ?? "—"}</Td>
                    <Td>
                      {d.opportunity_count > 0 ? (
                        <Badge tone="red">{d.opportunity_count} borrada{d.opportunity_count === 1 ? "" : "s"}</Badge>
                      ) : (
                        <span className="text-zinc-400">Ninguna</span>
                      )}
                    </Td>
                    <Td>
                      <p className="text-zinc-600">{fmtDate(d.deleted_at)}</p>
                      <p className="text-xs text-zinc-400">
                        por {d.deleted_by_name ?? d.deleted_by_email ?? "—"}
                      </p>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </>
        )}
      </div>
    </Modal>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" />
    </svg>
  );
}
