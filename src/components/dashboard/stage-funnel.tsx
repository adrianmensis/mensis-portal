import { fmtCurrency } from "@/lib/format";
import {
  OPPORTUNITY_STAGES,
  STAGE_LABELS,
  type OpportunityStage,
} from "@/lib/types";

// Punto de color por etapa: el mismo del badge y del panel de oportunidades,
// para que una etapa se reconozca igual en todo el portal.
const STAGE_DOTS: Record<OpportunityStage, string> = {
  lead: "bg-zinc-400",
  meeting_scheduled: "bg-amber-500",
  tenant_creation: "bg-violet-500",
  pilot: "bg-blue-500",
  client: "bg-emerald-500",
  closed_lost: "bg-red-500",
};

// El embudo, etapa por etapa. Una sola serie (cuántas oportunidades hay), así
// que una sola tinta: la barra siempre es de marca y la identidad de la etapa
// la lleva el punto de color al lado del nombre. La barra se mide contra la
// etapa más cargada, no contra el total — con embudos chicos, medir contra el
// total deja todas las barras en un hilo ilegible.
function Row({
  label,
  dot,
  count,
  value,
  max,
  tone = "brand",
}: {
  label: string;
  dot: string;
  count: number;
  value: number;
  max: number;
  tone?: "brand" | "red";
}) {
  const width = max === 0 ? 0 : Math.round((count / max) * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
          <span className="truncate text-sm text-zinc-600">{label}</span>
        </span>
        <span className="flex shrink-0 items-baseline gap-2">
          <span className="text-sm font-semibold text-zinc-900">{count}</span>
          <span className="text-xs text-zinc-400">{fmtCurrency(value)}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full ${tone === "red" ? "bg-red-400" : "bg-brand"}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function StageFunnel({
  counts,
  values,
}: {
  counts: Record<OpportunityStage, number>;
  values: Record<OpportunityStage, number>;
}) {
  const max = Math.max(1, ...OPPORTUNITY_STAGES.map((s) => counts[s]));

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          Embudo por etapa
        </p>
        <span className="text-[11px] text-zinc-400">oportunidades · monto anual</span>
      </div>

      <div className="flex flex-col gap-3.5">
        {OPPORTUNITY_STAGES.map((s) => (
          <Row
            key={s}
            label={STAGE_LABELS[s]}
            dot={STAGE_DOTS[s]}
            count={counts[s]}
            value={values[s]}
            max={max}
          />
        ))}
      </div>

      {/* Las perdidas van aparte: no son un paso del embudo, son la salida. */}
      <div className="border-t border-zinc-100 pt-3.5">
        <Row
          label={STAGE_LABELS.closed_lost}
          dot={STAGE_DOTS.closed_lost}
          count={counts.closed_lost}
          value={values.closed_lost}
          max={max}
          tone="red"
        />
      </div>
    </section>
  );
}
