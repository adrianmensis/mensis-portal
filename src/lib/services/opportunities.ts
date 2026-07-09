import type { SupabaseClient } from "@supabase/supabase-js";
import type { Opportunity, OpportunityStage, Profile, VideoPlatform } from "@/lib/types";
import { OPPORTUNITY_STAGES, VIDEO_PLATFORMS, stageRequiresClientRequest } from "@/lib/types";
import { annualAmount, type PlanKey, type BillingPeriod } from "@/lib/pricing";

export type OpportunityWithPartner = Opportunity & { partner_name: string | null };

export type OpportunityFilters = { partner?: string; stage?: string };

export async function listOpportunities(
  supabase: SupabaseClient,
  filters: OpportunityFilters = {},
  opts: { withPartner?: boolean } = {},
): Promise<OpportunityWithPartner[]> {
  let query = supabase.from("opportunities").select("*").order("created_at", { ascending: false });
  if (filters.partner) query = query.eq("partner_id", filters.partner);
  if (filters.stage) query = query.eq("stage", filters.stage);
  const { data } = await query;
  const opps = (data ?? []) as Opportunity[];

  if (!opts.withPartner) {
    return opps.map((o) => ({ ...o, partner_name: null }));
  }

  const { data: profiles } = await supabase.from("profiles").select("id, full_name, email");
  const names = new Map(
    (profiles ?? []).map((p: Pick<Profile, "id" | "full_name" | "email">) => [
      p.id,
      p.full_name ?? p.email ?? null,
    ]),
  );
  return opps.map((o) => ({ ...o, partner_name: names.get(o.partner_id) ?? null }));
}

export async function getOpportunity(
  supabase: SupabaseClient,
  id: string,
): Promise<OpportunityWithPartner | null> {
  // RLS scopes this to rows the caller may see (own row, or all for admin).
  const { data } = await supabase.from("opportunities").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const opp = data as Opportunity;
  const { data: prof } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", opp.partner_id)
    .maybeSingle();
  const p = prof as Pick<Profile, "full_name" | "email"> | null;
  return { ...opp, partner_name: p?.full_name ?? p?.email ?? null };
}

export type CreateOpportunityInput = {
  client_name: string;
  website?: string;
  collaborators?: number | null;
  estimated_avatars?: number | null;
  plan?: PlanKey;
  billing_period?: BillingPeriod;
  custom_price?: number | null;
  stage?: OpportunityStage;
  notes?: string;
};

const VALID_PLANS: PlanKey[] = ["small_business", "starter", "business", "enterprise"];

function normalizePlan(plan: unknown): PlanKey {
  return VALID_PLANS.includes(plan as PlanKey) ? (plan as PlanKey) : "starter";
}

function normalizeBilling(billing: unknown): BillingPeriod {
  return billing === "annual" ? "annual" : "monthly";
}

function normalizeStage(stage: unknown): OpportunityStage {
  return OPPORTUNITY_STAGES.includes(stage as OpportunityStage)
    ? (stage as OpportunityStage)
    : "lead";
}

export async function createOpportunity(
  supabase: SupabaseClient,
  partnerId: string,
  input: CreateOpportunityInput,
) {
  if (!input.client_name?.trim()) throw new Error("El nombre del prospecto es obligatorio.");
  const avatars = input.estimated_avatars ?? null;
  const plan = normalizePlan(input.plan);
  const billing = normalizeBilling(input.billing_period);
  const customPrice = input.custom_price ?? null;
  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      partner_id: partnerId,
      client_name: input.client_name.trim(),
      website: input.website || null,
      collaborators: input.collaborators ?? null,
      estimated_avatars: avatars,
      plan,
      billing_period: billing,
      custom_price: customPrice,
      // Valor anual del contrato (ACV) según el plan y la facturación elegidos.
      estimated_value: annualAmount(avatars, plan, billing, customPrice),
      stage: normalizeStage(input.stage),
      notes: input.notes || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Opportunity;
}

