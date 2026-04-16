import { createClient } from "@/lib/supabase/server";
import { ClientsTable } from "./clients-table";

export const metadata = {
  title: "Clients · Mensis",
};

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return <ClientsTable clients={clients ?? []} />;
}
