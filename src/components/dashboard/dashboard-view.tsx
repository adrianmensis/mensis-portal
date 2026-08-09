"use client";

import Link from "next/link";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { fmtCurrency, fmtDate, opportunityCode } from "@/lib/format";
import { commission } from "@/lib/pricing";
import { WEEKLY_SIGNED_GOAL, signedInWeek } from "@/lib/partner-goal";
import {
  countInWeek,
  currentWeek,
  daysLeftInWeek,
  previousWeek,
  weekLabel,
  type Week,
} from "@/lib/week";
import { PageHeader } from "@/components/ui/page-header";
import { MoneyTile } from "@/components/ui/money-tile";
import { StageBadge } from "@/components/ui/stage-badge";
import { Button } from "@/components/ui/button";
import { LoadingRow } from "@/components/ui/spinner";
import { CreatePartnerModal } from "@/components/partners/create-partner-modal";
import { canManagePartners } from "@/lib/auth/permissions";
import type { Role } from "@/lib/types";
import type { DashboardData } from "@/lib/services/dashboard";
import { StageFunnel } from "./stage-funnel";
import { WeekTile } from "./week-tile";

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
  const { data, loading, error, reload } = useResource(() => api.dashboard());

  const week = currentWeek();
  const daysLeft = daysLeftInWeek(week);

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
        subtitle={`Semana del ${weekLabel(week)} · ${
          daysLeft === 1 ? "último día" : `quedan ${daysLeft} días`
        }`}
        action={action}
      />

      {loading && <LoadingRow label="Cargando dashboard…" />}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

      {data && <Content data={data} isAdmin={isAdmin} week={week} />}
    </div>
  );
}

function Content({
  data,
  isAdmin,
  week,
}: {
  data: DashboardData;
  isAdmin: boolean;
  week: Week;
}) {
  const prev = previousWeek(week);

  const opps = data.pulse.opportunities;
  const nuevas = countInWeek(opps.map((o) => o.created_at), week);
  const nuevasPrev = countInWeek(opps.map((o) => o.created_at), prev);
  const perdidas = countInWeek(opps.map((o) => o.lost_at), week);
  const perdidasPrev = countInWeek(opps.map((o) => o.lost_at), prev);

  const partners = data.pulse.partners;
  const nuevosPartners = countInWeek(partners.map((p) => p.joined), week);
  const nuevosPartnersPrev = countInWeek(partners.map((p) => p.joined), prev);
  const firmados = signedInWeek(partners, week);

  const activas = data.total_opportunities - data.counts.client - data.counts.closed_lost;

  return (
    <div className="flex flex-col gap-6">
      {/* Cómo venimos esta semana */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <WeekTile
          label="Oportunidades nuevas"
          value={nuevas}
          previous={nuevasPrev}
          unit={nuevas === 1 ? "registrada" : "registradas"}
        />
        {isAdmin && (
          <WeekTile
            label="Partners nuevos"
            value={nuevosPartners}
            previous={nuevosPartnersPrev}
            unit={nuevosPartners === 1 ? "alta" : "altas"}
          />
        )}
        {isAdmin && (
          <WeekTile
            label="Contratos firmados"
            value={firmados}
            unit={`de ${WEEKLY_SIGNED_GOAL}`}
            footer={<GoalMeter signed={firmados} />}
          />
        )}
        <WeekTile
          label="Perdidas esta semana"
          value={perdidas}
          previous={perdidasPrev}
          good="down"
          unit={perdidas === 1 ? "oportunidad" : "oportunidades"}
        />
        {!isAdmin && (
          <WeekTile
            label="Tus oportunidades"
            value={data.total_opportunities}
            unit="en total"
            footer={
              <span className="text-xs text-zinc-400">
                {activas} activa{activas === 1 ? "" : "s"} · {data.counts.client} ganada
                {data.counts.client === 1 ? "" : "s"}
              </span>
            }
          />
        )}
      </div>

      {/* La plata */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MoneyTile
          label="Pipeline activo"
          value={fmtCurrency(data.open_value)}
          tone="brand"
          sub={`${activas} oportunidad${activas === 1 ? "" : "es"} en juego · sin cerradas ni perdidas`}
        />
        <MoneyTile
          label="Clientes cerrados"
          value={fmtCurrency(data.won_value)}
          tone="emerald"
          sub={`${data.counts.client} cerrada${data.counts.client === 1 ? "" : "s"} · ${fmtCurrency(
            commission(data.won_value),
          )} de comisión`}
        />
        <MoneyTile
          label="Perdido"
          value={fmtCurrency(data.lost_value)}
          tone="red"
          sub={`${data.counts.closed_lost} oportunidad${
            data.counts.closed_lost === 1 ? "" : "es"
          } cerrada${data.counts.closed_lost === 1 ? "" : "s"} perdida${
            data.counts.closed_lost === 1 ? "" : "s"
          }`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StageFunnel counts={data.counts} values={data.values} />
        <Recent data={data} isAdmin={isAdmin} />
      </div>
    </div>
  );
}

// Medidor de la meta semanal: un bloque por contrato firmado. Con una meta de
// 3, los bloques se leen mucho mejor que una barra continua — se ve "van 2,
// falta 1" sin estimar una proporción.
function GoalMeter({ signed }: { signed: number }) {
  const reached = signed >= WEEKLY_SIGNED_GOAL;
  const slots = Math.max(WEEKLY_SIGNED_GOAL, signed);

  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`${signed} de ${WEEKLY_SIGNED_GOAL} contratos firmados esta semana`}
    >
      {Array.from({ length: slots }, (_, i) => (
        <span
          key={i}
          className={`h-2 flex-1 rounded ${
            i < signed ? (reached ? "bg-emerald-500" : "bg-brand") : "bg-zinc-100"
          }`}
        />
      ))}
    </div>
  );
}

function Recent({ data, isAdmin }: { data: DashboardData; isAdmin: boolean }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          Últimas oportunidades
        </p>
        <Link
          href={isAdmin ? "/app/pipeline" : "/app/opportunities"}
          className="text-xs font-semibold text-brand hover:underline"
        >
          Ver todas
        </Link>
      </div>

      {data.recent.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">Todavía no hay oportunidades.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-100">
          {data.recent.map((o) => (
            <li key={o.id}>
              <Link
                href={`/app/opportunities/${o.id}`}
                className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-zinc-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-zinc-800">
                    {o.client_name}
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-400">
                    <span className="font-mono">{opportunityCode(o.seq)}</span> ·{" "}
                    {fmtDate(o.created_at)} · {fmtCurrency(o.estimated_value ?? 0)}
                  </span>
                </span>
                <StageBadge stage={o.stage} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
