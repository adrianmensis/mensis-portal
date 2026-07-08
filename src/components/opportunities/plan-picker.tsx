"use client";

import { PLANS, PLAN_BY_KEY, type PlanKey, type BillingPeriod } from "@/lib/pricing";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

function planOptionLabel(key: PlanKey) {
  const p = PLAN_BY_KEY[key];
  return p.price != null ? `${p.name} — $${p.price}/gemelo/mes` : `${p.name} — a convenir`;
}

// Plan + billing period (+ negotiated price for Enterprise). Controlled; the
// parent owns the values so it can drive the live pricing preview.
export function PlanPicker({
  plan,
  onPlan,
  billing,
  onBilling,
  customPrice,
  onCustomPrice,
  twins,
  disabled = false,
}: {
  plan: PlanKey;
  onPlan: (p: PlanKey) => void;
  billing: BillingPeriod;
  onBilling: (b: BillingPeriod) => void;
  customPrice: number;
  onCustomPrice: (n: number) => void;
  twins: number;
  disabled?: boolean;
}) {
  const cap = PLAN_BY_KEY[plan].maxTwins;
  const overCap = cap != null && twins > cap;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="plan">Plan del cliente</Label>
          <Select id="plan" value={plan} onChange={(e) => onPlan(e.target.value as PlanKey)} disabled={disabled}>
            {PLANS.map((p) => (
              <option key={p.key} value={p.key}>{planOptionLabel(p.key)}</option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="billing">Facturación</Label>
          <div className="flex h-11 items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50/50 p-1">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onBilling("monthly")}
              className={`h-full flex-1 rounded-lg text-sm font-medium transition-colors ${billing === "monthly" ? "bg-white text-brand shadow-sm" : "text-zinc-500"}`}
            >
              Mensual
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onBilling("annual")}
              className={`h-full flex-1 rounded-lg text-sm font-medium transition-colors ${billing === "annual" ? "bg-white text-brand shadow-sm" : "text-zinc-500"}`}
            >
              Anual −10%
            </button>
          </div>
        </div>
      </div>

      {plan === "enterprise" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="custom-price">Precio negociado (por gemelo / mes)</Label>
          <Input
            id="custom-price"
            type="number"
            min={0}
            value={customPrice || ""}
            onChange={(e) => onCustomPrice(Number(e.target.value) || 0)}
            disabled={disabled}
            placeholder="Ej. 80"
          />
        </div>
      )}

      {overCap && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          El plan {PLAN_BY_KEY[plan].name} admite hasta {cap} gemelos digitales; tienes {twins}. Considera un plan mayor.
        </p>
      )}
    </div>
  );
}
