"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { fmtCurrency, opportunityCode } from "@/lib/format";
import { commission, COMMISSION_RATE } from "@/lib/pricing";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { MoneyTile } from "@/components/ui/money-tile";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/spinner";
import { StageBadge } from "@/components/ui/stage-badge";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/table";
import { INDUSTRY_LABELS, STAGE_LABELS, type OpportunityStage } from "@/lib/types";
import { countryByCode, flagEmoji } from "@/lib/countries";
import { opportunityCsvColumns } from "@/lib/opportunity-csv";
import { DownloadButton } from "@/components/ui/download-button";
import { CreateOpportunityModal } from "./create-opportunity-modal";
import { StageSummary } from "./stage-summary";

const CSV_COLUMNS = opportunityCsvColumns();

function hostname(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function OpportunitiesTable({ title = "Mis oportunidades" }: { title?: string }) {
  const router = useRouter();
  const { data: opps, loading, error, reload } = useResource(() => api.opportunities.list());
  const [stage, setStage] = useState<OpportunityStage | null>(null);

  const list = opps ?? [];
  const closed = list.filter((o) => o.stage === "client");
  const lost = list.filter((o) => o.stage === "closed_lost");
  // El pipeline abierto es lo que sigue vivo: ni ganado ni perdido.
  const abiertas = list.filter((o) => o.stage !== "client" && o.stage !== "closed_lost");
  const montoEnJuego = abiertas.reduce((s, o) => s + (o.estimated_value ?? 0), 0);
  const montoCerrado = closed.reduce((s, o) => s + (o.estimated_value ?? 0), 0);
  const comisionPotencial = commission(montoEnJuego);
  const comisionCerrada = commission(montoCerrado);
  const rows = stage ? list.filter((o) => o.stage === stage) : list;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        subtitle={opps ? `${opps.length} oportunidad${opps.length === 1 ? "" : "es"}` : undefined}
        action={
          <div className="flex items-center gap-2">
            {/* Baja lo que está a la vista: si hay un estado filtrado, solo eso. */}
            <DownloadButton prefix="oportunidades" columns={CSV_COLUMNS} rows={rows} />
            <CreateOpportunityModal onCreated={reload} />
          </div>
        }
      />

      {opps && opps.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Oportunidades"
              value={opps.length}
              sub={`${closed.length} ganada${closed.length === 1 ? "" : "s"} · ${lost.length} perdida${lost.length === 1 ? "" : "s"}`}
            />
            <MoneyTile
              label="Monto en juego"
              value={fmtCurrency(montoEnJuego)}
              tone="brand"
              sub="pipeline abierto (anual)"
            />
            <MoneyTile
              label="Comisión potencial"
              value={fmtCurrency(comisionPotencial)}
              tone="brand"
              sub={`${COMMISSION_RATE * 100}% del pipeline abierto`}
            />
            <MoneyTile
              label="Comisión cerrada"
              value={fmtCurrency(comisionCerrada)}
              tone="emerald"
              sub={`${fmtCurrency(montoCerrado)} en clientes cerrados`}
            />
          </div>

          <StageSummary opps={list} stage={stage} onStage={setStage} />
        </>
      )}

      {loading && <LoadingRow label="Cargando prospectos…" />}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

      {!loading && opps && opps.length === 0 && (
        <EmptyState
          message="Aún no has registrado oportunidades."
          action={<CreateOpportunityModal onCreated={reload} label="Registrar tu primera oportunidad" />}
        />
      )}

      {opps && opps.length > 0 && rows.length === 0 && (
        <EmptyState
          message={`No tienes oportunidades en “${stage ? STAGE_LABELS[stage] : ""}”.`}
          action={
            <button
              onClick={() => setStage(null)}
              className="text-sm font-medium text-brand hover:underline"
            >
              Ver todas
            </button>
          }
        />
      )}

      {rows.length > 0 && (
        <Table>
          <THead>
            <Th>Código</Th>
            <Th>Prospecto</Th>
            <Th>Web site</Th>
            <Th>Industria</Th>
            <Th>Colaboradores</Th>
            <Th>Gemelos digitales</Th>
            <Th>Monto anual</Th>
            <Th>Comisión anual ({COMMISSION_RATE * 100}%)</Th>
            <Th>Estado</Th>
          </THead>
          <TBody>
            {rows.map((o) => (
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
                <Td className="text-zinc-500">{o.collaborators ?? "—"}</Td>
                <Td className="text-zinc-500">{o.estimated_avatars ?? "—"}</Td>
                <Td className="text-zinc-600">{fmtCurrency(o.estimated_value ?? 0)}</Td>
                <Td className="font-semibold text-brand">{fmtCurrency(commission(o.estimated_value ?? 0))}</Td>
                <Td>
                  <StageBadge stage={o.stage} />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
