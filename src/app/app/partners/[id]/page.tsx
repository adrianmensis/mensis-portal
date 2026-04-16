import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("partners").select("name").eq("id", id).single();
  return { title: data ? `${data.name} · Mensis` : "Partner · Mensis" };
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-sm text-zinc-800">{value}</p>
    </div>
  );
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from("partners").select("*").eq("id", id).single();

  if (!p) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/partners"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Partners
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h1 className="text-xl font-semibold text-zinc-900">{p.name}</h1>
            {p.description && (
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{p.description}</p>
            )}

            <div className="mt-6 flex flex-col gap-4">
              <Field label="Country" value={p.country} />
              <Field
                label="Partner since"
                value={new Date(p.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              />
            </div>

            <div className="mt-6 border-t border-zinc-100 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Contact</p>
              <div className="flex flex-col gap-4">
                <Field
                  label="Name"
                  value={
                    p.contact_first_name || p.contact_last_name
                      ? `${p.contact_first_name ?? ""} ${p.contact_last_name ?? ""}`.trim()
                      : null
                  }
                />
                <Field label="Email" value={p.contact_email} />
                <Field label="Phone" value={p.contact_phone} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white py-20">
            <p className="text-sm text-zinc-400">Partner activity coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
