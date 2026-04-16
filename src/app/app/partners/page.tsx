import { createClient } from "@/lib/supabase/server";
import { PartnersTable } from "./partners-table";

export const metadata = {
  title: "Partners · Mensis",
};

export default async function PartnersPage() {
  const supabase = await createClient();
  const { data: partners } = await supabase
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });

  return <PartnersTable partners={partners ?? []} />;
}
