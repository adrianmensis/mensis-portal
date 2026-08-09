"use client";

import Link from "next/link";
import { useState } from "react";
import { useCreateOpportunity } from "@/lib/hooks/use-create-opportunity";
import { fmtCurrency } from "@/lib/format";
import {
  COMMISSION_RATE,
  annualAmount,
  commission,
  planUnitPrice,
  type PlanKey,
  type BillingPeriod,
} from "@/lib/pricing";
import {
  INDUSTRIES,
  INDUSTRY_LABELS,
  OPPORTUNITY_STAGES,
  STAGE_LABELS,
  type Industry,
  type OpportunityStage,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TextField } from "@/components/ui/text-field";
import { NumberField } from "@/components/ui/number-field";
import { Select } from "@/components/ui/select";
import { CountrySelect } from "@/components/ui/country-select";
import { InfoTooltip } from "@/components/ui/tooltip";
import { PlanPicker } from "./plan-picker";

export function OpportunityForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const { mutate, pending, error } = useCreateOpportunity({ onSuccess });
  const [twins, setTwins] = useState(0);
  const [collaborators, setCollaborators] = useState(0);
  const [stage, setStage] = useState<OpportunityStage>("lead");
  const [industry, setIndustry] = useState<Industry | "">("");
  const [plan, setPlan] = useState<PlanKey>("starter");
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [customPrice, setCustomPrice] = useState(0);

  const unitPrice = planUnitPrice(plan, customPrice);
  const montoAnual = annualAmount(twins, plan, billing, customPrice);
  const comisionAnual = commission(montoAnual);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutate({
      client_name: String(fd.get("client_name") ?? ""),
      website: String(fd.get("website") ?? ""),
      country: String(fd.get("country") ?? "") || null,
      industry: industry || null,
      collaborators,
      estimated_avatars: twins,
      plan,
      billing_period: billing,
      custom_price: plan === "enterprise" ? customPrice : null,
      stage,
      notes: String(fd.get("notes") ?? ""),
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 text-left sm:grid-cols-2">
        <TextField label="Nombre del cliente *" name="client_name" required placeholder="Acme Corp" wrapperClassName="sm:col-span-2" />
        <TextField label="Web site" name="website" type="url" placeholder="https://acme.com" wrapperClassName="sm:col-span-2" />
        <CountrySelect label="País" name="country" />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="industry">Industria</Label>
          <Select
            id="industry"
            name="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value as Industry | "")}
          >
            <option value="">Sin especificar</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {INDUSTRY_LABELS[i]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stage">Estado</Label>
          <Select
            id="stage"
            name="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value as OpportunityStage)}
          >
            {OPPORTUNITY_STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <NumberField label="Cantidad de colaboradores" defaultValue={0} onValue={setCollaborators} />
        <NumberField label="Cantidad de gemelos digitales" defaultValue={0} onValue={setTwins} />
        <div className="sm:col-span-2">
          <PlanPicker
            plan={plan}
            onPlan={setPlan}
            billing={billing}
            onBilling={setBilling}
            customPrice={customPrice}
            onCustomPrice={setCustomPrice}
            twins={twins}
          />
        </div>
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

      {/* Live earnings preview (annual) */}
      <div className="grid gap-4 rounded-2xl border border-brand/15 bg-brand/[0.03] p-5 sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Gemelos digitales × ${unitPrice}/mes</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">{twins}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Monto anual</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">{fmtCurrency(montoAnual)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-brand">
            Tu comisión anual ({COMMISSION_RATE * 100}%)
            <InfoTooltip text="Esto es una aproximación. El cálculo real es contra factura." />
          </p>
          <p className="mt-1 text-xl font-bold text-brand">{fmtCurrency(comisionAnual)}</p>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800">
            Cancelar
          </button>
        ) : (
          <Link href="/app/opportunities" className="text-sm font-medium text-zinc-500 hover:text-zinc-800">
            Cancelar
          </Link>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Crear oportunidad!"}
        </Button>
      </div>
    </form>
  );
}
