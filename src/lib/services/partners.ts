import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

export type PartnerWithCount = Profile & { opportunity_count: number };

export function generatePassword() {
  return "Mp" + randomBytes(8).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
}

export async function listPartners(
  supabase: SupabaseClient,
): Promise<PartnerWithCount[]> {
  const [{ data: partners }, { data: opps }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "partner").order("created_at", { ascending: false }),
    supabase.from("opportunities").select("partner_id"),
  ]);

  const counts = new Map<string, number>();
  for (const o of opps ?? []) counts.set(o.partner_id, (counts.get(o.partner_id) ?? 0) + 1);

  return (partners ?? []).map((p) => ({
    ...(p as Profile),
    opportunity_count: counts.get(p.id) ?? 0,
  }));
}

export type CreatePartnerInput = {
  full_name: string;
  email: string;
  country?: string;
  phone?: string;
  referred_by?: string;
  entry_date?: string;
  process_stage?: string;
  linkedin_url?: string;
};

export async function createPartner(admin: SupabaseClient, input: CreatePartnerInput) {
  const password = generatePassword();
  const { error } = await admin.auth.admin.createUser({
    email: input.email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: input.full_name,
      country: input.country ?? "",
      phone: input.phone ?? "",
      referred_by: input.referred_by || "Nathalia",
      entry_date: input.entry_date ?? "",
      process_stage: input.process_stage || "Prospecto",
      linkedin_url: input.linkedin_url ?? "",
      role: "partner",
    },
  });
  if (error) throw new Error(error.message);
  return { email: input.email, password };
}

export async function setPartnerActive(admin: SupabaseClient, id: string, active: boolean) {
  await admin.from("profiles").update({ active }).eq("id", id);
  await admin.auth.admin.updateUserById(id, {
    ban_duration: active ? "none" : "876000h",
  });
  return { id, active };
}

export async function resetPartnerPassword(admin: SupabaseClient, id: string) {
  const password = generatePassword();
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) throw new Error(error.message);
  return { password };
}
