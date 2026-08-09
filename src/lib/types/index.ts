import type { PlanKey, BillingPeriod } from "@/lib/pricing";
import type { BadgeTone } from "@/components/ui/badge";

// admin        — Mensis staff. Sees everything, including Mensis' own deals.
// partner_admin — runs the partner network: manages partner accounts and reads
//                 the whole pipeline except Mensis' own deals.
// partner       — sees and edits only what it registered.
export type Role = "admin" | "partner_admin" | "partner";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  partner_admin: "Partner Admin",
  partner: "Partner",
};

// Roles the Partners tab may assign. `admin` is deliberately absent: Mensis
// staff accounts are provisioned in SQL, never through the partner UI.
export const ASSIGNABLE_PARTNER_ROLES = ["partner", "partner_admin"] as const;
export type PartnerRole = (typeof ASSIGNABLE_PARTNER_ROLES)[number];

export const PARTNER_CATEGORIES = ["consultor", "empresa"] as const;
export type PartnerCategory = (typeof PARTNER_CATEGORIES)[number];

export const PARTNER_CATEGORY_LABELS: Record<PartnerCategory, string> = {
  consultor: "Consultor",
  empresa: "Empresa",
};

// Etapas por las que pasa un candidato hasta quedar activo en la red. En orden.
export const PARTNER_STAGES = [
  "IA Partner Showcase",
  "Business Discovery",
  "Contract Review",
  "Partner!",
] as const;

export type PartnerStage = (typeof PARTNER_STAGES)[number];

export const PARTNER_STAGE_TONES: Record<PartnerStage, BadgeTone> = {
  "IA Partner Showcase": "neutral",
  "Business Discovery": "blue",
  "Contract Review": "amber",
  "Partner!": "emerald",
};

export const DEFAULT_PARTNER_STAGE: PartnerStage = "IA Partner Showcase";

export function isPartnerStage(value: unknown): value is PartnerStage {
  return PARTNER_STAGES.includes(value as PartnerStage);
}

export type Profile = {
  id: string;
  role: Role;
  seq: number;
  full_name: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  referred_by: string | null;
  entry_date: string | null;
  process_stage: PartnerStage | null;
  // Fecha de firma del contrato ("YYYY-MM-DD"). La pone la base al llegar a
  // "Partner!" y alimenta la meta semanal (ver lib/partner-goal).
  signed_on: string | null;
  linkedin_url: string | null;
  category: PartnerCategory | null;
  reference: string | null;
  active: boolean;
  created_at: string;
};

// Una eliminación de partner, tal como quedó registrada en la bitácora. El
// partner ya no existe: esto es la foto que se guardó antes de borrarlo.
export type PartnerDeletion = {
  id: string;
  partner_seq: number | null;
  full_name: string | null;
  email: string | null;
  country: string | null;
  phone: string | null;
  category: PartnerCategory | null;
  process_stage: string | null;
  entry_date: string | null;
  reference: string | null;
  referred_by: string | null;
  partner_role: Role | null;
  linkedin_url: string | null;
  partner_created_at: string | null;
  opportunity_count: number;
  deleted_by: string | null;
  deleted_by_name: string | null;
  deleted_by_email: string | null;
  deleted_at: string;
};

// Commercial funnel stage — the single source of truth for where a prospect
// sits in the sales process. `closed_lost` es la salida: un estado terminal
// que no forma parte del camino y siempre lleva un motivo.
export type OpportunityStage =
  | "lead"
  | "meeting_scheduled"
  | "pilot"
  | "tenant_creation"
  | "client"
  | "closed_lost";

// Motivos por los que se pierde una oportunidad. Códigos estables en la base
// (ver el check de `lost_reason`); las etiquetas se muestran en la UI.
export const LOST_REASONS = [
  "price",
  "no_budget",
  "competitor",
  "no_response",
  "timing",
  "no_fit",
  "other",
] as const;

export type LostReason = (typeof LOST_REASONS)[number];

export const LOST_REASON_LABELS: Record<LostReason, string> = {
  price: "Precio",
  no_budget: "Sin presupuesto",
  competitor: "Eligió a un competidor",
  no_response: "El cliente dejó de responder",
  timing: "No es el momento",
  no_fit: "No encaja / sin caso de uso",
  other: "Otro",
};

export function isLostReason(value: unknown): value is LostReason {
  return LOST_REASONS.includes(value as LostReason);
}

// Industria del prospecto. Códigos estables en la base, etiquetas en español.
// Aseguradoras, corredoras y brokers comparten "insurance": para el negocio son
// el mismo mercado.
export const INDUSTRIES = [
  "insurance",
  "banking",
  "consulting",
  "legal",
  "technology",
  "government",
  "education",
  "healthcare",
  "retail",
  "manufacturing",
  "logistics",
  "real_estate",
  "hospitality",
  "media",
  "energy",
  "agriculture",
  "nonprofit",
  "other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const INDUSTRY_LABELS: Record<Industry, string> = {
  insurance: "Seguros",
  banking: "Banca y finanzas",
  consulting: "Consultoría",
  legal: "Legal",
  technology: "Tecnología",
  government: "Gobierno",
  education: "Educación",
  healthcare: "Salud",
  retail: "Retail y consumo",
  manufacturing: "Manufactura e industria",
  logistics: "Logística y transporte",
  real_estate: "Inmobiliaria y construcción",
  hospitality: "Turismo y hotelería",
  media: "Medios y publicidad",
  energy: "Energía y servicios básicos",
  agriculture: "Agro",
  nonprofit: "ONG y fundaciones",
  other: "Otra",
};

