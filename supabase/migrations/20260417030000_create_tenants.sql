create type tenant_status as enum ('requested', 'in_progress', 'completed');

create table tenants (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  description           text,
  acquired_licenses     int default 0,
  calendar_platform     text,
  website               text,
  meeting_platform      text,
  country               text,
  contact_name          text,
  contact_email         text,
  contact_phone         text,
  employee_count        int default 0,
  max_mentor_sessions   int default 0,
  max_user_sessions     int default 0,
  pricing_by_user       numeric default 0,
  starknet_wallet       text,
  tenant_id             text,
  tenant_url            text,
  status                tenant_status not null default 'requested',
  requested_by          text,
  requested_at          timestamptz not null default now(),
  completed_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table tenants enable row level security;

create policy "Authenticated users full access"
  on tenants for all
  to authenticated
  using (true)
  with check (true);

create trigger tenants_updated_at
  before update on tenants
  for each row execute function update_updated_at();
