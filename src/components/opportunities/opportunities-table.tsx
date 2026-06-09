"use client";

import { api } from "@/lib/api/client";
import { useResource } from "@/lib/api/use-resource";
import { fmtCurrency } from "@/lib/format";
import { avatarAmount, commission, COMMISSION_RATE } from "@/lib/pricing";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status-badge";
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
  const { data: opps, loading, error, reload } = useResource(() => api.opportunities.list());

  const totalComision = (opps ?? []).reduce(
    (s, o) => s + commission(avatarAmount(o.estimated_avatars)),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        subtitle={
          opps
            ? `${opps.length} oportunidad${opps.length === 1 ? "" : "es"} · comisión potencial ${fmtCurrency(totalComision)}`
            : undefined
        }
        action={<CreateOpportunityModal onCreated={reload} />}
      />

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
            <Th>Prospecto</Th>
            <Th>Web site</Th>
            <Th>Colaboradores</Th>
            <Th>Avatares</Th>
            <Th>Monto</Th>
            <Th>Comisión ({COMMISSION_RATE * 100}%)</Th>
            <Th>Estado</Th>
          </THead>
          <TBody>
            {opps.map((o) => {
              const monto = avatarAmount(o.estimated_avatars);
              return (
                <Tr key={o.id}>
                  <Td className="font-medium text-zinc-800">{o.client_name}</Td>
                  <Td>
                    {o.website ? (
                      <a href={o.website} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                        {hostname(o.website)}
                      </a>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </Td>
                  <Td className="text-zinc-500">{o.collaborators ?? "—"}</Td>
                  <Td className="text-zinc-500">{o.estimated_avatars ?? "—"}</Td>
                  <Td className="text-zinc-600">{fmtCurrency(monto)}</Td>
                  <Td className="font-semibold text-brand">{fmtCurrency(commission(monto))}</Td>
                  <Td>
                    <StatusBadge status={o.status} />
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
