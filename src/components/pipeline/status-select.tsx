"use client";

import { useTransition } from "react";
import { api } from "@/lib/api/client";
import { STATUS_LABELS, type OpportunityStatus } from "@/lib/types";

const OPTIONS: OpportunityStatus[] = ["pending", "approved", "won", "lost"];

const TONE: Record<OpportunityStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  approved: "bg-blue-50 text-blue-700 ring-blue-600/20",
  won: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  lost: "bg-zinc-100 text-zinc-500 ring-zinc-400/20",
};

export function StatusSelect({
  oppId,
  status,
  onChanged,
}: {
  oppId: string;
  status: OpportunityStatus;
  onChanged?: (status: OpportunityStatus) => void;
}) {
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OpportunityStatus;
    startTransition(async () => {
      await api.opportunities.setStatus(oppId, next);
      onChanged?.(next);
    });
  }

  return (
    <select
      value={status}
      onChange={onChange}
      disabled={pending}
      className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset outline-none transition-opacity disabled:opacity-50 ${TONE[status]}`}
    >
      {OPTIONS.map((s) => (
        <option key={s} value={s} className="bg-white text-zinc-800">
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
