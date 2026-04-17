"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Tenant = {
  id: string;
  name: string;
  description: string | null;
  acquired_licenses: number;
  calendar_platform: string | null;
  website: string | null;
  meeting_platform: string | null;
  country: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  employee_count: number;
  max_mentor_sessions: number;
  max_user_sessions: number;
  pricing_by_user: number;
  starknet_wallet: string | null;
  tenant_id: string | null;
  tenant_url: string | null;
  status: "requested" | "in_progress" | "completed";
  requested_by: string | null;
  requested_at: string;
  completed_at: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-amber-50 text-amber-700 ring-amber-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const STATUS_LABELS: Record<string, string> = {
  requested: "Requested",
  in_progress: "In Progress",
  completed: "Completed",
};

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-sm text-zinc-800">{value}</p>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/10"
      />
    </div>
  );
}

export function TenantDetail({ tenant }: { tenant: Tenant }) {
  const router = useRouter();
  const [status, setStatus] = useState(tenant.status);
  const [tenantId, setTenantId] = useState(tenant.tenant_id ?? "");
  const [tenantUrl, setTenantUrl] = useState(tenant.tenant_url ?? "");
  const [starknetWallet, setStarknetWallet] = useState(tenant.starknet_wallet ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/tenants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: tenant.id,
        status,
        tenant_id: tenantId || null,
        tenant_url: tenantUrl || null,
        starknet_wallet: starknetWallet || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/tenants"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Tenants
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <h1 className="text-xl font-semibold text-zinc-900">{tenant.name}</h1>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[tenant.status]}`}
              >
                {STATUS_LABELS[tenant.status]}
              </span>
            </div>
            {tenant.description && (
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{tenant.description}</p>
            )}

            <div className="mt-6 flex flex-col gap-4">
              <Field label="Country" value={tenant.country} />
              <Field label="Website" value={tenant.website} />
              <Field label="Licenses" value={tenant.acquired_licenses} />
              <Field label="Employees" value={tenant.employee_count} />
              <Field label="Calendar" value={tenant.calendar_platform} />
              <Field label="Meeting Platform" value={tenant.meeting_platform} />
              <Field label="Max Mentor Sessions" value={tenant.max_mentor_sessions} />
              <Field label="Max User Sessions" value={tenant.max_user_sessions} />
              <Field label="Pricing/User" value={tenant.pricing_by_user ? `$${tenant.pricing_by_user}` : null} />
            </div>

            <div className="mt-6 border-t border-zinc-100 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Contact</p>
              <div className="flex flex-col gap-4">
                <Field label="Name" value={tenant.contact_name} />
                <Field label="Email" value={tenant.contact_email} />
                <Field label="Phone" value={tenant.contact_phone} />
              </div>
            </div>

            <div className="mt-6 border-t border-zinc-100 pt-4">
              <p className="text-xs text-zinc-400">
                Requested by {tenant.requested_by ?? "—"} on{" "}
                {new Date(tenant.requested_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {tenant.completed_at && (
                <p className="mt-1 text-xs text-emerald-600">
                  Completed on{" "}
                  {new Date(tenant.completed_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900">Dev Configuration</h2>
              <div className="flex items-center gap-3">
                {saved && <span className="text-sm text-emerald-600">Saved</span>}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand/90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Tenant["status"])}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-brand/30 focus:outline-none focus:ring-2 focus:ring-brand/10"
                >
                  <option value="requested">Requested</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <EditableField
                label="Tenant ID"
                value={tenantId}
                onChange={setTenantId}
                placeholder="e.g. agrhm"
              />
              <EditableField
                label="Tenant URL"
                value={tenantUrl}
                onChange={setTenantUrl}
                placeholder="e.g. agrhm.mensismentor.com"
              />
              <EditableField
                label="Starknet Wallet"
                value={starknetWallet}
                onChange={setStarknetWallet}
                placeholder="Wallet address"
              />
            </div>
          </div>

          {tenantUrl && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <h2 className="text-base font-semibold text-zinc-900">Tenant Link</h2>
              <a
                href={`https://${tenantUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
              >
                {tenantUrl}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
