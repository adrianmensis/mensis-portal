"use client";

import { useRouter } from "next/navigation";

export type Tenant = {
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
  created_at: string;
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

export function TenantsTable({ tenants }: { tenants: Tenant[] }) {
  const router = useRouter();

  const counts = {
    requested: tenants.filter((t) => t.status === "requested").length,
    in_progress: tenants.filter((t) => t.status === "in_progress").length,
    completed: tenants.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Tenants
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {tenants.length} requests &middot;{" "}
          <span className="text-amber-600">{counts.requested} pending</span> &middot;{" "}
          <span className="text-blue-600">{counts.in_progress} in progress</span> &middot;{" "}
          <span className="text-emerald-600">{counts.completed} completed</span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Name
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Country
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Licenses
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Status
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Tenant ID
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Tenant URL
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Contact
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Requested
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {tenants.length > 0 ? (
              tenants.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => router.push(`/app/tenants/${t.id}`)}
                  className="cursor-pointer transition-colors hover:bg-blue-50/50"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {t.country ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-zinc-600">
                    {t.acquired_licenses}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[t.status]}`}
                    >
                      {STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {t.tenant_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {t.tenant_url ? (
                      <a
                        href={`https://${t.tenant_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-brand hover:underline"
                      >
                        {t.tenant_url}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {t.contact_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {new Date(t.requested_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-zinc-400"
                >
                  No tenant requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
