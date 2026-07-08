// Shared commercial constants for quotes and the prospect pipeline.
export const COMMISSION_RATE = 0.2; // 20% partner commission.
export const ANNUAL_DISCOUNT = 0.1; // 10% off when billed annually.

export type PlanKey = "small_business" | "starter" | "business" | "enterprise";
export type BillingPeriod = "monthly" | "annual";

export type Plan = {
  key: PlanKey;
  name: string;
  price: number | null; // USD per digital twin / month; null = custom (Enterprise)
  maxTwins: number | null; // hard cap on digital twins, if any
  popular?: boolean;
  blurb: string;
};

// Only pay for Digital Twins — employees access the platform for free.
export const PLANS: Plan[] = [
  {
    key: "small_business",
    name: "Small Business",
    price: 20,
    maxTwins: 5,
    blurb: "Equipos pequeños empezando (hasta 5 gemelos, 50 empleados).",
  },
  {
    key: "starter",
    name: "Starter",
    price: 40,
    maxTwins: null,
    blurb: "Equipos en crecimiento. Gemelos y empleados ilimitados.",
  },
  {
    key: "business",
    name: "Business",
    price: 60,
    maxTwins: null,
    popular: true,
    blurb: "Retención total de conocimiento y colaboración.",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: null,
    maxTwins: null,
    blurb: "Organizaciones grandes, necesidades a medida (precio negociado).",
  },
];

export const PLAN_BY_KEY = Object.fromEntries(PLANS.map((p) => [p.key, p])) as Record<PlanKey, Plan>;

export const AVATAR_PRICE = 40; // legacy Starter price — default for the standalone quoter.

// Effective monthly price per digital twin (custom price for Enterprise).
export function planUnitPrice(plan: PlanKey, customPrice?: number | null): number {
  const p = PLAN_BY_KEY[plan];
  if (p?.price != null) return p.price;
  return customPrice ?? 0;
}

// Monthly license amount = digital twins × unit price.
export function monthlyAmount(
  twins: number | null | undefined,
  plan: PlanKey,
  customPrice?: number | null,
): number {
  return (twins ?? 0) * planUnitPrice(plan, customPrice);
}

// Annual contract value; applies the −10% when billed annually.
export function annualAmount(
  twins: number | null | undefined,
  plan: PlanKey,
  billing: BillingPeriod,
  customPrice?: number | null,
): number {
  const gross = monthlyAmount(twins, plan, customPrice) * 12;
  return billing === "annual" ? gross * (1 - ANNUAL_DISCOUNT) : gross;
}

// Partner commission on any amount.
export function commission(amount: number) {
  return amount * COMMISSION_RATE;
}
