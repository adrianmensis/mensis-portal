import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TenantDetail } from "./tenant-detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("tenants").select("name").eq("id", id).single();
  return { title: data ? `${data.name} · Tenants · Mensis` : "Tenant · Mensis" };
}

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("tenants").select("*").eq("id", id).single();

  if (!data) notFound();

  return <TenantDetail tenant={data} />;
}
