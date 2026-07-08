-- The commercial `stage` is now the single source of truth for where an
-- opportunity sits. Drop the legacy admin approval `status`.
drop index if exists opportunities_status_idx;
alter table public.opportunities drop column if exists status;

-- Human-friendly consecutive code (OPP-0001, OPP-0002, …). `seq` is the raw
-- monotonic number; the UI formats it as "OPP-####". Adding an identity column
-- backfills existing rows automatically.
alter table public.opportunities
  add column seq bigint generated always as identity;

create unique index opportunities_seq_key on public.opportunities(seq);
