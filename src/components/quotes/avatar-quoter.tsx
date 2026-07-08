"use client";

import { fmtCurrency } from "@/lib/format";
import { COMMISSION_RATE } from "@/lib/pricing";
import { useLicenseQuote } from "@/lib/hooks/use-license-quote";
import { NumberField } from "@/components/ui/number-field";
import { PlanPicker } from "@/components/opportunities/plan-picker";
import { QuoteDownload } from "./quote-download";

export function AvatarQuoter() {
  const q = useLicenseQuote();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField label="Gemelos digitales" defaultValue={5} onValue={q.setAvatars} />
            <NumberField label="Usuarios (seats)" defaultValue={100} onValue={q.setUsers} />
          </div>
          <PlanPicker
            plan={q.plan}
            onPlan={q.setPlan}
            billing={q.billing}
            onBilling={q.setBilling}
            customPrice={q.customPrice}
            onCustomPrice={q.setCustomPrice}
            twins={q.avatars}
          />
          <p className="text-xs text-zinc-400">
            Herramienta de apoyo — estimado orientativo. Plan {q.planName}: {fmtCurrency(q.unitPrice)}/gemelo digital/mes.
            Solo pagas por gemelos; los empleados usan la plataforma gratis.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-brand/15 bg-brand/[0.03] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Licenciamiento · {q.planName}</p>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-zinc-500">Total mensual</span>
            <span className="text-2xl font-bold text-zinc-900">{fmtCurrency(q.monthly)}</span>
          </div>
          <div className="h-px bg-brand/10" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-zinc-500">Total anual{q.isAnnual ? " (−10%)" : ""}</span>
            <span className="text-3xl font-bold text-brand">{fmtCurrency(q.annualTotal)}</span>
          </div>
          {q.savings > 0 && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              Ahorras {fmtCurrency(q.savings)} al año con facturación anual.
            </p>
          )}
          <div className="flex items-center justify-between rounded-lg bg-brand/8 px-3 py-2.5">
            <div>
              <span className="text-xs font-semibold text-brand">Tu comisión ({COMMISSION_RATE * 100}%)</span>
              <div className="text-[11px] text-brand/70">{fmtCurrency(q.comisionMensual)}/mes × 12 meses</div>
            </div>
            <span className="text-lg font-bold text-brand">{fmtCurrency(q.comisionAnual)}</span>
          </div>
          <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
            <div className="flex justify-between"><span>Gemelos digitales</span><span>{q.avatars}</span></div>
            <div className="flex justify-between"><span>Usuarios</span><span>{q.users.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Precio / gemelo</span><span>{fmtCurrency(q.unitPrice)}/mes</span></div>
          </div>
        </div>
      </div>

      <QuoteDownload build={q.buildDoc} />
    </div>
  );
}
