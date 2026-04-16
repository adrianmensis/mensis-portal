"use client";

import { useEffect, useRef } from "react";
import type { Client } from "./clients-table";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
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

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className={`mt-1 text-lg font-bold ${accent ?? "text-zinc-900"}`}>
        {value}
      </p>
    </div>
  );
}

export function ClientModal({
  client: c,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const total = c.avatar_count * c.price_per_avatar;
  const growth = c.user_count - c.avatar_count;

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
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-zinc-100 px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{c.name}</h2>
            {c.description && (
              <p className="mt-0.5 text-sm text-zinc-500">{c.description}</p>
            )}
            {c.country && (
              <p className="mt-0.5 text-xs text-zinc-400">{c.country}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 px-6 pt-5">
          <Stat label="Employees" value={c.employee_count.toLocaleString()} />
          <Stat label="Users" value={c.user_count.toLocaleString()} />
          <Stat label="Avatars" value={c.avatar_count.toLocaleString()} />
          <Stat
            label="Growth Pot."
            value={growth > 0 ? `+${growth}` : `${growth}`}
            accent={growth > 0 ? "text-emerald-600" : "text-zinc-400"}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 px-6 pt-3">
          <Stat label="$/Avatar" value={fmt(c.price_per_avatar)} />
          <Stat label="Total MRR" value={fmt(total)} accent="text-brand" />
          <Stat
            label="Tenant"
            value={c.tenant_url ? c.tenant_url : "—"}
          />
        </div>

        <div className="mt-4 border-t border-zinc-100 px-6 pt-4 pb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Contact
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Name"
              value={
                c.contact_first_name || c.contact_last_name
                  ? `${c.contact_first_name ?? ""} ${c.contact_last_name ?? ""}`.trim()
                  : null
              }
            />
            <Field label="Email" value={c.contact_email} />
            <Field label="Phone" value={c.contact_phone} />
            <Field
              label="Since"
              value={new Date(c.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
