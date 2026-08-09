import type { CsvColumn } from "@/lib/csv";
import type { OpportunityWithPartner } from "@/lib/services/opportunities";
import { countryByCode } from "@/lib/countries";
import { opportunityCode } from "@/lib/format";
import { PLAN_BY_KEY, commission } from "@/lib/pricing";
import {
  INDUSTRY_LABELS,
  LOST_REASON_LABELS,
  STAGE_LABELS,
  VIDEO_PLATFORM_LABELS,
} from "@/lib/types";

// Columnas del CSV de oportunidades. Van más campos que en la tabla: el archivo
// es para trabajarlo fuera (Excel, reportes), no para leerlo en pantalla.
// `withPartner` agrega quién la registró — solo tiene sentido en el pipeline de
// la red, donde esa columna viene cargada.
export function opportunityCsvColumns(
  { withPartner = false } = {},
): CsvColumn<OpportunityWithPartner>[] {
  return [
    { header: "Código", value: (o) => opportunityCode(o.seq) },
    { header: "Prospecto", value: (o) => o.client_name },
    { header: "País", value: (o) => countryByCode(o.country)?.name ?? o.country },
    { header: "Industria", value: (o) => (o.industry ? INDUSTRY_LABELS[o.industry] : "") },
    { header: "Sitio web", value: (o) => o.website },
    ...(withPartner
      ? [{ header: "Partner", value: (o: OpportunityWithPartner) => o.partner_name }]
      : []),
    { header: "Estado", value: (o) => STAGE_LABELS[o.stage] },
    { header: "Motivo de pérdida", value: (o) => (o.lost_reason ? LOST_REASON_LABELS[o.lost_reason] : "") },
    { header: "Detalle de la pérdida", value: (o) => o.lost_notes },
    { header: "Fecha de cierre perdida", value: (o) => o.closed_lost_at?.slice(0, 10) },
    { header: "Colaboradores", value: (o) => o.collaborators },
    { header: "Gemelos digitales", value: (o) => o.estimated_avatars },
    { header: "Plan", value: (o) => PLAN_BY_KEY[o.plan]?.name ?? o.plan },
    { header: "Facturación", value: (o) => (o.billing_period === "annual" ? "Anual" : "Mensual") },
    { header: "Precio negociado", value: (o) => o.custom_price },
    { header: "Monto anual (USD)", value: (o) => o.estimated_value ?? 0 },
    { header: "Comisión anual (USD)", value: (o) => commission(o.estimated_value ?? 0) },
    { header: "Contacto", value: (o) => o.contact_name },
    { header: "Correo del contacto", value: (o) => o.contact_email },
    { header: "Teléfono del contacto", value: (o) => o.contact_phone },
    {
      header: "Plataforma de videollamadas",
      value: (o) => (o.video_platform ? VIDEO_PLATFORM_LABELS[o.video_platform] : ""),
    },
    {
      header: "¿Requiere piloto?",
      value: (o) => (o.requires_pilot == null ? "" : o.requires_pilot ? "Sí" : "No"),
    },
    { header: "Tenant URL", value: (o) => o.tenant_url },
    { header: "Notas", value: (o) => o.notes },
    { header: "Registrado", value: (o) => o.created_at.slice(0, 10) },
  ];
}
