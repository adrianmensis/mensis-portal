import type { SupabaseClient } from "@supabase/supabase-js";
import type { Opportunity, OpportunityStage, Profile, Role } from "@/lib/types";
import { ALL_OPPORTUNITY_STAGES, ASSIGNABLE_PARTNER_ROLES } from "@/lib/types";
import { seesNetworkPipeline } from "@/lib/auth/permissions";

// Fechas crudas para los cortes por semana. El recorte lo hace el cliente, en
// hora local: el servidor corre en UTC y movería de semana a todo lo cargado un
// lunes temprano o un domingo tarde.
export type OpportunityPulse = { created_at: string; lost_at: string | null };
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
  recent: Opportunity[];
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
      opportunities: opps.map((o) => ({ created_at: o.created_at, lost_at: o.closed_lost_at })),
      partners,
    },
    recent: opps.slice(0, 5),
  };
}
