"use client";

import { api } from "@/lib/api/client";
import { useResource } from "@/lib/api/use-resource";
import { fmtDate } from "@/lib/format";
import { countryLabel } from "@/lib/countries";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/spinner";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/table";
import { CreatePartnerModal } from "./create-partner-modal";
import { PartnerStatusToggle } from "./partner-status-toggle";

export function PartnersManager() {
  const { data: partners, loading, error, reload } = useResource(() => api.partners.list());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Partners"
        subtitle={
          partners ? `${partners.length} partner${partners.length === 1 ? "" : "s"} in the network.` : undefined
        }
        action={<CreatePartnerModal onCreated={reload} />}
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
            <Th>Partner</Th>
            <Th>País</Th>
            <Th>Teléfono</Th>
            <Th>Ingreso</Th>
            <Th>LinkedIn</Th>
            <Th>Estado</Th>
          </THead>
          <TBody>
            {partners.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <div className="font-medium text-zinc-800">{p.full_name ?? "—"}</div>
                  {p.email ? (
                    <a href={`mailto:${p.email}`} className="text-xs text-zinc-400 transition-colors hover:text-brand hover:underline">
                      {p.email}
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
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
                      className="inline-flex items-center gap-1 font-medium text-brand transition-colors hover:underline"
                    >
                      Ver perfil
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17 17 7" /><path d="M7 7h10v10" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </Td>
                <Td>
                  <PartnerStatusToggle partnerId={p.id} active={p.active} />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
