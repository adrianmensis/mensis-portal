"use client";

import { useRouter } from "next/navigation";

export type Client = {
  id: string;
  name: string;
  description: string | null;
  employee_count: number;
  user_count: number;
  avatar_count: number;
  price_per_avatar: number;
  country: string | null;
  tenant_url: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

export function ClientsTable({ clients }: { clients: Client[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Clients
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{clients.length} records</p>
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
              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                $/Avatar
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Total
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Growth Pot.
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
            {clients.length > 0 ? (
              clients.map((c) => {
                const total = c.avatar_count * c.price_per_avatar;
                const growth = c.user_count - c.avatar_count;

                return (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/app/clients/${c.id}`)}
                    className="cursor-pointer transition-colors hover:bg-blue-50/50"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {c.country ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                      {c.employee_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                      {c.user_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                      {c.avatar_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-600">
                      {fmt(c.price_per_avatar)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-zinc-900">
                      {fmt(total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`tabular-nums font-medium ${growth > 0 ? "text-emerald-600" : "text-zinc-400"}`}
                      >
                        {growth > 0 ? `+${growth}` : growth}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {c.contact_first_name} {c.contact_last_name}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-12 text-center text-sm text-zinc-400"
                >
                  No clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
