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
// sits in the sales process.
export type OpportunityStage =
  | "lead"
  | "meeting_scheduled"
  | "pilot"
  | "tenant_creation"
  | "client";

export type Opportunity = {
  id: string;
  partner_id: string;
  client_name: string;
  website: string | null;
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

// Ordered for the funnel dropdown; keys match the DB check constraint.
export const OPPORTUNITY_STAGES = [
  "lead",
  "meeting_scheduled",
  "tenant_creation",
  "pilot",
  "client",
] as const;

export const STAGE_LABELS: Record<OpportunityStage, string> = {
  lead: "Lead",
  meeting_scheduled: "Reunión agendada",
  tenant_creation: "Creación de tenant",
  pilot: "Piloto",
  client: "Cliente cerrado",
};

export const STAGE_STYLES: Record<OpportunityStage, string> = {
  lead: "bg-zinc-100 text-zinc-600 ring-zinc-400/20",
  meeting_scheduled: "bg-amber-50 text-amber-700 ring-amber-600/20",
  pilot: "bg-blue-50 text-blue-700 ring-blue-600/20",
  tenant_creation: "bg-violet-50 text-violet-700 ring-violet-600/20",
  client: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

// True when `stage` is at or beyond `target` in the funnel order.
export function stageReached(stage: OpportunityStage, target: OpportunityStage) {
  return OPPORTUNITY_STAGES.indexOf(stage) >= OPPORTUNITY_STAGES.indexOf(target);
}

// From this stage on, the tenant-request block (país, plataforma, piloto,
// contacto) must be complete. The request is filled during "Creación de tenant";
// it's required to move on to "Piloto". Used to gate stage changes.
export function stageRequiresClientRequest(stage: OpportunityStage) {
  return stageReached(stage, "pilot");
}
