"use client";

import { useRouter } from "next/navigation";

export type Trial = {
  id: string;
  name: string;
  description: string | null;
  employee_count: number;
  user_count: number;
  avatar_count: number;
  country: string | null;
  tenant_url: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
};

export function TrialsTable({ trials }: { trials: Trial[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Trials
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{trials.length} records</p>
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
              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Employees
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Users
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Avatars
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Tenant
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Contact
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {trials.length > 0 ? (
              trials.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => router.push(`/app/trials/${t.id}`)}
                  className="cursor-pointer transition-colors hover:bg-blue-50/50"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {t.country ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                    {t.employee_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                    {t.user_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                    {t.avatar_count.toLocaleString()}
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
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {t.contact_first_name} {t.contact_last_name}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {new Date(t.created_at).toLocaleDateString("en-US", {
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
                  No trials yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
