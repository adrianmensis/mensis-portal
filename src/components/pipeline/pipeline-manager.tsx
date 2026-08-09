"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { fmtCurrency, opportunityCode } from "@/lib/format";
import { commission, COMMISSION_RATE } from "@/lib/pricing";
import { canEditOpportunity } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/spinner";
import { StageBadge } from "@/components/ui/stage-badge";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/table";
import { INDUSTRY_LABELS, STAGE_LABELS, type OpportunityStage, type Role } from "@/lib/types";
import { countryByCode, flagEmoji } from "@/lib/countries";
import { opportunityCsvColumns } from "@/lib/opportunity-csv";
import { DownloadButton } from "@/components/ui/download-button";
import { StageSelect } from "./stage-select";
import { CreateOpportunityModal } from "@/components/opportunities/create-opportunity-modal";
import { StageSummary } from "@/components/opportunities/stage-summary";

const CSV_COLUMNS = opportunityCsvColumns({ withPartner: true });

const selectClass =
  "h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/5";

function hostname(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Network-wide pipeline. An admin sees every opportunity; a partner_admin sees
// the whole partner network except Mensis' own deals (scoped by RLS) and can
// only change the stage of the ones it registered itself.
export function PipelineManager({ role, viewerId }: { role: Role; viewerId: string }) {
  const router = useRouter();
  const { data: opps, loading, error, reload } = useResource(() =>
    api.opportunities.list({ withPartner: true }),
  );
  const [partner, setPartner] = useState("");
  const [stage, setStage] = useState<OpportunityStage | null>(null);

  const partners = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of opps ?? []) map.set(o.partner_id, o.partner_name ?? "—");
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [opps]);

  // El panel por estado cuenta dentro del partner elegido, así el filtro de
  // arriba y el de abajo cuentan la misma historia.
  const scoped = (opps ?? []).filter((o) => !partner || o.partner_id === partner);
  const filtered = scoped.filter((o) => !stage || o.stage === stage);
  // Los montos suman lo que sigue en juego: una oportunidad perdida no es
  // dinero, así que queda fuera del total (y se avisa cuántas se dejaron).
  const enJuego = filtered.filter((o) => o.stage !== "closed_lost");
  const perdidas = filtered.length - enJuego.length;
  const totalMonto = enJuego.reduce((s, o) => s + (o.estimated_value ?? 0), 0);
  const totalComision = enJuego.reduce((s, o) => s + commission(o.estimated_value ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Oportunidades"
        subtitle={
          `${filtered.length} oportunidad${filtered.length === 1 ? "" : "es"} · ` +
          `${fmtCurrency(totalMonto)} monto anual · ${fmtCurrency(totalComision)} comisión` +
          (perdidas ? ` · ${perdidas} perdida${perdidas === 1 ? "" : "s"} sin contar` : "")
        }
        action={
          <div className="flex items-center gap-2">
            {/* Baja lo filtrado (partner + estado), no toda la red. */}
            <DownloadButton prefix="oportunidades" columns={CSV_COLUMNS} rows={filtered} />
            <CreateOpportunityModal onCreated={reload} />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <select value={partner} onChange={(e) => setPartner(e.target.value)} className={selectClass}>
          <option value="">Todos los partners</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {stage && (
          <span className="text-xs font-medium text-zinc-500">
            Filtrando por “{STAGE_LABELS[stage]}”
          </span>
        )}
        {(partner || stage) && (
          <button onClick={() => { setPartner(""); setStage(null); }} className="text-xs font-medium text-zinc-400 hover:text-zinc-600">
            Limpiar filtros
          </button>
        )}
      </div>

      <StageSummary opps={scoped} stage={stage} onStage={setStage} />

      {loading && <LoadingRow label="Cargando pipeline…" />}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

      {!loading && filtered.length === 0 && (
        <EmptyState message="No hay prospectos con estos filtros." />
      )}

      {filtered.length > 0 && (
        <Table>
          <THead>
            <Th>Código</Th>
            <Th>Prospecto</Th>
            <Th>Web site</Th>
            <Th>Industria</Th>
            <Th>Partner</Th>
            <Th>Colab.</Th>
            <Th>Gemelos digitales</Th>
            <Th>Monto anual</Th>
            <Th>Comisión anual ({COMMISSION_RATE * 100}%)</Th>
            <Th>Estado</Th>
          </THead>
          <TBody>
            {filtered.map((o) => (
              <Tr key={o.id} onClick={() => router.push(`/app/opportunities/${o.id}`)}>
                <Td className="font-mono text-xs font-semibold text-brand">{opportunityCode(o.seq)}</Td>
                <Td className="font-medium text-zinc-800">
                  {o.country && (
                    <span title={countryByCode(o.country)?.name ?? o.country} className="mr-1.5">
                      {flagEmoji(o.country)}
                    </span>
                  )}
                  {o.client_name}
                </Td>
                <Td>
                  {o.website ? (
                    <a
                      href={o.website}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-brand hover:underline"
                    >
                      {hostname(o.website)}
                    </a>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </Td>
                <Td className="text-zinc-500">
                  {o.industry ? INDUSTRY_LABELS[o.industry] : <span className="text-zinc-400">—</span>}
                </Td>
                <Td className="text-zinc-600">{o.partner_name ?? "—"}</Td>
                <Td className="text-zinc-500">{o.collaborators ?? "—"}</Td>
                <Td className="text-zinc-500">{o.estimated_avatars ?? "—"}</Td>
                <Td className="text-zinc-600">{fmtCurrency(o.estimated_value ?? 0)}</Td>
                <Td className="font-semibold text-brand">{fmtCurrency(commission(o.estimated_value ?? 0))}</Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  {canEditOpportunity(role, viewerId, o.partner_id) ? (
                    <StageSelect
                      oppId={o.id}
                      stage={o.stage}
                      clientName={o.client_name}
                      lostReason={o.lost_reason}
                      lostNotes={o.lost_notes}
                      onChanged={reload}
                    />
                  ) : (
                    <StageBadge stage={o.stage} />
                  )}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
