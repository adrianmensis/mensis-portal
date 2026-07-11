"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { countryLabel, flagEmoji } from "@/lib/countries";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/spinner";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/table";
import { AccountDetailModal } from "./account-detail-modal";
import type { TargetAccount } from "@/lib/types";

const selectClass =
  "h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/5";

// Loads the use-case meta (for the title) and its accounts in one shot.
export function AccountsTable({ useCaseId }: { useCaseId: string }) {
  const { data, loading, error } = useResource(() =>
    Promise.all([api.useCases.list(), api.accounts.list(useCaseId)]),
  );
  const [country, setCountry] = useState("");
  const [selected, setSelected] = useState<TargetAccount | null>(null);

  const useCases = data?.[0];
  const accounts = data?.[1];
  const useCase = useCases?.find((u) => u.id === useCaseId);

  // País options come only from the countries present in this use case.
  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const a of accounts ?? []) if (a.country) set.add(a.country);
    return [...set].sort((a, b) => countryLabel(a).localeCompare(countryLabel(b)));
  }, [accounts]);

  // CEOs first, then the rest — each group ordered by company.
  const isCEO = (a: TargetAccount) => (a.role ?? "").toUpperCase().includes("CEO");
  const filtered = (accounts ?? [])
    .filter((a) => !country || a.country === country)
    .sort((a, b) => {
      if (isCEO(a) !== isCEO(b)) return isCEO(a) ? -1 : 1;
      return a.company.localeCompare(b.company);
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/app/accounts"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-700"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Casos de uso
        </Link>
        <PageHeader
          title={useCase?.name ?? "Cuentas objetivo"}
          subtitle={
            accounts
              ? `${filtered.length} cuenta${filtered.length === 1 ? "" : "s"} · haz clic en una fila para ver todo el detalle.`
              : undefined
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
          <option value="">Todos los países</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {flagEmoji(c)} {countryLabel(c)}
            </option>
          ))}
        </select>
        {country && (
          <button
            onClick={() => setCountry("")}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-600"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {loading && <LoadingRow label="Cargando cuentas…" />}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

      {!loading && accounts && filtered.length === 0 && (
        <EmptyState
          message={
            accounts.length === 0
              ? "Aún no hay cuentas en este caso de uso."
              : "No hay cuentas con este filtro de país."
          }
        />
      )}

      {filtered.length > 0 && (
        <Table>
          <THead>
            <Th>Nombre</Th>
            <Th>Apellido</Th>
            <Th>Rol</Th>
            <Th>Empresa</Th>
            <Th>País</Th>
            <Th className="w-10" />
          </THead>
          <TBody>
            {filtered.map((a: TargetAccount) => (
              <Tr key={a.id} onClick={() => setSelected(a)}>
                <Td className="whitespace-nowrap font-medium text-zinc-800">{a.first_name ?? "—"}</Td>
                <Td className="whitespace-nowrap text-zinc-700">{a.last_name ?? "—"}</Td>
                <Td className="whitespace-nowrap text-zinc-500">{a.role ?? "—"}</Td>
                <Td className="whitespace-nowrap font-medium text-zinc-800">{a.company}</Td>
                <Td className="whitespace-nowrap text-zinc-500">
                  {a.country ? `${flagEmoji(a.country)} ${countryLabel(a.country)}` : "—"}
                </Td>
                <Td className="text-right text-zinc-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      <AccountDetailModal account={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
