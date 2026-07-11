import type { SupabaseClient } from "@supabase/supabase-js";
import type { TargetAccount, UseCase, UseCaseWithCount } from "@/lib/types";

// Cuentas objetivo — a read-only prospecting catalog. All reads are RLS-scoped
// to any authenticated user. No writes are exposed from the UI yet; admins load
// the data via SQL/migrations for now, so this service is queries only.

// Use-case cards, each with its account count — powers the grid.
export async function listUseCases(supabase: SupabaseClient): Promise<UseCaseWithCount[]> {
  const { data: cases, error } = await supabase
    .from("use_cases")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const { data: rows, error: countErr } = await supabase
    .from("target_accounts")
    .select("use_case_id");
  if (countErr) throw new Error(countErr.message);

  const counts = new Map<string, number>();
  for (const r of rows ?? []) {
    const id = (r as { use_case_id: string }).use_case_id;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return ((cases ?? []) as UseCase[]).map((c) => ({
    ...c,
    account_count: counts.get(c.id) ?? 0,
  }));
}

// Accounts inside a use case (or all of them when useCaseId is omitted).
export async function listTargetAccounts(
  supabase: SupabaseClient,
  useCaseId?: string,
): Promise<TargetAccount[]> {
  let query = supabase.from("target_accounts").select("*").order("company", { ascending: true });
  if (useCaseId) query = query.eq("use_case_id", useCaseId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as TargetAccount[];
}
