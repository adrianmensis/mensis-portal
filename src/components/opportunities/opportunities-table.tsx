"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { fmtCurrency, opportunityCode } from "@/lib/format";
import { commission, COMMISSION_RATE } from "@/lib/pricing";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/spinner";
import { StageBadge } from "@/components/ui/stage-badge";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/table";
import { CreateOpportunityModal } from "./create-opportunity-modal";

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

  const list = opps ?? [];
  const closed = list.filter((o) => o.stage === "client");
  const comisionCerrada = closed.reduce((s, o) => s + commission(o.estimated_value ?? 0), 0);
  const comisionPotencial = list
    .filter((o) => o.stage !== "client")
    .reduce((s, o) => s + commission(o.estimated_value ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        subtitle={opps ? `${opps.length} oportunidad${opps.length === 1 ? "" : "es"}` : undefined}
        action={<CreateOpportunityModal onCreated={reload} />}
      />

      {opps && opps.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Oportunidades" value={opps.length} sub={`${closed.length} cerrada${closed.length === 1 ? "" : "s"}`} />
          <StatCard label="Comisión potencial" value={fmtCurrency(comisionPotencial)} sub="pipeline abierto (anual)" />
          <StatCard label="Comisión cerrada" value={fmtCurrency(comisionCerrada)} sub="clientes cerrados (anual)" />
        </div>
      )}

      {loading && <LoadingRow label="Cargando prospectos…" />}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

      {!loading && opps && opps.length === 0 && (
        <EmptyState
          message="Aún no has registrado oportunidades."
          action={<CreateOpportunityModal onCreated={reload} label="Registrar tu primera oportunidad" />}
        />
      )}

      {opps && opps.length > 0 && (
        <Table>
          <THead>
            <Th>Código</Th>
            <Th>Prospecto</Th>
            <Th>Web site</Th>
            <Th>Colaboradores</Th>
            <Th>Gemelos digitales</Th>
            <Th>Monto anual</Th>
            <Th>Comisión anual ({COMMISSION_RATE * 100}%)</Th>
            <Th>Estado</Th>
          </THead>
          <TBody>
            {opps.map((o) => (
              <Tr key={o.id} onClick={() => router.push(`/app/opportunities/${o.id}`)}>
                <Td className="font-mono text-xs font-semibold text-brand">{opportunityCode(o.seq)}</Td>
                <Td className="font-medium text-zinc-800">{o.client_name}</Td>
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
