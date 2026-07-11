"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/spinner";
import type { UseCaseWithCount } from "@/lib/types";

// Icon + accent are stored as keys in the DB and resolved here, so the palette
// stays type-safe (no dynamic Tailwind classes from raw DB strings).
const ICONS: Record<string, ReactNode> = {
  shield: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  umbrella: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2" /><path d="M12 20a2 2 0 0 0 4 0v-1" />
      <path d="M2 12a10 10 0 0 1 20 0Z" />
    </svg>
  ),
  bank: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" />
    </svg>
  ),
  cpu: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  ),
  briefcase: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  scale: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" /><path d="M7 21h10" /><path d="M3 7h4c2 0 5-1 5-2 0 1 3 2 5 2h4" />
      <path d="m5 7-3 6a3 3 0 0 0 6 0z" /><path d="m19 7-3 6a3 3 0 0 0 6 0z" />
    </svg>
  ),
};

const ACCENTS: Record<string, { iconBg: string; iconText: string; text: string; ring: string }> = {
  blue: { iconBg: "bg-blue-50", iconText: "text-blue-600", text: "text-blue-600", ring: "hover:border-blue-200" },
  emerald: { iconBg: "bg-emerald-50", iconText: "text-emerald-600", text: "text-emerald-600", ring: "hover:border-emerald-200" },
  violet: { iconBg: "bg-violet-50", iconText: "text-violet-600", text: "text-violet-600", ring: "hover:border-violet-200" },
  amber: { iconBg: "bg-amber-50", iconText: "text-amber-600", text: "text-amber-600", ring: "hover:border-amber-200" },
  rose: { iconBg: "bg-rose-50", iconText: "text-rose-600", text: "text-rose-600", ring: "hover:border-rose-200" },
  teal: { iconBg: "bg-teal-50", iconText: "text-teal-600", text: "text-teal-600", ring: "hover:border-teal-200" },
};

const FALLBACK = ACCENTS.blue;

function UseCaseCard({ useCase, onOpen }: { useCase: UseCaseWithCount; onOpen: () => void }) {
  const accent = (useCase.accent && ACCENTS[useCase.accent]) || FALLBACK;
  const icon = (useCase.icon && ICONS[useCase.icon]) || ICONS.shield;

  return (
    <button
      onClick={onOpen}
      className={`group relative flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_48px_-16px_rgba(39,59,124,0.22)] ${accent.ring}`}
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent.iconBg} ${accent.iconText}`}>
          {icon}
        </span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500">
          {useCase.account_count} cuenta{useCase.account_count === 1 ? "" : "s"}
        </span>
      </div>

      <div>
        <h3 className="text-base font-semibold text-zinc-900">{useCase.name}</h3>
        {useCase.description && (
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">{useCase.description}</p>
        )}
      </div>

      <span className={`mt-auto inline-flex items-center gap-1 text-sm font-medium ${accent.text}`}>
        Ver cuentas
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 group-hover:translate-x-1"
        >
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </button>
  );
}

export function UseCaseGrid() {
  const router = useRouter();
  const { data: useCases, loading, error } = useResource(() => api.useCases.list());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cuentas objetivo"
        subtitle="Elige un caso de uso para explorar sus cuentas de prospección."
      />

      {loading && <LoadingRow label="Cargando casos de uso…" />}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

      {!loading && useCases && useCases.length === 0 && (
        <EmptyState message="Aún no hay casos de uso configurados." />
      )}

      {useCases && useCases.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((uc) => (
            <UseCaseCard
              key={uc.id}
              useCase={uc}
              onOpen={() => router.push(`/app/accounts/${uc.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
