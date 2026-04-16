create type follow_up_type as enum ('call', 'email', 'meeting', 'note', 'task');

create table follow_ups (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads(id) on delete cascade,
  content     text not null,
  type        follow_up_type not null default 'note',
  done        boolean not null default false,
  due_date    date,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table follow_ups enable row level security;

create policy "Authenticated users full access"
  on follow_ups for all
  to authenticated
  using (true)
  with check (true);

create trigger follow_ups_updated_at
  before update on follow_ups
  for each row execute function update_updated_at();
