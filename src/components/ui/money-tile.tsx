import type { ReactNode } from "react";

// Tarjeta para los montos. Es la misma idea que StatCard pero el número manda:
// más grande, en color, con la etiqueta arriba en chico. Se usa donde la plata
// es la noticia (pipeline, comisiones, cerrado) y no un conteo más.
//
// Cifras proporcionales a propósito: `tabular-nums` a este tamaño deja los
// números flojos, y acá no hay ninguna columna con la que alinearse.

export type MoneyTone = "brand" | "emerald" | "red" | "zinc";

const TONES: Record<MoneyTone, { box: string; label: string; value: string }> = {
  brand: {
    box: "border-brand/15 bg-brand/[0.04]",
    label: "text-brand/70",
    value: "text-brand",
  },
  emerald: {
    box: "border-emerald-200/70 bg-emerald-50/60",
    label: "text-emerald-700/70",
    value: "text-emerald-700",
  },
  red: {
    box: "border-red-200/70 bg-red-50/50",
    label: "text-red-600/70",
    value: "text-red-600",
  },
  zinc: {
    box: "border-zinc-200 bg-white",
    label: "text-zinc-400",
    value: "text-zinc-900",
  },
};

export function MoneyTile({
  label,
  value,
  sub,
  tone = "zinc",
  footer,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: MoneyTone;
  footer?: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div className={`flex flex-col rounded-2xl border p-5 ${t.box}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-widest ${t.label}`}>{label}</p>
      <p className={`mt-3 text-[2.1rem] font-bold leading-none tracking-tight ${t.value}`}>
        {value}
      </p>
      {sub && <p className="mt-2 text-xs text-zinc-400">{sub}</p>}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
