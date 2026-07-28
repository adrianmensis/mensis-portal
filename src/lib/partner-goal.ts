// Meta semanal de la red: cuántos contratos se firman por semana.
//
// Se mide contra `signed_on` (la fecha de firma), no contra la etapa actual:
// lo que cuenta es cuándo se cerró, no dónde está el partner hoy.

// Contratos firmados que se esperan cada semana. Es el único número a cambiar
// si la meta sube o baja.
export const WEEKLY_SIGNED_GOAL = 3;

export type Week = { start: Date; end: Date };

// La semana corre de lunes a domingo, en hora local. `end` es el lunes
// siguiente (exclusivo), para comparar con `< end` sin casos borde.
export function currentWeek(now: Date = new Date()): Week {
  const start = new Date(now);
  const mondayOffset = (start.getDay() + 6) % 7; // domingo = 6, lunes = 0
  start.setDate(start.getDate() - mondayOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}

// Las fechas sueltas ("YYYY-MM-DD") se leen como medianoche local: parsearlas
// como UTC correría un día en husos detrás de Greenwich y movería de semana a
// los que firmaron un lunes.
function localDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function signedInWeek(
  partners: { signed_on: string | null }[],
  week: Week,
): number {
  return partners.filter((p) => {
    if (!p.signed_on) return false;
    const d = localDate(p.signed_on).getTime();
    return d >= week.start.getTime() && d < week.end.getTime();
  }).length;
}

// Días que quedan de la semana, contando el de hoy.
export function daysLeftInWeek(week: Week, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((week.end.getTime() - now.getTime()) / 86_400_000));
}

export function weekLabel(week: Week): string {
  const last = new Date(week.end);
  last.setDate(last.getDate() - 1); // el domingo, no el lunes siguiente
  const fmt = (d: Date) => d.toLocaleDateString("es", { day: "numeric", month: "short" });
  return `${fmt(week.start)} – ${fmt(last)}`;
}
