-- Cuentas objetivo — a curated prospecting database organized by "caso de uso"
-- (vertical). Admins load the data; EVERY partner browses it, read-only, from
-- the UI. Two tables:
--   use_cases      — the cards (Aseguradoras, Bancos, …)
--   target_accounts — the people/companies inside each use case
-- Shared pool: no per-partner assignment or claiming (for now).

-- ----------------------------------------------------------------------------
-- use_cases: one card per vertical/segment.
-- ----------------------------------------------------------------------------
create table public.use_cases (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  icon        text,                         -- icon key, mapped in the UI
  accent      text,                         -- accent color key, mapped in the UI
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.use_cases enable row level security;

-- Every authenticated user can see the cards.
create policy "use_cases_select_authenticated" on public.use_cases
  for select using (auth.uid() is not null);

-- Only admins curate the catalog (writes go through the service-role client).
create policy "use_cases_write_admin" on public.use_cases
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- target_accounts: the prospecting rows, each belonging to a use case.
-- ----------------------------------------------------------------------------
create table public.target_accounts (
  id              uuid primary key default gen_random_uuid(),
  use_case_id     uuid not null references public.use_cases(id) on delete cascade,
  first_name      text,                     -- nombre
  last_name       text,                     -- apellido
  role            text,                     -- rol / cargo
  country         text,                     -- ISO alpha-2, drives the país filter
  company         text not null,            -- empresa (the anchor field)
  email           text,                     -- correo
  website         text,
  linkedin_url    text,
  phone           text,                     -- teléfono
  winning_message text,                     -- "mensaje ganador": the opening angle
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index target_accounts_use_case_idx  on public.target_accounts(use_case_id);
create index target_accounts_country_idx    on public.target_accounts(country);

alter table public.target_accounts enable row level security;

-- Every authenticated user (admin, partner_admin, partner) can browse.
create policy "target_accounts_select_authenticated" on public.target_accounts
  for select using (auth.uid() is not null);

-- Only admins curate the list (writes go through the service-role client).
create policy "target_accounts_write_admin" on public.target_accounts
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- Seed: the first use-case cards + one example account to build the UI on.
-- ----------------------------------------------------------------------------
insert into public.use_cases (slug, name, description, icon, accent, sort_order) values
  ('aseguradoras',       'Aseguradoras',          'Compañías de seguros y su liderazgo comercial.',      'shield',   'blue',    1),
  ('corredoras-seguro',  'Corredoras de seguro',  'Brokers y agencias intermediarias de seguros.',       'umbrella', 'emerald', 2),
  ('bancos-consultoras', 'Bancos y Consultoras',  'Banca y firmas de consultoría corporativa.',          'bank',     'violet',  3),
  ('tecnologia',         'Tecnología',            'Empresas de software, SaaS e infraestructura.',       'cpu',      'amber',   4)
on conflict (slug) do nothing;

insert into public.target_accounts
  (use_case_id, first_name, last_name, role, country, company, email, website, linkedin_url, phone, winning_message)
select id, 'María', 'Gómez', 'Directora Comercial', 'CO', 'Seguros Bolívar',
       'maria.gomez@segurosbolivar.com', 'https://www.segurosbolivar.com',
       'https://www.linkedin.com/in/maria-gomez', '+57 300 000 0000',
       'Reducir el churn de asesores con formación gamificada y práctica con IA.'
from public.use_cases where slug = 'aseguradoras';
