"use client";

import { useState } from "react";
import { AvatarQuoter } from "./avatar-quoter";
import { ImplementationQuoter } from "./implementation-quoter";

const TABS = [
  { id: "licenciamiento", label: "Licenciamiento" },
  { id: "implementacion", label: "Implementación" },
] as const;

export function QuotesView() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("licenciamiento");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-2 rounded-xl border border-brand/15 bg-brand/[0.03] px-4 py-2.5 text-xs text-zinc-500">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-px shrink-0 text-brand">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          Los cotizadores son una <strong className="font-semibold text-zinc-600">herramienta de apoyo</strong>: los montos son estimados orientativos. El cálculo real es contra factura y según el acuerdo comercial.
        </span>
      </div>

      <div className="flex w-fit gap-1 rounded-xl border border-zinc-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-brand text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "licenciamiento" ? <AvatarQuoter /> : <ImplementationQuoter />}
    </div>
  );
}
