import { createClient } from "@/lib/supabase/server";
import { TrialsTable } from "./trials-table";

export const metadata = {
  title: "Trials · Mensis",
};

export default async function TrialsPage() {
  const supabase = await createClient();
  const { data: trials } = await supabase
    .from("trials")
    .select("*")
    .order("created_at", { ascending: false });

  return <TrialsTable trials={trials ?? []} />;
}
