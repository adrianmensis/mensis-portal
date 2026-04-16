create type trial_status as enum ('active', 'converting', 'converted', 'churned');

create table trials (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text,
  employee_count      int not null default 0,
  user_count          int not null default 0,
  avatar_count        int not null default 0,
  country             text,
  tenant_url          text,
  contact_first_name  text,
  contact_last_name   text,
  contact_email       text,
  contact_phone       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table trials enable row level security;

create policy "Authenticated users full access"
  on trials for all
  to authenticated
  using (true)
  with check (true);

create trigger trials_updated_at
  before update on trials
  for each row execute function update_updated_at();

-- taso-group trial
insert into trials (name, description, employee_count, user_count, avatar_count, country, tenant_url, contact_first_name, contact_email, contact_phone)
values (
  'Taso Group',
  'Shaping the boutique hospitality experience in Central America through a growing collection of high-performing, design-forward properties.',
  300,
  100,
  20,
  'Panama',
  'taso-group.mensismentor.com',
  'Gabriel',
  'gabriel@taso-group.com',
  '+507 44 95-5398'
);
