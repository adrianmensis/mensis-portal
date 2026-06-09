import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "amber" | "blue" | "emerald" | "red" | "brand";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-zinc-100 text-zinc-500 ring-zinc-400/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  red: "bg-red-50 text-red-600 ring-red-500/20",
  brand: "bg-brand/8 text-brand ring-brand/15",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
