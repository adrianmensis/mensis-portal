import { fmtCurrency } from "@/lib/format";
import { STAGE_LABELS, type OpportunityStage } from "@/lib/types";

// El embudo, sin los leads: esos tienen tarjeta propia (LeadsCard) porque son
// la boca del embudo y no un paso más.
const FUNNEL: OpportunityStage[] = ["meeting_scheduled", "tenant_creation", "pilot", "client"];

// Rampa ordinal: una sola tinta, más oscura cuanto más hondo en el embudo. Es
// una escala ordenada, no categorías sueltas, así que el color acompaña el
// avance en vez de inventar identidades. Validada: claridad monótona, saltos
// visibles y el extremo claro despegado del fondo.
const RAMP = ["#94A6E8", "#7189DD", "#4F6BD8", "#273B7C"];

type ByStage = Record<OpportunityStage, number>;

// Cuántas llegaron *al menos* hasta esta etapa. Es lo que hace que un embudo
// sea un embudo: cada piso incluye a los que siguieron de largo, así que la
// figura sí se angosta. Las perdidas quedan fuera — no guardamos hasta dónde
// habían llegado antes de caerse.
function reached(from: number, by: ByStage) {
  return FUNNEL.slice(from).reduce((n, s) => n + by[s], 0);
}

export function LeadsCard({ counts, values }: { counts: ByStage; values: ByStage }) {
  const leads = counts.lead;
  const avanzaron = reached(0, counts);
  const total = leads + avanzaron;
  const share = total === 0 ? 0 : Math.round((avanzaron / total) * 100);

  return (
    <section className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Leads</p>
      <p className="mt-3 text-[2.6rem] font-bold leading-none tracking-tight text-zinc-900">
        {leads}
      </p>
      <p className="mt-2 text-sm text-zinc-500">{fmtCurrency(values.lead)} de monto anual</p>

      <div className="mt-auto pt-5">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="text-zinc-400">Pasaron de lead</span>
          <span className="font-semibold text-zinc-700">
            {avanzaron} de {total} · {share}%
          </span>
        </div>
        {/* Medidor de la conversión: la parte llena es lo que salió de lead. */}
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-brand" style={{ width: `${share}%` }} />
        </div>
      </div>
    </section>
  );
}

export function SalesFunnel({ counts, values }: { counts: ByStage; values: ByStage }) {
  const top = reached(0, counts);
  // El piso de arriba se compara contra todo lo activo (leads incluidos): decir
  // que el primer piso es el 100% de sí mismo no informa nada.
  const activas = counts.lead + top;

  const rows = FUNNEL.map((stage, i) => {
    const count = reached(i, counts);
    const value = FUNNEL.slice(i).reduce((sum, s) => sum + values[s], 0);
    const prev = i === 0 ? activas : reached(i - 1, counts);
    return {
      stage,
      count,
      value,
      color: RAMP[i],
      // Ancho contra el piso más ancho, con un mínimo para que una etapa casi
      // vacía siga siendo visible.
      width: top === 0 ? 0 : Math.max(8, (count / top) * 100),
      // Cuánto sobrevivió del piso anterior.
      conversion: prev === 0 ? 0 : Math.round((count / prev) * 100),
    };
  });

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          Embudo de ventas
        </p>
        <span className="text-[11px] text-zinc-400">llegaron al menos a cada etapa</span>
      </div>

      {/* 2px entre pisos: separa los tramos sin dibujarles un borde encima. */}
      <div className="flex flex-col gap-0.5">
        {rows.map((r, i) => (
          <div key={r.stage} className="flex items-center gap-3">
            <div className="w-32 shrink-0 sm:w-40">
              <p className="truncate text-xs font-medium text-zinc-700">{STAGE_LABELS[r.stage]}</p>
              <p className="text-[11px] text-zinc-400">
                {i === 0
                  ? `${r.conversion}% de todo lo activo`
                  : `${r.conversion}% del paso anterior`}
              </p>
            </div>

            <div className="min-w-0 flex-1">
              <svg viewBox="0 0 100 44" preserveAspectRatio="none" className="h-11 w-full">
                <polygon
                  points={[
                    `${(100 - r.width) / 2},0`,
                    `${(100 + r.width) / 2},0`,
                    `${(100 + (rows[i + 1]?.width ?? r.width)) / 2},44`,
                    `${(100 - (rows[i + 1]?.width ?? r.width)) / 2},44`,
                  ].join(" ")}
                  fill={r.color}
                />
              </svg>
            </div>

            <div className="w-24 shrink-0 text-right sm:w-28">
              <p className="text-sm font-semibold text-zinc-900">{r.count}</p>
              <p className="text-[11px] text-zinc-400">{fmtCurrency(r.value)}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="border-t border-zinc-100 pt-3 text-[11px] text-zinc-400">
        Sin contar {counts.closed_lost} cerrada{counts.closed_lost === 1 ? "" : "s"} perdida
        {counts.closed_lost === 1 ? "" : "s"} ({fmtCurrency(values.closed_lost)}): no guardamos
        hasta qué etapa habían llegado.
      </p>
    </section>
  );
}
