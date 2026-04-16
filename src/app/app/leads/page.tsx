import { createClient } from "@/lib/supabase/server";
import { ContactsTable } from "./contacts-table";

export const metadata = {
  title: "Contacts · Mensis",
};

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return <ContactsTable leads={leads ?? []} />;
}
