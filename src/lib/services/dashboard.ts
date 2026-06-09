import type { SupabaseClient } from "@supabase/supabase-js";
import type { Opportunity, OpportunityStatus, Profile, Role } from "@/lib/types";

export type DashboardData = {
  role: Role;
  partner_count: number;
  total_opportunities: number;
  won_value: number;
  open_value: number;
  counts: Record<OpportunityStatus, number>;
  recent: Opportunity[];
};

const EMPTY_COUNTS: Record<OpportunityStatus, number> = {
  pending: 0,
  approved: 0,
  won: 0,
  lost: 0,
};

// RLS scopes `opportunities` automatically: admins see all rows, partners see
// only their own — so the same query powers both dashboards.
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
  for (const o of opps) counts[o.status] += 1;

  const won_value = opps
    .filter((o) => o.status === "won")
    .reduce((s, o) => s + (o.estimated_value ?? 0), 0);
  const open_value = opps
    .filter((o) => o.status === "pending" || o.status === "approved")
    .reduce((s, o) => s + (o.estimated_value ?? 0), 0);

  let partner_count = 0;
  if (profile.role === "admin") {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "partner");
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
