import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  PartnerCategory,
  PartnerDeletion,
  PartnerRole,
  PartnerStage,
  Profile,
} from "@/lib/types";
import {
  ASSIGNABLE_PARTNER_ROLES,
  DEFAULT_PARTNER_STAGE,
  PARTNER_CATEGORIES,
  isPartnerStage,
} from "@/lib/types";

export type PartnerWithCount = Profile & {
  opportunity_count: number;
  // Alta más reciente de una oportunidad. Alimenta la regla de los 90 días
  // (ver lib/partner-health). null = todavía no registró ninguna.
  last_opportunity_at: string | null;
};

export function generatePassword() {
  return "Mp" + randomBytes(8).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
}

// The accounts this API owns. Mensis staff (`admin`) is never touched here.
const MANAGED_ROLES: string[] = [...ASSIGNABLE_PARTNER_ROLES];

function normalizeRole(role: unknown): PartnerRole {
  return ASSIGNABLE_PARTNER_ROLES.includes(role as PartnerRole) ? (role as PartnerRole) : "partner";
}

function normalizeCategory(category: unknown): PartnerCategory | null {
  return PARTNER_CATEGORIES.includes(category as PartnerCategory)
    ? (category as PartnerCategory)
    : null;
}

function normalizeStage(stage: unknown): PartnerStage {
  return isPartnerStage(stage) ? stage : DEFAULT_PARTNER_STAGE;
}

// Los errores de auth vienen en inglés y con jerga ("A user with this email
// address has already been registered"). Quien carga partners no tiene por qué
// descifrarlos: se traducen a algo accionable antes de llegar al modal.
function authErrorMessage(error: { message?: string; code?: string }, email: string) {
  const code = error.code ?? "";
  const raw = error.message ?? "";

  if (code === "email_exists" || /already been registered|already exists/i.test(raw)) {
    return `Ya existe una cuenta con el correo ${email}. Búscalo en la lista de partners (puede estar inactivo) o usa otro correo.`;
  }
  if (code === "validation_failed" || /invalid format|unable to validate email/i.test(raw)) {
    return `El correo ${email} no tiene un formato válido. Revisa que no le falte el dominio y que no tenga espacios ni tildes.`;
  }
  if (/password/i.test(raw)) {
    return "La contraseña generada fue rechazada por el proveedor de autenticación. Intenta de nuevo.";
  }
  if (/rate limit/i.test(raw)) {
    return "Se alcanzó el límite de creación de cuentas por minuto. Espera un momento y vuelve a intentarlo.";
  }
  return raw || "No se pudo completar la operación sobre la cuenta del partner.";
}

export async function listPartners(
  supabase: SupabaseClient,
): Promise<PartnerWithCount[]> {
  const [{ data: partners }, { data: opps }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .in("role", MANAGED_ROLES)
      .order("created_at", { ascending: false }),
    supabase.from("opportunities").select("partner_id, created_at"),
  ]);

  const counts = new Map<string, number>();
  const lastAt = new Map<string, string>();
  for (const o of opps ?? []) {
    counts.set(o.partner_id, (counts.get(o.partner_id) ?? 0) + 1);
    const prev = lastAt.get(o.partner_id);
    if (!prev || Date.parse(o.created_at) > Date.parse(prev)) lastAt.set(o.partner_id, o.created_at);
  }

  return (partners ?? []).map((p) => ({
    ...(p as Profile),
    opportunity_count: counts.get(p.id) ?? 0,
    last_opportunity_at: lastAt.get(p.id) ?? null,
  }));
}

