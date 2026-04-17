import { createClient } from "@/lib/supabase/server";
import { TenantsTable } from "./tenants-table";

export default async function TenantsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  return <TenantsTable tenants={data ?? []} />;
}