export type UpdateOpportunityInput = Partial<{
  client_name: string;
  website: string | null;
  collaborators: number | null;
  estimated_avatars: number | null;
  plan: PlanKey;
  billing_period: BillingPeriod;
  custom_price: number | null;
  notes: string | null;
  stage: OpportunityStage;
  country: string | null;
  contact_name: string | null;
  contact_email: string | null;
  video_platform: VideoPlatform | null;
  requires_pilot: boolean | null;
  tenant_url: string | null;
  admin_user: string | null;
}>;

// Fields a partner may edit on their own opportunity (base info, funnel + client
// request).
const PARTNER_FIELDS = [
  "client_name",
  "website",
  "collaborators",
  "estimated_avatars",
  "plan",
  "billing_period",
  "custom_price",
  "notes",
  "stage",
  "country",
  "contact_name",
  "contact_email",
  "video_platform",
  "requires_pilot",
] as const;

// Pricing inputs — any change recomputes the stored annual contract value.
const PRICING_FIELDS = ["estimated_avatars", "plan", "billing_period", "custom_price"];
// Provisioning fields only Mensis (admin) may write.
const ADMIN_ONLY_FIELDS = ["tenant_url", "admin_user"] as const;

// Role-aware update: strips fields the caller isn't allowed to touch and gates
// stage changes on the client-request block being complete (Salesforce-style).
export async function updateOpportunity(
  supabase: SupabaseClient,
  id: string,
  input: UpdateOpportunityInput,
  ctx: { isAdmin: boolean; userId: string },
): Promise<Opportunity> {
  // RLS scopes this read to rows the caller may see: own rows, all rows for an
  // admin, or the whole network minus Mensis' deals for a partner_admin.
  const { data: current } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!current) throw new Error("Oportunidad no encontrada.");
  const opp = current as Opportunity;

  // A partner_admin reads the network but writes only its own rows. RLS would
  // reject the write anyway; this turns that into a legible error.
  if (!ctx.isAdmin && opp.partner_id !== ctx.userId) {
    throw new Error("Solo puedes editar las oportunidades que registraste.");
  }

  const allowed: readonly string[] = ctx.isAdmin
    ? [...PARTNER_FIELDS, ...ADMIN_ONLY_FIELDS]
    : PARTNER_FIELDS;
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in input) patch[key] = (input as Record<string, unknown>)[key];
  }

  if ("stage" in patch && !OPPORTUNITY_STAGES.includes(patch.stage as OpportunityStage)) {
    throw new Error("Etapa inválida.");
  }
  if (
    "video_platform" in patch &&
    patch.video_platform != null &&
    !VIDEO_PLATFORMS.includes(patch.video_platform as VideoPlatform)
  ) {
    throw new Error("Plataforma de videollamadas inválida.");
  }
  if ("client_name" in patch) {
    const name = String(patch.client_name ?? "").trim();
    if (!name) throw new Error("El nombre del cliente es obligatorio.");
    patch.client_name = name;
  }
  if ("plan" in patch) patch.plan = normalizePlan(patch.plan);
  if ("billing_period" in patch) patch.billing_period = normalizeBilling(patch.billing_period);
  if ("estimated_avatars" in patch) {
    patch.estimated_avatars = patch.estimated_avatars == null ? null : Number(patch.estimated_avatars);
  }

  // Validate the client-request block against the resulting record.
  const next = { ...opp, ...patch } as Opportunity;

  // Recompute the annual contract value when any pricing input changed.
  if (PRICING_FIELDS.some((f) => f in patch)) {
    patch.estimated_value = annualAmount(
      next.estimated_avatars,
      next.plan,
      next.billing_period,
      next.custom_price,
    );
  }
  if (stageRequiresClientRequest(next.stage)) {
    const missing: string[] = [];
    if (!next.country?.trim()) missing.push("país de la empresa");
    if (!next.video_platform) missing.push("plataforma de videollamadas");
    if (next.requires_pilot == null) missing.push("¿requiere piloto?");
    if (!next.contact_name?.trim()) missing.push("nombre del contacto");
    if (!next.contact_email?.trim()) missing.push("correo del contacto");
    if (missing.length) {
      throw new Error(
        `Para pasar a "Piloto" completa la solicitud de creación de tenant: ${missing.join(", ")}.`,
      );
    }
  }

  if (Object.keys(patch).length === 0) return opp;

  const { data, error } = await supabase
    .from("opportunities")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Opportunity;
}
