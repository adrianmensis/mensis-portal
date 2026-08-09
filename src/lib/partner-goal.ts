// Meta semanal de la red: cuántos contratos se firman por semana.
//
// Se mide contra `signed_on` (la fecha de firma), no contra la etapa actual:
// lo que cuenta es cuándo se cerró, no dónde está el partner hoy. El corte de
// la semana vive en lib/week.

import { countInWeek, type Week } from "@/lib/week";

// Contratos firmados que se esperan cada semana. Es el único número a cambiar
// si la meta sube o baja.
export const WEEKLY_SIGNED_GOAL = 3;

export function signedInWeek(partners: { signed_on: string | null }[], week: Week): number {
  return countInWeek(partners.map((p) => p.signed_on), week);
}
