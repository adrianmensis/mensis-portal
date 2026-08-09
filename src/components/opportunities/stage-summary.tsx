"use client";

import { fmtCurrency } from "@/lib/format";
import {
  ALL_OPPORTUNITY_STAGES,
  STAGE_LABELS,
  type Opportunity,
  type OpportunityStage,
} from "@/lib/types";

// Punto de color por etapa. Mismo tono que el badge de la tabla, así una etapa
// se ve igual en todo el módulo.
const STAGE_DOTS: Record<OpportunityStage, string> = {
  lead: "bg-zinc-400",
  meeting_scheduled: "bg-amber-500",
  tenant_creation: "bg-violet-500",
  pilot: "bg-blue-500",
  client: "bg-emerald-500",
  closed_lost: "bg-red-500",
};

// Panel compacto por estado: cuántas oportunidades hay en cada etapa y cuánto
// monto anual representan. Cada tarjeta filtra la tabla de abajo; volver a
// tocarla quita el filtro.
export function StageSummary({
  opps,
  stage,
  onStage,
}: {
  opps: Pick<Opportunity, "stage" | "estimated_value">[];
  stage: OpportunityStage | null;
  onStage: (stage: OpportunityStage | null) => void;
}) {
  const stats = new Map<OpportunityStage, { count: number; value: number }>(
    ALL_OPPORTUNITY_STAGES.map((s) => [s, { count: 0, value: 0 }]),
  );
  for (const o of opps) {
    const cell = stats.get(o.stage);
    if (!cell) continue; // etapa desconocida (dato viejo): no rompe el panel
    cell.count += 1;
    cell.value += o.estimated_value ?? 0;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {ALL_OPPORTUNITY_STAGES.map((s) => {
        const { count, value } = stats.get(s) ?? { count: 0, value: 0 };
        const selected = stage === s;

        return (
          <button
            key={s}
            type="button"
            aria-pressed={selected}
            onClick={() => onStage(selected ? null : s)}
            className={`flex flex-col gap-1.5 rounded-xl border bg-white p-3 text-left transition-all ${
              selected
                ? "border-brand/40 ring-4 ring-brand/10"
                : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STAGE_DOTS[s]}`} />
              <span className="truncate text-[11px] font-medium text-zinc-500">{STAGE_LABELS[s]}</span>
            </span>
            <span className="text-xl font-bold leading-none text-zinc-900">{count}</span>
            <span className="text-[11px] text-zinc-400">{fmtCurrency(value)}</span>
          </button>
        );
      })}
    </div>
  );
}
