-- Add the "tenant creation" stage between Piloto and Cliente: the point where
-- the partner activates the deal and Mensis must provision the tenant before
-- granting access.
alter table public.opportunities
  drop constraint if exists opportunities_stage_check;

alter table public.opportunities
  add constraint opportunities_stage_check
    check (stage in ('lead', 'meeting_scheduled', 'pilot', 'tenant_creation', 'client'));