export function isIndustry(value: unknown): value is Industry {
  return INDUSTRIES.includes(value as Industry);
}

export type Opportunity = {
  id: string;
  partner_id: string;
  client_name: string;
  website: string | null;
  industry: Industry | null;
  collaborators: number | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  country: string | null;
  estimated_avatars: number | null;
  estimated_value: number | null; // annual contract value (ACV)
  plan: PlanKey;
  billing_period: BillingPeriod;
  custom_price: number | null; // negotiated per-twin price for Enterprise
  notes: string | null;
  stage: OpportunityStage;
  // Solo con stage = "closed_lost"; se limpian al reabrir.
  lost_reason: LostReason | null;
  lost_notes: string | null;
  closed_lost_at: string | null;
  seq: number;
  // Client request (captured on the way to "Creación de tenant").
  video_platform: VideoPlatform | null;
  requires_pilot: boolean | null;
  // Mensis provisioning (admin only).
  tenant_url: string | null;
  admin_user: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoPlatform = "teams" | "google_meet";

export const VIDEO_PLATFORMS = ["teams", "google_meet"] as const;

export const VIDEO_PLATFORM_LABELS: Record<VideoPlatform, string> = {
  teams: "Microsoft Teams",
  google_meet: "Google Meet",
};

// Use case ("caso de uso") — a vertical card grouping target accounts, e.g.
// Aseguradoras, Bancos y Consultoras. Loaded by admins, browsed by everyone.
export type UseCase = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  accent: string | null;
  sort_order: number;
  created_at: string;
};

// A use case plus how many accounts it holds — powers the card grid.
export type UseCaseWithCount = UseCase & { account_count: number };

// Target account ("Cuenta objetivo") — a curated prospecting record inside a
// use case. Loaded by admins, read and filtered by every partner.
export type TargetAccount = {
  id: string;
  use_case_id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  country: string | null; // ISO alpha-2
  company: string;
  email: string | null;
  website: string | null;
  linkedin_url: string | null;
  phone: string | null;
  winning_message: string | null;
  created_by: string | null;
  created_at: string;
};

export type Material = {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
};

// El embudo, en orden. "closed_lost" queda fuera a propósito: no es un paso
// del camino, así que no participa del orden ni de `stageReached`.
export const OPPORTUNITY_STAGES = [
  "lead",
  "meeting_scheduled",
  "tenant_creation",
  "pilot",
  "client",
] as const satisfies readonly OpportunityStage[];

// Todas las etapas válidas, embudo + salida. Sirve para validar y para contar.
export const ALL_OPPORTUNITY_STAGES: readonly OpportunityStage[] = [
  ...OPPORTUNITY_STAGES,
  "closed_lost",
];

export function isOpportunityStage(value: unknown): value is OpportunityStage {
  return ALL_OPPORTUNITY_STAGES.includes(value as OpportunityStage);
}

export const STAGE_LABELS: Record<OpportunityStage, string> = {
  lead: "Lead",
  meeting_scheduled: "Reunión agendada",
  tenant_creation: "Creación de tenant",
  pilot: "Piloto",
  client: "Cliente cerrado",
  closed_lost: "Cerrada perdida",
};

export const STAGE_STYLES: Record<OpportunityStage, string> = {
  lead: "bg-zinc-100 text-zinc-600 ring-zinc-400/20",
  meeting_scheduled: "bg-amber-50 text-amber-700 ring-amber-600/20",
  pilot: "bg-blue-50 text-blue-700 ring-blue-600/20",
  tenant_creation: "bg-violet-50 text-violet-700 ring-violet-600/20",
  client: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  closed_lost: "bg-red-50 text-red-600 ring-red-500/20",
};

// True when `stage` is at or beyond `target` in the funnel order. Una
// oportunidad perdida no alcanzó nada: está fuera del embudo.
export function stageReached(stage: OpportunityStage, target: OpportunityStage) {
  const funnel: readonly OpportunityStage[] = OPPORTUNITY_STAGES;
  const i = funnel.indexOf(stage);
  const t = funnel.indexOf(target);
  return i >= 0 && t >= 0 && i >= t;
}

// From this stage on, the tenant-request block (país, plataforma, piloto,
// contacto) must be complete. The request is filled during "Creación de tenant";
// it's required to move on to "Piloto". Used to gate stage changes.
export function stageRequiresClientRequest(stage: OpportunityStage) {
  return stageReached(stage, "pilot");
}
