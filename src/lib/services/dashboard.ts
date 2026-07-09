import type { SupabaseClient } from "@supabase/supabase-js";
import type { Opportunity, OpportunityStage, Profile, Role } from "@/lib/types";
import { ASSIGNABLE_PARTNER_ROLES, OPPORTUNITY_STAGES } from "@/lib/types";
import { seesNetworkPipeline } from "@/lib/auth/permissions";

export type DashboardData = {
  role: Role;
  partner_count: number;
  total_opportunities: number;
  won_value: number; // value of opportunities that reached "client"
  open_value: number; // value still in the active funnel (not yet client)
  counts: Record<OpportunityStage, number>;
  recent: Opportunity[];
};

const EMPTY_COUNTS = Object.fromEntries(
  OPPORTUNITY_STAGES.map((s) => [s, 0]),
) as Record<OpportunityStage, number>;

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

  const counts = { ...EMPTY_COUNTS };
  for (const o of opps) counts[o.stage] += 1;

  const won_value = opps
    .filter((o) => o.stage === "client")
    .reduce((s, o) => s + (o.estimated_value ?? 0), 0);
  const open_value = opps
    .filter((o) => o.stage !== "client")
    .reduce((s, o) => s + (o.estimated_value ?? 0), 0);

  let partner_count = 0;
  if (seesNetworkPipeline(profile.role)) {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .in("role", [...ASSIGNABLE_PARTNER_ROLES]);
    partner_count = count ?? 0;
  }

  return {
    role: profile.role,
    partner_count,
    total_opportunities: opps.length,
    won_value,
    open_value,
    counts,
    recent: opps.slice(0, 5),
  };
}
