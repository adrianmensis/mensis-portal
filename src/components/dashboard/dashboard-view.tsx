"use client";

import Link from "next/link";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { fmtCurrency } from "@/lib/format";
import { commission } from "@/lib/pricing";
import { PageHeader } from "@/components/ui/page-header";
import { MoneyTile } from "@/components/ui/money-tile";
import { Button } from "@/components/ui/button";
import { LoadingRow } from "@/components/ui/spinner";
import { CreatePartnerModal } from "@/components/partners/create-partner-modal";
import { canManagePartners, isAdminRole } from "@/lib/auth/permissions";
import type { Role } from "@/lib/types";
import type { DashboardData } from "@/lib/services/dashboard";
import { SalesFunnel } from "./stage-funnel";
import { OriginBreakdown, RegionBreakdown } from "./breakdown-cards";

export function DashboardView({
  role,
  fullName,
}: {
  role: Role;
  fullName: string | null;
}) {
  // Both admin and partner_admin run the network; the stats they see are
  // narrowed by RLS, not by this flag.
  const isAdmin = canManagePartners(role);
  // Solo el staff de Mensis ve sus propios negocios junto a los de la red.
  const isMensisStaff = isAdminRole(role);
  const { data, loading, error, reload } = useResource(() => api.dashboard());

  const action = isAdmin ? (
    <CreatePartnerModal onCreated={reload} />
  ) : (
    <Link href="/app/opportunities/new">
      <Button>+ Registrar oportunidad</Button>
    </Link>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isAdmin ? "Dashboard" : `Hola, ${fullName ?? "Partner"}`}
        subtitle={
          isAdmin
            ? "El pipeline de toda la red, acumulado."
            : "Tus oportunidades y tu desempeño con Mensis."
        }
        action={action}
      />

      {loading && <LoadingRow label="Cargando dashboard…" />}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

      {data && <Content data={data} isMensisStaff={isMensisStaff} />}
    </div>
  );
}

function Content({
  data,
  isMensisStaff,
}: {
  data: DashboardData;
  isMensisStaff: boolean;
}) {
  const opps = data.pulse.opportunities;
  const activas = data.total_opportunities - data.counts.client - data.counts.closed_lost;

  return (
    // El embudo manda: se queda con la izquierda y crece a lo alto. Todo lo
    // demás se apila chico a la derecha.
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <SalesFunnel counts={data.counts} values={data.values} />
      </div>

      <div className="flex flex-col gap-4 lg:col-span-7">
        <div className="grid gap-4 sm:grid-cols-3">
          <MoneyTile
            label="Pipeline activo"
            value={fmtCurrency(data.open_value)}
            tone="brand"
            compact
            sub={`${activas} en juego`}
          />
          <MoneyTile
            label="Cerrado"
            value={fmtCurrency(data.won_value)}
            tone="emerald"
            compact
            sub={`${data.counts.client} cliente${data.counts.client === 1 ? "" : "s"} · ${fmtCurrency(
              commission(data.won_value),
            )} de comisión`}
          />
          <MoneyTile
            label="Perdido"
            value={fmtCurrency(data.lost_value)}
            tone="red"
            compact
            sub={`${data.counts.closed_lost} cerrada${
              data.counts.closed_lost === 1 ? "" : "s"
            } perdida${data.counts.closed_lost === 1 ? "" : "s"}`}
          />
        </div>

        {/* El corte Mensis / red solo tiene sentido con los dos a la vista, y
            eso es lo que ve un admin: al resto RLS ya le esconde lo de Mensis. */}
        {isMensisStaff && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Por origen · Mensis vs. red
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <OriginBreakdown opportunities={opps} />
            </div>
          </div>
        )}

        <RegionBreakdown opportunities={opps} />
      </div>
    </div>
  );
}

