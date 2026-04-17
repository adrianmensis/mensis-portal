import type { SupabaseClient } from "@supabase/supabase-js";

type Input = Record<string, unknown>;

async function query(supabase: SupabaseClient, table: string, filter?: { column: string; value: string }) {
  let q = supabase.from(table).select("*").order("created_at", { ascending: false });
  if (filter) q = q.eq(filter.column, filter.value);
  const { data } = await q;
  return data ?? [];
}

async function insert(supabase: SupabaseClient, table: string, input: Input) {
  const { data, error } = await supabase.from(table).insert(input).select().single();
  if (error) return { error: error.message };
  return data;
}

async function update(supabase: SupabaseClient, table: string, input: Input) {
  const { id, ...updates } = input as { id: string; [k: string]: unknown };
  const { data, error } = await supabase.from(table).update(updates).eq("id", id).select().single();
  if (error) return { error: error.message };
  return data;
}

export async function handleToolCall(
  toolName: string,
  toolInput: Input,
  supabase: SupabaseClient,
): Promise<string> {
  const result = await executeToolCall(toolName, toolInput, supabase);
  return JSON.stringify(result);
}

async function executeToolCall(
  toolName: string,
  input: Input,
  db: SupabaseClient,
): Promise<unknown> {
  switch (toolName) {
    case "query_contacts":
      return query(db, "leads", { column: "category", value: "cliente_final" });
    case "query_partners":
      return query(db, "leads", { column: "category", value: "partner" });
    case "query_clients":
      return query(db, "clients");
    case "query_trials":
      return query(db, "trials");
    case "query_tenants":
      return query(db, "tenants");
    case "query_objectives": {
      const { data } = await db.from("objectives").select("*").order("sort_order", { ascending: true });
      return data ?? [];
    }
    case "query_goals": {
      const [goalsRes, clientsRes, trialsRes, partnersRes] = await Promise.all([
        db.from("goals").select("*").order("month", { ascending: true }),
        db.from("clients").select("avatar_count"),
        db.from("trials").select("avatar_count"),
        db.from("partners").select("*", { count: "exact", head: true }),
      ]);
      const currentAvatars =
        (clientsRes.data ?? []).reduce((s: number, c: { avatar_count: number }) => s + c.avatar_count, 0) +
        (trialsRes.data ?? []).reduce((s: number, t: { avatar_count: number }) => s + t.avatar_count, 0);
      return {
        goals: goalsRes.data ?? [],
        current_avatars_real: currentAvatars,
        current_partners_real: partnersRes.count ?? 0,
      };
    }

    case "create_contact":
      return insert(db, "leads", input);
    case "create_client":
      return insert(db, "clients", input);
    case "create_trial":
      return insert(db, "trials", input);
    case "create_partner":
      return insert(db, "partners", input);
    case "create_goal":
      return insert(db, "goals", input);
    case "create_objective":
      return insert(db, "objectives", input);
    case "create_tenant_request":
      return insert(db, "tenants", input);

    case "update_contact":
      return update(db, "leads", input);
    case "update_client":
      return update(db, "clients", input);
    case "update_trial":
      return update(db, "trials", input);
    case "update_goal":
      return update(db, "goals", input);
    case "update_objective":
      return update(db, "objectives", input);
    case "update_tenant": {
      if (input.status === "completed") {
        input.completed_at = new Date().toISOString();
      }
      return update(db, "tenants", input);
    }

    case "delete_record": {
      const { table, id } = input as { table: string; id: string };
      const { error } = await db.from(table).delete().eq("id", id);
      if (error) return { error: error.message };
      return { success: true, deleted: id };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
