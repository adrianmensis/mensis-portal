"use client";

import { OPPORTUNITY_STAGES, STAGE_LABELS, type OpportunityStage } from "@/lib/types";

// Salesforce-style "path": a row of chevron segments. Completed stages are
// green, the current one is highlighted, upcoming ones are muted. Click a
// segment to move the opportunity to that stage.
export function StagePath({
  stage,
  onSelect,
  disabled = false,
}: {
  stage: OpportunityStage;
  onSelect: (stage: OpportunityStage) => void;
  disabled?: boolean;
}) {
  const currentIndex = OPPORTUNITY_STAGES.indexOf(stage);
  const POINT = 18; // px width of the arrow tip / notch

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex w-full min-w-[44rem]">
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
              title={STAGE_LABELS[s]}
              style={{ clipPath, marginLeft: first ? 0 : -POINT + 2 }}
              className={`flex h-11 flex-1 items-center justify-center whitespace-nowrap pr-4 text-xs font-semibold transition-colors ${
                first ? "pl-5" : "pl-8"
              } ${tone} ${disabled ? "cursor-default" : "cursor-pointer"}`}
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
  );
}
