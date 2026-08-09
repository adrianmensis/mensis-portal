"use client";

import { OPPORTUNITY_STAGES, STAGE_LABELS, type OpportunityStage } from "@/lib/types";

// Salesforce-style "path": a row of chevron segments. Completed stages are
// green, the current one is highlighted, upcoming ones are muted. Click a
// segment to move the opportunity to that stage.
//
// "Cerrada perdida" no es un segmento del camino: es la salida, y va aparte a
// la derecha. Cuando la oportunidad está perdida el camino se apaga entero y
// hacer clic en cualquier etapa la reabre ahí.
export function StagePath({
  stage,
  onSelect,
  onLost,
  disabled = false,
}: {
  stage: OpportunityStage;
  onSelect: (stage: OpportunityStage) => void;
  onLost?: () => void;
  disabled?: boolean;
}) {
  const lost = stage === "closed_lost";
  const currentIndex = lost ? -1 : OPPORTUNITY_STAGES.indexOf(stage as (typeof OPPORTUNITY_STAGES)[number]);
  const POINT = 18; // px width of the arrow tip / notch

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="min-w-0 flex-1 overflow-x-auto pb-1">
        <div className="flex w-full min-w-[40rem]">
          {OPPORTUNITY_STAGES.map((s, i) => {
            const first = i === 0;
            const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "todo";
            const tone =
              state === "done"
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : state === "current"
                  ? "bg-brand text-white"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200";

            const clipPath = first
              ? `polygon(0 0, calc(100% - ${POINT}px) 0, 100% 50%, calc(100% - ${POINT}px) 100%, 0 100%)`
              : `polygon(0 0, calc(100% - ${POINT}px) 0, 100% 50%, calc(100% - ${POINT}px) 100%, 0 100%, ${POINT}px 50%)`;

            return (
              <button
                key={s}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(s)}
                title={lost ? `Reabrir en “${STAGE_LABELS[s]}”` : STAGE_LABELS[s]}
                style={{ clipPath, marginLeft: first ? 0 : -POINT + 2 }}
                className={`flex h-11 flex-1 items-center justify-center whitespace-nowrap pr-4 text-xs font-semibold transition-colors ${
                  first ? "pl-5" : "pl-8"
                } ${tone} ${lost ? "opacity-50" : ""} ${disabled ? "cursor-default" : "cursor-pointer"}`}
              >
                {state === "done" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
                {STAGE_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>

      {onLost && (
        <button
          type="button"
          disabled={disabled}
          onClick={onLost}
          title={lost ? "Cambiar el motivo de la pérdida" : "Cerrar como perdida"}
          className={`flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold transition-colors ${
            lost
              ? "bg-red-600 text-white hover:bg-red-700"
              : "border border-zinc-200 bg-white text-zinc-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          } ${disabled ? "cursor-default opacity-60" : "cursor-pointer"}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          {STAGE_LABELS.closed_lost}
        </button>
      )}
    </div>
  );
}
