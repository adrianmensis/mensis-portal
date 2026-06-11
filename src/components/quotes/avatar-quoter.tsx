"use client";

import { useState } from "react";
import { fmtCurrency } from "@/lib/format";
import { commission, COMMISSION_RATE } from "@/lib/pricing";
import { Label } from "@/components/ui/label";
import { NumberField } from "@/components/ui/number-field";
import { QuoteDownload } from "./quote-download";
import type { QuoteClient } from "@/lib/quote-print";

const ANNUAL_DISCOUNT = 0.1; // 10% off when billed annually.
const DEFAULT_PRICE = 40; // standard price per avatar / month (USD).

export function AvatarQuoter() {
  const [avatars, setAvatars] = useState(5);
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [users, setUsers] = useState(100);
  const [annual, setAnnual] = useState(false);

  const monthly = Math.max(0, avatars) * Math.max(0, price);
  const annualBase = monthly * 12;
  const annualTotal = annual ? annualBase * (1 - ANNUAL_DISCOUNT) : annualBase;
  const savings = annual ? annualBase - annualTotal : 0;

  // Commission is 20% of each month's license fee, across the 12 months.
  const comisionMensual = commission(monthly);
  const comisionAnual = comisionMensual * 12;

  const buildDoc = (client: QuoteClient) => ({
    kind: "Licenciamiento",
    client,
    lines: [
      {
        label: "Licenciamiento de avatares",
        sub: `${avatars} avatar${avatars === 1 ? "" : "es"} × ${fmtCurrency(price)}/mes`,
        value: `${fmtCurrency(monthly)}/mes`,
      },
      ...(annual
        ? [{ label: "Descuento facturación anual (−10%)", value: `−${fmtCurrency(savings)}` }]
        : []),
    ],
    totals: [
      { label: "Total mensual", value: fmtCurrency(monthly) },
      { label: annual ? "Total anual (−10%)" : "Total anual", value: fmtCurrency(annualTotal), strong: true },
    ],
    note:
      `Usuarios (seats): ${users.toLocaleString()}. ` +
      `Tu comisión (${COMMISSION_RATE * 100}%/mes): ${fmtCurrency(comisionMensual)}/mes × 12 = ${fmtCurrency(comisionAnual)} al año. ` +
      `Precio estándar $${DEFAULT_PRICE}/avatar/mes, ajustable según acuerdo comercial.`,
  });

  return (
    <div className="flex flex-col gap-6">
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField label="Avatares (Digital Twins)" defaultValue={5} onValue={setAvatars} />
          <NumberField label="Precio por avatar / mes" prefix="$" defaultValue={DEFAULT_PRICE} onValue={setPrice} />
          <NumberField label="Usuarios (seats)" defaultValue={100} onValue={setUsers} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="billing">Facturación</Label>
            <div className="flex h-11 items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50/50 p-1">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`h-full flex-1 rounded-lg text-sm font-medium transition-colors ${!annual ? "bg-white text-brand shadow-sm" : "text-zinc-500"}`}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`h-full flex-1 rounded-lg text-sm font-medium transition-colors ${annual ? "bg-white text-brand shadow-sm" : "text-zinc-500"}`}
              >
                Anual −10%
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-zinc-400">
          Precio estándar ${DEFAULT_PRICE}/avatar/mes — ajústalo según tu acuerdo comercial.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-brand/15 bg-brand/[0.03] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Licenciamiento</p>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-zinc-500">Total mensual</span>
          <span className="text-2xl font-bold text-zinc-900">{fmtCurrency(monthly)}</span>
        </div>
        <div className="h-px bg-brand/10" />
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-zinc-500">Total anual{annual ? " (−10%)" : ""}</span>
          <span className="text-3xl font-bold text-brand">{fmtCurrency(annualTotal)}</span>
        </div>
        {savings > 0 && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            Ahorras {fmtCurrency(savings)} al año con facturación anual.
          </p>
        )}
        <div className="flex items-center justify-between rounded-lg bg-brand/8 px-3 py-2.5">
          <div>
            <span className="text-xs font-semibold text-brand">Tu comisión ({COMMISSION_RATE * 100}%/mes)</span>
            <div className="text-[11px] text-brand/70">{fmtCurrency(comisionMensual)}/mes × 12 meses</div>
          </div>
          <span className="text-lg font-bold text-brand">{fmtCurrency(comisionAnual)}</span>
        </div>
        <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
          <div className="flex justify-between"><span>Avatares</span><span>{avatars}</span></div>
          <div className="flex justify-between"><span>Usuarios</span><span>{users.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Precio / avatar</span><span>{fmtCurrency(price)}/mes</span></div>
        </div>
      </div>
    </div>

      <QuoteDownload build={buildDoc} />
    </div>
  );
}
