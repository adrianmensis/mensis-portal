import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("name").eq("id", id).single();
  return { title: data ? `${data.name} · Mensis` : "Client · Mensis" };
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
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

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className={`mt-1 text-lg font-bold ${accent ?? "text-zinc-900"}`}>{value}</p>
    </div>
  );
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: c } = await supabase.from("clients").select("*").eq("id", id).single();

  if (!c) notFound();

  const total = c.avatar_count * c.price_per_avatar;
  const growth = c.user_count - c.avatar_count;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/clients"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Clients
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h1 className="text-xl font-semibold text-zinc-900">{c.name}</h1>
            {c.description && (
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{c.description}</p>
            )}

            <div className="mt-6 flex flex-col gap-4">
              <Field label="Country" value={c.country} />
              {c.tenant_url && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Tenant URL</p>
                  <a
                    href={`https://${c.tenant_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
                  >
                    {c.tenant_url}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              )}
              <Field
                label="Client since"
                value={new Date(c.created_at).toLocaleDateString("en-US", {
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
                    c.contact_first_name || c.contact_last_name
                      ? `${c.contact_first_name ?? ""} ${c.contact_last_name ?? ""}`.trim()
                      : null
                  }
                />
                <Field label="Email" value={c.contact_email} />
                <Field label="Phone" value={c.contact_phone} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-base font-semibold text-zinc-900">Metrics</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Employees" value={c.employee_count.toLocaleString()} />
              <Stat label="Users" value={c.user_count.toLocaleString()} />
              <Stat label="Avatars" value={c.avatar_count.toLocaleString()} />
              <Stat
                label="Growth Pot."
                value={growth > 0 ? `+${growth}` : `${growth}`}
                accent={growth > 0 ? "text-emerald-600" : "text-zinc-400"}
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-base font-semibold text-zinc-900">Revenue</h2>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <Stat label="$/Avatar" value={fmtCurrency(c.price_per_avatar)} />
              <Stat label="MRR" value={fmtCurrency(total)} accent="text-brand" />
              <Stat
                label="Potential MRR"
                value={fmtCurrency(c.user_count * c.price_per_avatar)}
                accent="text-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
