"use client";

import { useState } from "react";
import { fmtCurrency } from "@/lib/format";
import {
  COMMISSION_RATE,
  PLAN_BY_KEY,
  planUnitPrice,
  monthlyAmount,
  annualAmount,
  commission,
  type PlanKey,
  type BillingPeriod,
} from "@/lib/pricing";
import type { QuoteClient, QuoteDoc } from "@/lib/quote-print";

// State + pricing math for the licensing quoter. The component stays purely
// presentational; all the numbers (and the PDF document) come from here.
export function useLicenseQuote() {
  const [avatars, setAvatars] = useState(5);
  const [users, setUsers] = useState(100);
  const [plan, setPlan] = useState<PlanKey>("starter");
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [customPrice, setCustomPrice] = useState(0);

  const unitPrice = planUnitPrice(plan, customPrice);
  const monthly = monthlyAmount(avatars, plan, customPrice);
  const annualTotal = annualAmount(avatars, plan, billing, customPrice);
  const savings = monthly * 12 - annualTotal;
  const isAnnual = billing === "annual";
  const planName = PLAN_BY_KEY[plan].name;

  // Commission tracks the actual billed amount (annual discount included).
  const comisionAnual = commission(annualTotal);
  const comisionMensual = comisionAnual / 12;

  const buildDoc = (client: QuoteClient): QuoteDoc => ({
    kind: "Licenciamiento",
    client,
    lines: [
      {
        label: `Licenciamiento de gemelos digitales — Plan ${planName}`,
        sub: `${avatars} gemelo${avatars === 1 ? "" : "s"} digital${avatars === 1 ? "" : "es"} × ${fmtCurrency(unitPrice)}/mes`,
        value: `${fmtCurrency(monthly)}/mes`,
      },
      ...(isAnnual
        ? [{ label: "Descuento facturación anual (−10%)", value: `−${fmtCurrency(savings)}` }]
        : []),
    ],
    totals: [
      { label: "Total mensual", value: fmtCurrency(monthly) },
      { label: isAnnual ? "Total anual (−10%)" : "Total anual", value: fmtCurrency(annualTotal), strong: true },
    ],
    note:
      `Estimado de apoyo — el cálculo real es contra factura. ` +
      `Plan ${planName} · ${fmtCurrency(unitPrice)}/gemelo/mes. Usuarios (seats): ${users.toLocaleString()}. ` +
      `Tu comisión (${COMMISSION_RATE * 100}%): ${fmtCurrency(comisionMensual)}/mes × 12 = ${fmtCurrency(comisionAnual)} al año.`,
  });

  return {
    avatars, setAvatars,
    users, setUsers,
    plan, setPlan,
    billing, setBilling,
    customPrice, setCustomPrice,
    unitPrice, monthly, annualTotal, savings, isAnnual, planName,
    comisionAnual, comisionMensual,
    buildDoc,
  };
}
