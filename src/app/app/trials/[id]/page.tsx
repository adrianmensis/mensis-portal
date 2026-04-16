import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("trials").select("name").eq("id", id).single();
  return { title: data ? `${data.name} · Mensis` : "Trial · Mensis" };
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-zinc-900">{value}</p>
    </div>
  );
}

export default async function TrialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: t } = await supabase.from("trials").select("*").eq("id", id).single();

  if (!t) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/trials"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Trials
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-zinc-900">{t.name}</h1>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                Trial
              </span>
            </div>
            {t.description && (
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{t.description}</p>
            )}

            <div className="mt-6 flex flex-col gap-4">
              <Field label="Country" value={t.country} />
              <Field label="Tenant URL" value={t.tenant_url} />
              <Field
                label="Created"
                value={new Date(t.created_at).toLocaleDateString("en-US", {
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
                    t.contact_first_name || t.contact_last_name
                      ? `${t.contact_first_name ?? ""} ${t.contact_last_name ?? ""}`.trim()
                      : null
                  }
                />
                <Field label="Email" value={t.contact_email} />
                <Field label="Phone" value={t.contact_phone} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-base font-semibold text-zinc-900">Metrics</h2>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <Stat label="Employees" value={t.employee_count.toLocaleString()} />
              <Stat label="Users" value={t.user_count.toLocaleString()} />
              <Stat label="Avatars" value={t.avatar_count.toLocaleString()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
