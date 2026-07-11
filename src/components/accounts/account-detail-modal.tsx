"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { countryLabel, flagEmoji } from "@/lib/countries";
import type { TargetAccount } from "@/lib/types";

function fullName(a: TargetAccount) {
  return [a.first_name, a.last_name].filter(Boolean).join(" ").trim();
}

function hostname(url: string) {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Copy-to-clipboard button for the winning message.
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied (insecure context / permission): the text is still on
      // screen and selectable, so there's nothing to recover from.
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
        copied
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-brand/20 bg-white text-brand hover:bg-brand/5"
      }`}
    >
      {copied ? (
        "Copiado ✓"
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copiar
        </>
      )}
    </button>
  );
}

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</span>
      <span className="text-sm text-zinc-800">{children}</span>
    </div>
  );
}

const dash = <span className="text-zinc-400">—</span>;

export function AccountDetailModal({
  account,
  onClose,
}: {
  account: TargetAccount | null;
  onClose: () => void;
}) {
  const a = account;
  return (
    <Modal
      open={a !== null}
      onClose={onClose}
      title={a ? fullName(a) || a.company : ""}
      subtitle={a ? [a.role, a.company].filter(Boolean).join(" · ") || undefined : undefined}
    >
      {a && (
        <div className="flex flex-col gap-6">
          {a.winning_message && (
            <div className="rounded-2xl border border-brand/15 bg-brand/5 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
                  Mensaje ganador
                </span>
                <CopyButton value={a.winning_message} />
              </div>
              <p className="text-sm leading-relaxed text-zinc-700">{a.winning_message}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem label="Empresa">{a.company}</InfoItem>
            <InfoItem label="Rol">{a.role ?? dash}</InfoItem>
            <InfoItem label="País">
              {a.country ? `${flagEmoji(a.country)} ${countryLabel(a.country)}` : dash}
            </InfoItem>
            <InfoItem label="Correo">
              {a.email ? (
                <a href={`mailto:${a.email}`} className="text-brand hover:underline">
                  {a.email}
                </a>
              ) : (
                dash
              )}
            </InfoItem>
            <InfoItem label="Teléfono">
              {a.phone ? (
                <a href={`tel:${a.phone.replace(/\s+/g, "")}`} className="text-brand hover:underline">
                  {a.phone}
                </a>
              ) : (
                dash
              )}
            </InfoItem>
            <InfoItem label="Sitio web">
              {a.website ? (
                <a href={a.website} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                  {hostname(a.website)}
                </a>
              ) : (
                dash
              )}
            </InfoItem>
            <InfoItem label="LinkedIn">
              {a.linkedin_url ? (
                <a
                  href={a.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
                >
                  Ver perfil
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17 17 7" /><path d="M7 7h10v10" />
                  </svg>
                </a>
              ) : (
                dash
              )}
            </InfoItem>
          </div>
        </div>
      )}
    </Modal>
  );
}
