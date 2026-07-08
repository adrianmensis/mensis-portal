import type { PlanKey, BillingPeriod } from "@/lib/pricing";

export type Role = "admin" | "partner";

export type PartnerCategory = "consultor" | "empresa";

export const PARTNER_CATEGORY_LABELS: Record<PartnerCategory, string> = {
  consultor: "Consultor",
  empresa: "Empresa",
};

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
  process_stage: string | null;
  linkedin_url: string | null;
  category: PartnerCategory | null;
  reference: string | null;
  active: boolean;
  created_at: string;
};

// Stages of the partner onboarding process. Adjust to match your real flow.
export const PARTNER_STAGES = [
  "Prospecto",
  "Entrevista",
  "Onboarding",
  "Activo",
  "Inactivo",
] as const;

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
