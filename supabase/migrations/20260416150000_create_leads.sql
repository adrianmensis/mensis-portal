create type lead_category as enum ('partner', 'cliente_final');

create type lead_status as enum (
  'new',
  'contacted',
  'responded',
  'qualified',
  'proposal',
  'won',
  'lost'
);

create table leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  company     text,
  title       text,
  category    lead_category not null default 'cliente_final',
  status      lead_status not null default 'new',
  source      text,
  notes       text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table leads enable row level security;

create policy "Authenticated users full access"
  on leads for all
  to authenticated
  using (true)
  with check (true);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- Sample lead: Adrian Sánchez Rodríguez from DICOMA
insert into leads (name, email, company, title, category, status, source, notes)
values (
  'Adrian Sánchez Rodríguez',
  'asanchez@dicoma.com',
  'DICOMA',
  'CONSTRUCCIÓN-REFRIGERACIÓN-ENERGÍAS LIMPIAS-MAQUINARIA-DISEÑO ONE STOP SHOP',
  'cliente_final',
  'contacted',
  'LinkedIn',
  'Contactado via LinkedIn. Felicitado por reconocimiento Revista Summa. Se ofreció trial gratis de Mensis para reducir costos operativos con IA. Pidió info por email.'
);
