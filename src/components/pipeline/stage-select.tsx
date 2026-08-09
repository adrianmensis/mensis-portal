"use client";

import { useState, useTransition } from "react";
import { api } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/use-toast";
import {
  ALL_OPPORTUNITY_STAGES,
  STAGE_LABELS,
  STAGE_STYLES,
  type LostReason,
  type OpportunityStage,
} from "@/lib/types";
import { LostReasonModal } from "@/components/opportunities/lost-reason-modal";

export function StageSelect({
  oppId,
  stage,
  clientName,
  lostReason = null,
  lostNotes = null,
  onChanged,
}: {
  oppId: string;
  stage: OpportunityStage;
  clientName?: string;
  lostReason?: LostReason | null;
  lostNotes?: string | null;
  onChanged?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [lostOpen, setLostOpen] = useState(false);
  const toast = useToast();

  function update(patch: Parameters<typeof api.opportunities.update>[1], onDone?: () => void) {
    startTransition(async () => {
      try {
        await api.opportunities.update(oppId, patch);
        onDone?.();
        onChanged?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cambiar la etapa.");
      }
    });
  }

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OpportunityStage;
    if (next === stage) return;
    // Perder una oportunidad exige un motivo: se pide antes de guardar.
    if (next === "closed_lost") {
      setLostOpen(true);
      return;
    }
    update({ stage: next });
  }

  return (
    <>
      <select
        value={stage}
        onChange={onChange}
        disabled={pending}
        className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset outline-none transition-opacity disabled:opacity-50 ${STAGE_STYLES[stage]}`}
      >
        {ALL_OPPORTUNITY_STAGES.map((s) => (
          <option key={s} value={s} className="bg-white text-zinc-800">
            {STAGE_LABELS[s]}
          </option>
        ))}
      </select>

      <LostReasonModal
        open={lostOpen}
        onClose={() => setLostOpen(false)}
        onConfirm={(reason, notes) =>
          update({ stage: "closed_lost", lost_reason: reason, lost_notes: notes }, () =>
            setLostOpen(false),
          )
        }
        clientName={clientName}
        reason={lostReason}
        notes={lostNotes}
        saving={pending}
      />
    </>
  );
}
