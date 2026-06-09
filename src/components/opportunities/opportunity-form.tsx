"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { api } from "@/lib/api/client";
import { fmtCurrency } from "@/lib/format";
import { AVATAR_PRICE, COMMISSION_RATE, avatarAmount, commission } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TextField } from "@/components/ui/text-field";
import { NumberField } from "@/components/ui/number-field";

export function OpportunityForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [avatars, setAvatars] = useState(0);
  const [collaborators, setCollaborators] = useState(0);

  const monto = avatarAmount(avatars);
  const comision = commission(monto);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      client_name: String(fd.get("client_name") ?? ""),
      website: String(fd.get("website") ?? ""),
      collaborators,
      estimated_avatars: avatars,
      notes: String(fd.get("notes") ?? ""),
    };
    startTransition(async () => {
      try {
        await api.opportunities.create(input);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/app/opportunities");
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo registrar.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nombre del cliente *" name="client_name" required placeholder="Acme Corp" wrapperClassName="sm:col-span-2" />
        <TextField label="Web site" name="website" type="url" placeholder="https://acme.com" wrapperClassName="sm:col-span-2" />
        <NumberField label="Cantidad de colaboradores" defaultValue={0} onValue={setCollaborators} />
        <NumberField label="Cantidad de avatares" defaultValue={0} onValue={setAvatars} />
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Contexto del prospecto…"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
          />
        </div>
      </div>

      {/* Live earnings preview */}
      <div className="grid gap-4 rounded-2xl border border-brand/15 bg-brand/[0.03] p-5 sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Avatares × ${AVATAR_PRICE}</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">{avatars}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Monto total</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">{fmtCurrency(monto)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Tu comisión ({COMMISSION_RATE * 100}%)</p>
          <p className="mt-1 text-xl font-bold text-brand">{fmtCurrency(comision)}</p>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Registrar oportunidad"}
        </Button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800">
            Cancelar
          </button>
        ) : (
          <Link href="/app/opportunities" className="text-sm font-medium text-zinc-500 hover:text-zinc-800">
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
