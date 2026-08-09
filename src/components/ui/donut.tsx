// Dona de parte-sobre-el-todo. El agujero del medio lleva el total, así el
// gráfico dice de una el número grande y el reparto al mismo tiempo.
//
// La leyenda no es decoración: trae la etiqueta y el valor de cada porción, así
// que todo lo que dice la dona se puede leer sin distinguir un solo color —
// que es lo que hace falta cuando dos tintas se parecen o se imprime en gris.

export type DonutSlice = {
  key: string;
  label: string;
  value: number;
  color: string;
  // Texto secundario de la leyenda (p. ej. el monto anual).
  note?: string;
};

// Paleta categórica, en orden fijo: una categoría se pinta por su lugar en la
// lista, nunca por cuánto mide, así un filtro no repinta a las que quedan.
// Validada para daltonismo contra el fondo claro (ΔE ≥ 8 en cada par vecino).
export const DONUT_COLORS = ["#4F6BD8", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];
export const DONUT_NEUTRAL = "#A1A1AA"; // zinc-400 — para "sin dato", no es una categoría

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 1.4; // separación entre porciones, en unidades del viewBox

export function Donut({
  slices,
  total,
  centerLabel,
  size = 148,
}: {
  slices: DonutSlice[];
  total: number;
  centerLabel: string;
  size?: number;
}) {
  const shown = slices.filter((s) => s.value > 0);
  // Con una sola porción no hay nada que separar: el hueco quedaría como una
  // muesca suelta en un anillo entero.
  const gap = shown.length > 1 ? GAP : 0;

  // Cada porción arranca donde terminan las anteriores. Se calcula sumando lo
  // previo en vez de arrastrar un acumulador: son seis porciones como mucho, y
  // así el render no depende del orden en que se evalúa el map.
  const arcs = shown.map((s, i) => {
    const before = shown.slice(0, i).reduce((sum, p) => sum + p.value, 0);
    return {
      slice: s,
      length: (s.value / total) * CIRCUMFERENCE,
      offset: (before / total) * CIRCUMFERENCE,
    };
  });

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#f4f4f5" strokeWidth="13" />
          {arcs.map(({ slice, length, offset }) => {
            const dash = Math.max(0, length - gap);
            return (
              <circle
                key={slice.key}
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth="13"
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={-offset}
              >
                <title>
                  {`${slice.label}: ${slice.value} (${Math.round((slice.value / total) * 100)}%)`}
                </title>
              </circle>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none tracking-tight text-zinc-900">
            {total}
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-zinc-400">
            {centerLabel}
          </span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {slices.map((s) => (
          <li key={s.key} className="flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              <span className="truncate text-xs text-zinc-600">{s.label}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-2">
              <span className="text-xs font-semibold text-zinc-900">{s.value}</span>
              {s.note && <span className="text-[11px] text-zinc-400">{s.note}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
