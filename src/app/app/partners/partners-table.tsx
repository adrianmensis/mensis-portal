"use client";

import { useRouter } from "next/navigation";

type Partner = {
  id: string;
  name: string;
  description: string | null;
  country: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
};

export function PartnersTable({ partners }: { partners: Partner[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Partners
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{partners.length} records</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Name</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Description</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Country</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Contact</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Email</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Phone</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {partners.length > 0 ? (
              partners.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/app/partners/${p.id}`)}
                  className="cursor-pointer transition-colors hover:bg-blue-50/50"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">{p.name}</td>
                  <td className="px-4 py-3 text-zinc-600 max-w-xs truncate">{p.description ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-600">{p.country ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {p.contact_first_name} {p.contact_last_name}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{p.contact_email}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.contact_phone}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {new Date(p.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-400">
                  No partners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
