import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContactDetail } from "./contact-detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("leads").select("name").eq("id", id).single();
  return { title: data ? `${data.name} · Mensis` : "Contact · Mensis" };
}

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [leadRes, followUpsRes] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase
      .from("follow_ups")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!leadRes.data) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/leads"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Contacts
      </Link>

      <ContactDetail lead={leadRes.data} followUps={followUpsRes.data ?? []} />
    </div>
  );
}
