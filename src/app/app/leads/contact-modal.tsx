"use client";

import { useEffect, useRef } from "react";

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

const STATUS_COLORS: Record<string, string> = {
  new: "bg-zinc-100 text-zinc-700",
  contacted: "bg-blue-100 text-blue-700",
  responded: "bg-indigo-100 text-indigo-700",
  qualified: "bg-amber-100 text-amber-700",
  proposal: "bg-purple-100 text-purple-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  partner: "Partner",
  cliente_final: "Cliente Final",
};

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-zinc-800">{value}</p>
    </div>
  );
}

export function ContactModal({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-0 shadow-2xl">
        <div className="flex items-start justify-between border-b border-zinc-100 px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{lead.name}</h2>
            {lead.company && (
              <p className="mt-0.5 text-sm text-zinc-500">{lead.company}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 px-6 pt-4">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status] ?? "bg-zinc-100 text-zinc-700"}`}
          >
            {STATUS_LABELS[lead.status] ?? lead.status}
          </span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            {CATEGORY_LABELS[lead.category] ?? lead.category}
          </span>
          {lead.source && (
            <span className="rounded-full bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-500">
              {lead.source}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 pt-5 pb-2">
          <Field label="Email" value={lead.email} />
          <Field label="Phone" value={lead.phone} />
          <Field label="Title" value={lead.title} />
          <Field
            label="Created"
            value={new Date(lead.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          />
        </div>

        {lead.notes && (
          <div className="px-6 pt-2 pb-6">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Notes
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">
              {lead.notes}
            </p>
          </div>
        )}

        {!lead.notes && <div className="h-6" />}
      </div>
    </div>
  );
}
