import type { SupabaseClient } from "@supabase/supabase-js";
import type { Opportunity, OpportunityStatus, Profile } from "@/lib/types";
import { AVATAR_PRICE } from "@/lib/pricing";

export type OpportunityWithPartner = Opportunity & { partner_name: string | null };

export type OpportunityFilters = { partner?: string; status?: string };

export async function listOpportunities(
  supabase: SupabaseClient,
  filters: OpportunityFilters = {},
  opts: { withPartner?: boolean } = {},
): Promise<OpportunityWithPartner[]> {
  let query = supabase.from("opportunities").select("*").order("created_at", { ascending: false });
  if (filters.partner) query = query.eq("partner_id", filters.partner);
  if (filters.status) query = query.eq("status", filters.status);
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

export type CreateOpportunityInput = {
  client_name: string;
  website?: string;
  collaborators?: number | null;
  estimated_avatars?: number | null;
  notes?: string;
};

export async function createOpportunity(
  supabase: SupabaseClient,
  partnerId: string,
  input: CreateOpportunityInput,
) {
  if (!input.client_name?.trim()) throw new Error("El nombre del prospecto es obligatorio.");
  const avatars = input.estimated_avatars ?? null;
  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      partner_id: partnerId,
      client_name: input.client_name.trim(),
      website: input.website || null,
      collaborators: input.collaborators ?? null,
      estimated_avatars: avatars,
      // Monto total = avatares × precio estándar (mantiene el dashboard consistente).
      estimated_value: avatars != null ? avatars * AVATAR_PRICE : null,
      notes: input.notes || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Opportunity;
}

const VALID_STATUS: OpportunityStatus[] = ["pending", "approved", "won", "lost"];

export async function updateOpportunityStatus(
  admin: SupabaseClient,
  id: string,
  status: OpportunityStatus,
) {
  if (!VALID_STATUS.includes(status)) throw new Error("Invalid status.");
  const { error } = await admin.from("opportunities").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  return { id, status };
}
