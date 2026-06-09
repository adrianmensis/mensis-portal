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
