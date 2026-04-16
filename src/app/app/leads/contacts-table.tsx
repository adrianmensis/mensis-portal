"use client";

import { useRouter } from "next/navigation";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  category: string;
  status: string;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  responded: "Responded",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

const STATUS_DOT: Record<string, string> = {
  new: "bg-zinc-400",
  contacted: "bg-blue-500",
  responded: "bg-indigo-500",
  qualified: "bg-amber-500",
  proposal: "bg-purple-500",
  won: "bg-green-500",
  lost: "bg-red-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  partner: "Partner",
  cliente_final: "Cliente Final",
};

export function ContactsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Contacts
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{leads.length} records</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Name
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Company
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Phone
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Category
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Source
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => router.push(`/app/leads/${lead.id}`)}
                  className="cursor-pointer transition-colors hover:bg-blue-50/50"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {lead.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{lead.company}</td>
                  <td className="px-4 py-3 text-zinc-500">{lead.email}</td>
                  <td className="px-4 py-3 text-zinc-500">{lead.phone}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                      {CATEGORY_LABELS[lead.category] ?? lead.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-700">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[lead.status] ?? "bg-zinc-400"}`}
                      />
                      {STATUS_LABELS[lead.status] ?? lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {lead.source}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {new Date(lead.created_at).toLocaleDateString("en-US", {
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
                  No contacts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