export async function getPartner(
  supabase: SupabaseClient,
  id: string,
): Promise<PartnerWithCount | null> {
  // RLS scopes this read; the role check keeps admin profiles out of the tab.
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  const partner = data as Profile | null;
  if (!partner || !MANAGED_ROLES.includes(partner.role)) return null;

  const [{ count }, { data: last }] = await Promise.all([
    supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("partner_id", id),
    supabase
      .from("opportunities")
      .select("created_at")
      .eq("partner_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    ...partner,
    opportunity_count: count ?? 0,
    last_opportunity_at: (last as { created_at: string } | null)?.created_at ?? null,
  };
}

// Every mutation below runs through the service-role client, which bypasses
// RLS — so the target has to be re-checked here. Mensis staff accounts are
// provisioned in SQL and can't be edited, disabled or deleted from the
// Partners tab, not even by an admin.
async function requireManagedPartner(admin: SupabaseClient, id: string): Promise<Profile> {
  const { data } = await admin.from("profiles").select("*").eq("id", id).maybeSingle();
  const partner = data as Profile | null;
  if (!partner) throw new Error("Partner no encontrado.");
  if (!MANAGED_ROLES.includes(partner.role)) {
    throw new Error("Las cuentas de Mensis no se gestionan desde Partners.");
  }
  return partner;
}

export type CreatePartnerInput = {
  full_name: string;
  email: string;
  country?: string;
  phone?: string;
  referred_by?: string;
  entry_date?: string;
  process_stage?: PartnerStage;
  linkedin_url?: string;
  category?: PartnerCategory | null;
  reference?: string;
  role?: PartnerRole;
};

export async function createPartner(admin: SupabaseClient, input: CreatePartnerInput) {
  const password = generatePassword();
  const { error } = await admin.auth.admin.createUser({
    email: input.email,
    password,
    email_confirm: true,
    // handle_new_user() copies this metadata into public.profiles.
    user_metadata: {
      full_name: input.full_name,
      country: input.country ?? "",
      phone: input.phone ?? "",
      referred_by: input.referred_by || "Nathalia",
      entry_date: input.entry_date ?? "",
      process_stage: normalizeStage(input.process_stage),
      linkedin_url: input.linkedin_url ?? "",
      category: normalizeCategory(input.category) ?? "",
      reference: input.reference ?? "",
      role: normalizeRole(input.role),
    },
  });
  if (error) throw new Error(authErrorMessage(error, input.email));
  return { email: input.email, password };
}

export type UpdatePartnerInput = Partial<{
  full_name: string;
  email: string;
  country: string | null;
  phone: string | null;
  referred_by: string | null;
  entry_date: string | null;
  process_stage: PartnerStage;
  // Editable: el contrato puede haberse firmado días antes de cargarlo al
  // portal, y de esa fecha depende en qué semana cuenta para la meta.
  signed_on: string | null;
  linkedin_url: string | null;
  category: PartnerCategory | null;
  reference: string | null;
  role: PartnerRole;
}>;

// Profile columns the Partners tab may write. `email` is handled apart: it's
// the login, so auth.users has to change with it.
const EDITABLE_FIELDS = [
  "full_name",
  "country",
  "phone",
  "referred_by",
  "entry_date",
  "process_stage",
  "signed_on",
  "linkedin_url",
  "category",
  "reference",
  "role",
] as const;

export async function updatePartner(
  admin: SupabaseClient,
  id: string,
  input: UpdatePartnerInput,
): Promise<Profile> {
  const partner = await requireManagedPartner(admin, id);

  const patch: Record<string, unknown> = {};
  for (const key of EDITABLE_FIELDS) {
    if (key in input) patch[key] = (input as Record<string, unknown>)[key];
  }

  if ("full_name" in patch) {
    const name = String(patch.full_name ?? "").trim();
    if (!name) throw new Error("El nombre del partner es obligatorio.");
    patch.full_name = name;
  }
  if ("role" in patch) patch.role = normalizeRole(patch.role);
  if ("category" in patch) patch.category = normalizeCategory(patch.category);
  // La etapa tiene un check en la base; se clampa para que un valor viejo o
  // fuera de lista no rompa el guardado.
  if ("process_stage" in patch) patch.process_stage = normalizeStage(patch.process_stage);
  // An empty string would fail the `date` cast; store it as "not set".
  if ("entry_date" in patch) patch.entry_date = patch.entry_date || null;
  if ("signed_on" in patch) patch.signed_on = patch.signed_on || null;

  // auth.users goes first: if it rejects the address (already taken, malformed)
  // the profile row stays untouched.
  if (input.email !== undefined) {
    const email = String(input.email).trim().toLowerCase();
    if (!email) throw new Error("El correo del partner es obligatorio.");
    if (email !== partner.email) {
      const { error } = await admin.auth.admin.updateUserById(id, { email, email_confirm: true });
      if (error) throw new Error(authErrorMessage(error, email));
      patch.email = email;
    }
  }

  if (Object.keys(patch).length === 0) return partner;

  const { data, error } = await admin.from("profiles").update(patch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

// Activar/desactivar toca dos sistemas: la bandera del perfil (lo que ve la
// app) y el ban de auth (lo que impide iniciar sesión). Antes ninguno de los
// dos se verificaba, así que un fallo devolvía 200 y la UI mostraba el cambio
// aplicado cuando en realidad no lo estaba. Ahora ambos se comprueban y la
// respuesta trae la fila real.
export async function setPartnerActive(
  admin: SupabaseClient,
  id: string,
  active: boolean,
): Promise<Profile> {
  await requireManagedPartner(admin, id);

  const { data, error } = await admin
    .from("profiles")
    .update({ active })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  const { error: banError } = await admin.auth.admin.updateUserById(id, {
    ban_duration: active ? "none" : "876000h",
  });
  if (banError) {
    // El perfil ya cambió pero el acceso no: se revierte para no dejar la
    // cuenta marcada como inactiva mientras el partner sigue pudiendo entrar.
    await admin.from("profiles").update({ active: !active }).eq("id", id);
    throw new Error(
      `No se pudo ${active ? "restablecer" : "bloquear"} el acceso del partner: ${banError.message}`,
    );
  }

  return data as Profile;
}

export async function resetPartnerPassword(admin: SupabaseClient, id: string) {
  await requireManagedPartner(admin, id);
  const password = generatePassword();
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) throw new Error(error.message);
  return { password };
}

export type Actor = { id: string; full_name: string | null; email: string | null };

// Deleting the auth user cascades: the profile row and every opportunity the
// partner registered go with it (both reference auth.users on delete cascade).
// Como no queda rastro de nada de eso, antes de borrar se guarda una foto del
// partner en `partner_deletions` (ver /app/partners → "Eliminados").
export async function deletePartner(admin: SupabaseClient, id: string, actor: Actor) {
  const partner = await requireManagedPartner(admin, id);

  const { count } = await admin
    .from("opportunities")
    .select("*", { count: "exact", head: true })
    .eq("partner_id", id);

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);

  const { error: logError } = await admin.from("partner_deletions").insert({
    partner_seq: partner.seq,
    full_name: partner.full_name,
    email: partner.email,
    country: partner.country,
    phone: partner.phone,
    category: partner.category,
    process_stage: partner.process_stage,
    entry_date: partner.entry_date,
    reference: partner.reference,
    referred_by: partner.referred_by,
    partner_role: partner.role,
    linkedin_url: partner.linkedin_url,
    partner_created_at: partner.created_at,
    opportunity_count: count ?? 0,
    deleted_by: actor.id,
    deleted_by_name: actor.full_name,
    deleted_by_email: actor.email,
  });
  // El partner ya se eliminó; que falle la bitácora no puede deshacer eso ni
  // convertir una eliminación exitosa en un error para quien la pidió.
  if (logError) console.error("partner_deletions insert failed:", logError.message);

  return { id, opportunity_count: count ?? 0 };
}

export async function listPartnerDeletions(
  supabase: SupabaseClient,
): Promise<PartnerDeletion[]> {
  const { data, error } = await supabase
    .from("partner_deletions")
    .select("*")
    .order("deleted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PartnerDeletion[];
}
