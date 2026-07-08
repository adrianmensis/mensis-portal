-- The client's chosen plan drives pricing. `custom_price` holds the negotiated
-- per-twin price for Enterprise ("Let's talk"). `estimated_value` now stores the
-- annual contract value (ACV).
alter table public.opportunities
  add column plan text not null default 'starter'
    check (plan in ('small_business', 'starter', 'business', 'enterprise')),
  add column billing_period text not null default 'monthly'
    check (billing_period in ('monthly', 'annual')),
  add column custom_price numeric;

-- Backfill existing rows to the annual value at the Starter price ($40),
-- monthly billing (no discount) — matching how they were computed before.
update public.opportunities
  set estimated_value = coalesce(estimated_avatars, 0) * 40 * 12;
