"use client";

import type { PartnerWithCount } from "@/lib/services/partners";
import { daysSince, partnerHealth } from "@/lib/partner-health";
import { WEEKLY_SIGNED_GOAL, signedInWeek } from "@/lib/partner-goal";
import { currentWeek, daysLeftInWeek, weekLabel } from "@/lib/week";
import { PARTNER_STAGES, type PartnerStage } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";

// Un partner "entra" en su fecha de ingreso; si no se cargó, en el alta de la
// cuenta. Mismo criterio que usa la regla de los 90 días.
function daysSinceJoined(p: PartnerWithCount) {
  return daysSince(p.entry_date ?? p.created_at);
}

export type PartnerStats = {
  total: number;
  active: number;
  inactive: number;
  thisWeek: number;
  lastWeek: number;
  noActivity: number;
  opportunities: number;
  byStage: Record<PartnerStage, number>;
};

export function computeStats(partners: PartnerWithCount[]): PartnerStats {
  const byStage = Object.fromEntries(PARTNER_STAGES.map((s) => [s, 0])) as Record<PartnerStage, number>;

  let active = 0;
  let thisWeek = 0;
  let lastWeek = 0;
  let noActivity = 0;
  let opportunities = 0;

  for (const p of partners) {
    if (p.active) active += 1;
    opportunities += p.opportunity_count;
    if (p.process_stage && p.process_stage in byStage) byStage[p.process_stage] += 1;
    if (partnerHealth(p).health === "inactive") noActivity += 1;

    const days = daysSinceJoined(p);
    if (days < 7) thisWeek += 1;
    else if (days < 14) lastWeek += 1;
  }

  return {
    total: partners.length,
    active,
    inactive: partners.length - active,
    thisWeek,
    lastWeek,
    noActivity,
    opportunities,
    byStage,
  };
}

// Punto de color por etapa. Toma el mismo tono que el badge de la tabla, así
// una etapa se ve igual en todo el módulo.
const STAGE_DOTS: Record<PartnerStage, string> = {
  "IA Partner Showcase": "bg-zinc-400",
  "Business Discovery": "bg-blue-500",
  "Contract Review": "bg-amber-500",
  "Partner!": "bg-emerald-500",
};

// Medidor de la meta semanal: un bloque por contrato firmado. Con una meta de
// 3, los bloques se leen de un vistazo mucho mejor que una barra continua —
// se ve "van 2, falta 1" sin tener que estimar una proporción.
function WeeklyGoalMeter({ partners }: { partners: PartnerWithCount[] }) {
  const week = currentWeek();
  const signed = signedInWeek(partners, week);
  const daysLeft = daysLeftInWeek(week);
  const reached = signed >= WEEKLY_SIGNED_GOAL;
  // Si se firmó de más, el medidor crece en vez de toparse en la meta.
  const slots = Math.max(WEEKLY_SIGNED_GOAL, signed);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            Meta semanal · contratos firmados
          </p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${reached ? "text-emerald-600" : "text-zinc-900"}`}>
              {signed}
            </span>
            <span className="text-lg font-medium text-zinc-400">de {WEEKLY_SIGNED_GOAL}</span>
          </p>
        </div>
        <p className="text-right text-xs text-zinc-400">
          <span className="block font-medium text-zinc-600">{weekLabel(week)}</span>
          {reached
            ? signed > WEEKLY_SIGNED_GOAL
              ? `Meta cumplida · ${signed - WEEKLY_SIGNED_GOAL} por encima`
              : "Meta cumplida"
            : `Faltan ${WEEKLY_SIGNED_GOAL - signed} · ${daysLeft} día${daysLeft === 1 ? "" : "s"} de la semana`}
        </p>
      </div>

      {/* Separación de 2px entre bloques para que se distingan sin líneas. */}
      <div className="mt-4 flex gap-0.5" role="img" aria-label={`${signed} de ${WEEKLY_SIGNED_GOAL} contratos firmados esta semana`}>
        {Array.from({ length: slots }, (_, i) => (
          <span
            key={i}
            className={`h-3 flex-1 rounded ${
              i < signed ? (reached ? "bg-emerald-500" : "bg-brand") : "bg-zinc-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function PartnersOverview({
  partners,
  stats,
  stageFilter,
  onStageFilter,
}: {
  partners: PartnerWithCount[];
  stats: PartnerStats;
  stageFilter: PartnerStage | null;
  onStageFilter: (stage: PartnerStage | null) => void;
}) {
  const weekDelta = stats.thisWeek - stats.lastWeek;

  return (
    <div className="flex flex-col gap-4">
      <WeeklyGoalMeter partners={partners} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Partners"
          value={stats.total}
          sub={`${stats.active} activos · ${stats.inactive} inactivos`}
        />
        <StatCard
          label="Nuevos esta semana"
          value={stats.thisWeek}
          sub={
            stats.lastWeek === 0 && stats.thisWeek === 0
              ? "sin altas en 14 días"
              : `${stats.lastWeek} la semana anterior${
                  weekDelta === 0 ? "" : weekDelta > 0 ? ` · +${weekDelta}` : ` · ${weekDelta}`
                }`
          }
        />
        <StatCard
          label="Sin actividad"
          value={stats.noActivity}
          sub="más de 90 días sin registrar"
        />
        <StatCard
          label="Oportunidades"
          value={stats.opportunities}
          sub="registradas por la red"
        />
      </div>

      {/* El embudo, en orden. Cada tarjeta filtra la tabla de abajo. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PARTNER_STAGES.map((stage) => {
          const count = stats.byStage[stage];
          const selected = stageFilter === stage;
          const share = stats.total === 0 ? 0 : Math.round((count / stats.total) * 100);

          return (
            <button
              key={stage}
              type="button"
              aria-pressed={selected}
              onClick={() => onStageFilter(selected ? null : stage)}
              className={`flex flex-col gap-2 rounded-xl border bg-white p-4 text-left transition-all ${
                selected
                  ? "border-brand/40 ring-4 ring-brand/10"
                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${STAGE_DOTS[stage]}`} />
                <span className="text-xs font-medium text-zinc-500">{stage}</span>
              </span>
              <span className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-zinc-900">{count}</span>
                <span className="text-xs text-zinc-400">{share}%</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
