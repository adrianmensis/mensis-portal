import { fmtCurrency } from "@/lib/format";
import { STAGE_LABELS, type OpportunityStage } from "@/lib/types";

// El embudo empieza después del lead: un lead todavía no es una venta en curso.
// Cuántos leads hay y cuántos pasaron se dice en el pie, sin robarle una
// tarjeta entera al tablero.
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
    // h-full: el embudo se estira hasta donde llegue la columna de al lado, y
    // los pisos crecen con él. Es la figura del tablero, no una tarjeta más.
    <section className="flex h-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          Embudo de ventas
        </p>
        <span className="text-[11px] text-zinc-400">llegaron al menos a cada etapa</span>
      </div>

      {/* 2px entre pisos: separa los tramos sin dibujarles un borde encima. */}
      <div className="flex flex-1 flex-col gap-0.5">
        {rows.map((r, i) => (
          <div key={r.stage} className="flex min-h-[4.5rem] flex-1 items-stretch gap-3">
            <div className="flex w-28 shrink-0 flex-col justify-center sm:w-36">
              <p className="truncate text-xs font-medium text-zinc-700">{STAGE_LABELS[r.stage]}</p>
              <p className="text-[11px] text-zinc-400">
                {i === 0
                  ? `${r.conversion}% de todo lo activo`
                  : `${r.conversion}% del paso anterior`}
              </p>
            </div>

            <div className="min-w-0 flex-1">
              <svg viewBox="0 0 100 44" preserveAspectRatio="none" className="h-full w-full">
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

            <div className="flex w-20 shrink-0 flex-col justify-center text-right sm:w-24">
              <p className="text-sm font-semibold text-zinc-900">{r.count}</p>
              <p className="text-[11px] text-zinc-400">{fmtCurrency(r.value)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 border-t border-zinc-100 pt-3 text-[11px] text-zinc-400">
        <p>
          Antes del embudo: <span className="font-semibold text-zinc-600">{counts.lead}</span> lead
          {counts.lead === 1 ? "" : "s"} ({fmtCurrency(values.lead)}).
        </p>
        <p>
          Sin contar {counts.closed_lost} cerrada{counts.closed_lost === 1 ? "" : "s"} perdida
          {counts.closed_lost === 1 ? "" : "s"} ({fmtCurrency(values.closed_lost)}): no guardamos
          hasta qué etapa habían llegado.
        </p>
      </div>
    </section>
  );
}
