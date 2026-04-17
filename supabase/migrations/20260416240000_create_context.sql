create table context (
  id          uuid primary key default gen_random_uuid(),
  content     text not null default '',
  updated_at  timestamptz not null default now()
);

alter table context enable row level security;

create policy "Authenticated users full access"
  on context for all
  to authenticated
  using (true)
  with check (true);

insert into context (content) values ('');
