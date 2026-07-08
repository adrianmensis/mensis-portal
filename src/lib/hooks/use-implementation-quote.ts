"use client";

import { useState } from "react";
import { fmtCurrency } from "@/lib/format";
import type { QuoteClient, QuoteDoc } from "@/lib/quote-print";

// Implementation activities, in the order they happen during onboarding.
// Everything is estimated in HOURS and multiplied by the consultant rate.
export const IMPLEMENTATION_ACTIVITIES = [
  {
    key: "tenant",
    name: "Solicitud de creación de tenant de Mensis",
    def: 1,
    tooltip: "Primera actividad: se solicita la creación del tenant de Mensis para la empresa.",
  },
  {
    key: "datos",
    name: "Preparación de datos",
    def: 8,
    optional: true,
    tooltip: "Analizar documentos y transcripciones pasadas de la empresa para entrenar la IA inicialmente.",
  },
  { key: "capAdmin", name: "Capacitación a usuarios admin", def: 4 },
  { key: "crearAdmin", name: "Creación de usuarios admin", def: 2 },
  { key: "kickoff", name: "Kickoff de usuarios consumidores", def: 2, perUsers: true },
  {
    key: "crearCons",
    name: "Creación de usuarios consumidores",
    def: 6,
    perUsers: true,
    tooltip: "Integración con Microsoft o Meets y creación de perfil.",
  },
  { key: "capCons", name: "Capacitación de usuarios consumidores", def: 6, perUsers: true },
  { key: "acompanamiento", name: "Acompañamiento inicial", def: 10 },
] as const;

const DEFAULT_HOURS: Record<string, number> = Object.fromEntries(
  IMPLEMENTATION_ACTIVITIES.map((a) => [a.key, a.def]),
);

// State + hour math for the implementation quoter.
export function useImplementationQuote() {
  const [usuarios, setUsuarios] = useState(100);
  const [rate, setRate] = useState(30);
  const [hours, setHours] = useState<Record<string, number>>(DEFAULT_HOURS);
  const [includeDatos, setIncludeDatos] = useState(true);

  const isCounted = (key: string) => key !== "datos" || includeDatos;
  const setHour = (key: string, v: number) => setHours((prev) => ({ ...prev, [key]: v }));

  const totalHoras = IMPLEMENTATION_ACTIVITIES.reduce(
    (sum, a) => sum + (isCounted(a.key) ? hours[a.key] ?? 0 : 0),
    0,
  );
  const total = totalHoras * rate;

  const buildDoc = (client: QuoteClient): QuoteDoc => ({
    kind: "Implementación",
    client,
    lines: IMPLEMENTATION_ACTIVITIES.filter((a) => isCounted(a.key)).map((a) => {
      const h = hours[a.key] ?? 0;
      return { label: a.name, sub: `${h} h × ${fmtCurrency(rate)}/h`, value: fmtCurrency(h * rate) };
    }),
    totals: [
      { label: "Total horas", value: `${totalHoras} h` },
      { label: "Total implementación", value: fmtCurrency(total), strong: true },
    ],
  });

  return {
    usuarios, setUsuarios,
    rate, setRate,
    hours, setHour,
    includeDatos, setIncludeDatos,
    isCounted, totalHoras, total,
    buildDoc,
  };
}
