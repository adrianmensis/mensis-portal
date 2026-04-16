create table clients (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text,
  employee_count      int not null default 0,
  user_count          int not null default 0,
  avatar_count        int not null default 0,
  price_per_avatar    numeric(10,2) not null default 0,
  country             text,
  tenant_url          text,
  contact_first_name  text,
  contact_last_name   text,
  contact_email       text,
  contact_phone       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table clients enable row level security;

create policy "Authenticated users full access"
  on clients for all
  to authenticated
  using (true)
  with check (true);

create trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

create table goals (
  id              uuid primary key default gen_random_uuid(),
  month           date not null unique,
  current_avatars int not null default 0,
  target_avatars  int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table goals enable row level security;

create policy "Authenticated users full access"
  on goals for all
  to authenticated
  using (true)
  with check (true);

create trigger goals_updated_at
  before update on goals
  for each row execute function update_updated_at();
