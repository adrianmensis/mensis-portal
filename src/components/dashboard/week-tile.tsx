import type { ReactNode } from "react";

// Tarjeta de la semana: el número grande es lo de esta semana, y abajo va la
// comparación con la anterior. La flecha y el texto llevan el sentido; el color
// solo acompaña — nunca es lo único que dice si algo va bien o mal.

// Hacia dónde conviene que se mueva el número. "down" es para lo que uno quiere
// ver bajar (oportunidades perdidas), "none" para lo que no tiene lado bueno.
type Good = "up" | "down" | "none";

function deltaTone(delta: number, good: Good) {
  if (delta === 0 || good === "none") return "text-zinc-400";
  const positive = good === "up" ? delta > 0 : delta < 0;
  return positive ? "text-emerald-600" : "text-red-500";
}

export function WeekTile({
  label,
  value,
  previous,
  good = "up",
  unit,
  footer,
}: {
  label: string;
  value: number;
  previous?: number;
  good?: Good;
  unit?: string;
  footer?: ReactNode;
}) {
  const delta = previous === undefined ? 0 : value - previous;

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[2.1rem] font-bold leading-none tracking-tight text-zinc-900">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-zinc-400">{unit}</span>}
      </p>

      {previous !== undefined && (
        <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${deltaTone(delta, good)}`}>
          {delta !== 0 && (
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden
              className={delta > 0 ? "" : "rotate-180"}
            >
              <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
            </svg>
          )}
          {delta === 0 ? "Igual que" : `${delta > 0 ? "+" : ""}${delta} vs`} la semana anterior
        </p>
      )}

      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
