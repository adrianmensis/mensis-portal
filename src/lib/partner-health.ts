// Regla de los 90 días: ¿este partner está vendiendo?
//
// La única señal que cuenta es haber registrado una oportunidad nueva. Editar
// una existente o moverla de etapa no cuenta — un partner que solo trabaja su
// cartera vieja no está trayendo negocio nuevo.
//
// Un partner que todavía no registró nada tiene 90 días de gracia desde su
// fecha de ingreso antes de aparecer en rojo.

export type PartnerHealth = "healthy" | "at_risk" | "inactive";

export const AT_RISK_DAYS = 60;
export const INACTIVE_DAYS = 90;

export const HEALTH_LABELS: Record<PartnerHealth, string> = {
  healthy: "Al día",
  at_risk: "En riesgo",
  inactive: "Sin actividad",
};

const DAY_MS = 86_400_000;

// Las fechas sueltas (entry_date, "YYYY-MM-DD") se leen como medianoche local
// para no perder un día en husos detrás de UTC; los timestamptz, tal cual.
function toTime(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`).getTime()
    : new Date(value).getTime();
}

export function daysSince(value: string, now: number = Date.now()) {
  return Math.max(0, Math.floor((now - toTime(value)) / DAY_MS));
}

export type HealthInput = {
  last_opportunity_at: string | null;
  entry_date: string | null;
  created_at: string;
};

export type HealthResult = {
  health: PartnerHealth;
  days: number;
  // false cuando el reloj corre desde el ingreso, no desde una oportunidad.
  hasOpportunities: boolean;
};

export function partnerHealth(p: HealthInput, now: number = Date.now()): HealthResult {
  const hasOpportunities = p.last_opportunity_at !== null;
  // Sin oportunidades el reloj arranca en el ingreso; si tampoco hay ingreso
  // cargado, en la fecha de alta de la cuenta.
  const anchor = p.last_opportunity_at ?? p.entry_date ?? p.created_at;
  const days = daysSince(anchor, now);

  if (!hasOpportunities) {
    // Período de gracia: recién pasados los 90 días entra en la regla normal,
    // y para entonces el ancla ya la cruzó, así que cae directo en inactive.
    return { health: days > INACTIVE_DAYS ? "inactive" : "healthy", days, hasOpportunities };
  }
  if (days > INACTIVE_DAYS) return { health: "inactive", days, hasOpportunities };
  if (days >= AT_RISK_DAYS) return { health: "at_risk", days, hasOpportunities };
  return { health: "healthy", days, hasOpportunities };
}
