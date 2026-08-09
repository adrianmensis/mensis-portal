"use client";

import { useState } from "react";
import { LOST_REASONS, LOST_REASON_LABELS, type LostReason } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Pide el motivo antes de dar una oportunidad por perdida. El motivo es
// obligatorio (la API y la base lo exigen); la nota es opcional y sirve para el
// detalle que ningún código captura.
export function LostReasonModal({
  open,
  onClose,
  onConfirm,
  clientName,
  reason: initialReason = null,
  notes: initialNotes = null,
  saving = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: LostReason, notes: string | null) => void;
  clientName?: string;
  reason?: LostReason | null;
  notes?: string | null;
  saving?: boolean;
}) {
  const [reason, setReason] = useState<LostReason | "">(initialReason ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");

  // Cada vez que se abre, el formulario arranca de lo que hoy tiene la
  // oportunidad. Se ajusta durante el render (no en un efecto) para no
  // encadenar un segundo render con datos viejos en pantalla.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setReason(initialReason ?? "");
      setNotes(initialNotes ?? "");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cerrar como perdida"
      subtitle={clientName ? `${clientName} — ¿por qué se perdió?` : "¿Por qué se perdió?"}
      dismissible={!saving}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!reason) return;
          onConfirm(reason, notes.trim() || null);
        }}
        className="flex flex-col gap-5"
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[13px] font-medium text-zinc-600">Motivo *</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {LOST_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={reason === r}
                onClick={() => setReason(r)}
                className={`rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all ${
                  reason === r
                    ? "border-red-300 bg-red-50 font-medium text-red-700 ring-4 ring-red-500/10"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                {LOST_REASON_LABELS[r]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lost-notes">Detalle (opcional)</Label>
          <textarea
            id="lost-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="¿Contra quién se perdió, qué faltó, cuándo volver a tocar la puerta…?"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 disabled:opacity-60"
          >
            Cancelar
          </button>
          <Button
            type="submit"
            disabled={!reason || saving}
            className="bg-red-600 shadow-[0_4px_16px_-4px_rgba(220,38,38,0.4)] hover:bg-red-700 hover:shadow-[0_6px_20px_-4px_rgba(220,38,38,0.5)]"
          >
            {saving ? "Guardando…" : "Cerrar como perdida"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
