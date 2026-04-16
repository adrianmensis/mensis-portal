create table partners (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text,
  country             text,
  contact_first_name  text,
  contact_last_name   text,
  contact_email       text,
  contact_phone       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table partners enable row level security;

create policy "Authenticated users full access"
  on partners for all
  to authenticated
  using (true)
  with check (true);

create trigger partners_updated_at
  before update on partners
  for each row execute function update_updated_at();
