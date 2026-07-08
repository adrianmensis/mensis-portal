-- Commercial funnel stage for opportunities: where the prospect sits in the
-- sales process (Lead → Reunión agendada → Piloto → Cliente). This is distinct
-- from the admin approval `status` (pending/approved/won/lost).
alter table public.opportunities
  add column stage text not null default 'lead'
    check (stage in ('lead', 'meeting_scheduled', 'pilot', 'client'));

create index opportunities_stage_idx on public.opportunities(stage);
