"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/api/use-resource";
import { fmtCurrency } from "@/lib/format";
import { avatarAmount, annualCommission, COMMISSION_RATE } from "@/lib/pricing";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/spinner";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/table";
import { STATUS_LABELS, type OpportunityStatus } from "@/lib/types";
import { StatusSelect } from "./status-select";
import { CreateOpportunityModal } from "@/components/opportunities/create-opportunity-modal";

const STATUSES: OpportunityStatus[] = ["pending", "approved", "won", "lost"];
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

export function PipelineManager() {
  const { data: opps, loading, error, reload } = useResource(() =>
    api.opportunities.list({ withPartner: true }),
  );
  const [partner, setPartner] = useState("");
  const [status, setStatus] = useState("");

  const partners = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of opps ?? []) map.set(o.partner_id, o.partner_name ?? "—");
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [opps]);

  const filtered = (opps ?? []).filter(
    (o) => (!partner || o.partner_id === partner) && (!status || o.status === status),
  );
  const totalMonto = filtered.reduce((s, o) => s + avatarAmount(o.estimated_avatars) * 12, 0);
  const totalComision = filtered.reduce((s, o) => s + annualCommission(o.estimated_avatars), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Oportunidades"
        subtitle={`${filtered.length} oportunidad${filtered.length === 1 ? "" : "es"} · ${fmtCurrency(totalMonto)} monto anual · ${fmtCurrency(totalComision)} comisión`}
        action={<CreateOpportunityModal onCreated={reload} />}
      />

      <div className="flex flex-wrap items-center gap-3">
        <select value={partner} onChange={(e) => setPartner(e.target.value)} className={selectClass}>
          <option value="">Todos los partners</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        {(partner || status) && (
          <button onClick={() => { setPartner(""); setStatus(""); }} className="text-xs font-medium text-zinc-400 hover:text-zinc-600">
            Limpiar filtros
          </button>
        )}
      </div>

      {loading && <LoadingRow label="Cargando pipeline…" />}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

      {!loading && filtered.length === 0 && (
        <EmptyState message="No hay prospectos con estos filtros." />
      )}

      {filtered.length > 0 && (
        <Table>
          <THead>
            <Th>Prospecto</Th>
            <Th>Web site</Th>
            <Th>Partner</Th>
            <Th>Colab.</Th>
            <Th>Avatares</Th>
            <Th>Monto anual</Th>
            <Th>Comisión anual ({COMMISSION_RATE * 100}%)</Th>
            <Th>Estado</Th>
          </THead>
          <TBody>
            {filtered.map((o) => (
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
                <Td className="text-zinc-600">{o.partner_name ?? "—"}</Td>
                <Td className="text-zinc-500">{o.collaborators ?? "—"}</Td>
                <Td className="text-zinc-500">{o.estimated_avatars ?? "—"}</Td>
                <Td className="text-zinc-600">{fmtCurrency(avatarAmount(o.estimated_avatars) * 12)}</Td>
                <Td className="font-semibold text-brand">{fmtCurrency(annualCommission(o.estimated_avatars))}</Td>
                <Td>
                  <StatusSelect oppId={o.id} status={o.status} onChanged={reload} />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
