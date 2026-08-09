// Cortes por semana, en hora local.
//
// Todo lo que el portal mide "por semana" (altas de partners, oportunidades
// nuevas, contratos firmados) pasa por acá, así una misma fecha cae siempre en
// la misma semana sin importar quién la cuente. Es a propósito hora local y no
// UTC: en husos detrás de Greenwich, medir en UTC corre de semana a lo cargado
// un domingo por la tarde.

export type Week = { start: Date; end: Date };

// La semana corre de lunes a domingo. `end` es el lunes siguiente (exclusivo),
// para comparar con `< end` sin casos borde.
export function currentWeek(now: Date = new Date()): Week {
  const start = new Date(now);
  const mondayOffset = (start.getDay() + 6) % 7; // domingo = 6, lunes = 0
  start.setDate(start.getDate() - mondayOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}

export function previousWeek(week: Week): Week {
  const start = new Date(week.start);
  start.setDate(start.getDate() - 7);
  return { start, end: new Date(week.start) };
}

// Las fechas sueltas ("YYYY-MM-DD") se leen como medianoche local: parsearlas
// como UTC correría un día en husos detrás de Greenwich. Los timestamptz van
// tal cual.
function toTime(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`).getTime()
    : new Date(value).getTime();
}

export function inWeek(value: string | null | undefined, week: Week): boolean {
  if (!value) return false;
  const t = toTime(value);
  return t >= week.start.getTime() && t < week.end.getTime();
}

export function countInWeek(values: (string | null | undefined)[], week: Week): number {
  return values.reduce((n, v) => (inWeek(v, week) ? n + 1 : n), 0);
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
