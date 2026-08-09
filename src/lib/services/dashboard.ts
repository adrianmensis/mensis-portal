import type { SupabaseClient } from "@supabase/supabase-js";
import type { Opportunity, OpportunityStage, Profile, Role } from "@/lib/types";
import { ALL_OPPORTUNITY_STAGES, ASSIGNABLE_PARTNER_ROLES } from "@/lib/types";
import { isAdminRole, seesNetworkPipeline } from "@/lib/auth/permissions";

// Quién registró la oportunidad: Mensis (una cuenta admin) o la red. Es la
// misma frontera que usa la base para esconderle a un partner_admin los
// negocios propios de Mensis (ver `is_mensis_owned`).
export type OpportunityOrigin = "mensis" | "partner";

// Una fila liviana por oportunidad, para los cortes que hace el cliente: por
// semana, por región y por origen. Las fechas van crudas a propósito — el
// recorte semanal se hace en hora local, y el servidor corre en UTC.
export type OpportunityPulse = {
  created_at: string;
  lost_at: string | null;
  country: string | null;
  stage: OpportunityStage;
  origin: OpportunityOrigin;
  value: number;
};

export type PartnerPulse = { joined: string; signed_on: string | null };

export type DashboardData = {
  role: Role;
  partner_count: number;
  total_opportunities: number;
  won_value: number; // value of opportunities that reached "client"
  open_value: number; // value still in the active funnel (not won, not lost)
  lost_value: number; // value of opportunities closed as lost
  counts: Record<OpportunityStage, number>;
  values: Record<OpportunityStage, number>; // monto anual acumulado por etapa
  pulse: { opportunities: OpportunityPulse[]; partners: PartnerPulse[] };
};

const emptyByStage = () =>
  Object.fromEntries(ALL_OPPORTUNITY_STAGES.map((s) => [s, 0])) as Record<OpportunityStage, number>;

// RLS scopes `opportunities` automatically: admins see all rows, partner_admins
// the network minus Mensis' own deals, partners only their own — so the same
// query powers every dashboard.
export async function getDashboard(
  supabase: SupabaseClient,
  profile: Profile,
): Promise<DashboardData> {
  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });
  const opps = (data ?? []) as Opportunity[];

  const counts = emptyByStage();
  const values = emptyByStage();
  for (const o of opps) {
    if (!(o.stage in counts)) continue; // etapa desconocida: no rompe el resumen
    counts[o.stage] += 1;
    values[o.stage] += o.estimated_value ?? 0;
  }

  const won_value = values.client;
  const lost_value = values.closed_lost;
  // Pipeline abierto: lo que sigue vivo. Ni ganado ni perdido.
  const open_value = ALL_OPPORTUNITY_STAGES.filter((s) => s !== "client" && s !== "closed_lost")
    .reduce((sum, s) => sum + values[s], 0);

  // Las cuentas de Mensis (rol admin). Solo un admin ve negocios propios y de
  // la red mezclados, así que solo ahí hace falta distinguirlos.
  const mensisIds = new Set<string>();
  if (isAdminRole(profile.role)) {
    const { data: staff } = await supabase.from("profiles").select("id").eq("role", "admin");
    for (const row of (staff ?? []) as { id: string }[]) mensisIds.add(row.id);
  }

  let partner_count = 0;
  let partners: PartnerPulse[] = [];
  if (seesNetworkPipeline(profile.role)) {
    const { data: rows } = await supabase
      .from("profiles")
      .select("created_at, entry_date, signed_on")
      .in("role", [...ASSIGNABLE_PARTNER_ROLES]);
    const list = (rows ?? []) as Pick<Profile, "created_at" | "entry_date" | "signed_on">[];
    partner_count = list.length;
    // Un partner "entra" en su fecha de ingreso; si no se cargó, en el alta de
    // la cuenta. Mismo criterio que usa el módulo de Partners.
    partners = list.map((p) => ({ joined: p.entry_date ?? p.created_at, signed_on: p.signed_on }));
  }

  return {
    role: profile.role,
    partner_count,
    total_opportunities: opps.length,
    won_value,
    open_value,
    lost_value,
    counts,
    values,
    pulse: {
      opportunities: opps.map((o) => ({
        created_at: o.created_at,
        lost_at: o.closed_lost_at,
        country: o.country,
        stage: o.stage,
        origin: mensisIds.has(o.partner_id) ? ("mensis" as const) : ("partner" as const),
        value: o.estimated_value ?? 0,
      })),
      partners,
    },
  };
}
