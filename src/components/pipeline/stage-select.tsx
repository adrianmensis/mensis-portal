"use client";

import { useTransition } from "react";
import { api } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/use-toast";
import { OPPORTUNITY_STAGES, STAGE_LABELS, STAGE_STYLES, type OpportunityStage } from "@/lib/types";

export function StageSelect({
  oppId,
  stage,
  onChanged,
}: {
  oppId: string;
  stage: OpportunityStage;
  onChanged?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OpportunityStage;
    startTransition(async () => {
      try {
        await api.opportunities.update(oppId, { stage: next });
        onChanged?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cambiar la etapa.");
      }
    });
  }

  return (
    <select
      value={stage}
      onChange={onChange}
      disabled={pending}
      className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset outline-none transition-opacity disabled:opacity-50 ${STAGE_STYLES[stage]}`}
    >
      {OPPORTUNITY_STAGES.map((s) => (
        <option key={s} value={s} className="bg-white text-zinc-800">
          {STAGE_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
