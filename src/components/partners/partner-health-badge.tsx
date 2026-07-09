"use client";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { fmtDate } from "@/lib/format";
import {
  HEALTH_LABELS,
  INACTIVE_DAYS,
  partnerHealth,
  type HealthInput,
  type PartnerHealth,
} from "@/lib/partner-health";

const TONE_BY_HEALTH: Record<PartnerHealth, BadgeTone> = {
  healthy: "emerald",
  at_risk: "amber",
  inactive: "red",
};

// Regla de los 90 días: verde si registró una oportunidad hace poco, ámbar
// cuando se acerca al límite, rojo cuando lo cruzó.
export function PartnerHealthBadge({ partner }: { partner: HealthInput }) {
  const { health, days, hasOpportunities } = partnerHealth(partner);

  const detail = hasOpportunities
    ? `Última oportunidad hace ${days} día${days === 1 ? "" : "s"} (${fmtDate(partner.last_opportunity_at!)})`
    : days > INACTIVE_DAYS
      ? `Sin oportunidades desde su ingreso, hace ${days} días`
      : `Sin oportunidades aún · ${INACTIVE_DAYS - days} día${INACTIVE_DAYS - days === 1 ? "" : "s"} de gracia`;

  return (
    <span title={detail}>
      <Badge tone={TONE_BY_HEALTH[health]}>{HEALTH_LABELS[health]}</Badge>
    </span>
  );
}
