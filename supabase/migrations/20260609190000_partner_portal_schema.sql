-- Mensis Partner Portal — core schema with role-based data isolation
-- Two roles: admin (internal Mensis team) and partner (external).
-- Data isolation is enforced at the row level: a partner can only ever
-- read its own opportunities; admins can read everything.

-- ----------------------------------------------------------------------------
-- profiles: one row per auth user, holds role + partner details
-- ----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'partner' check (role in ('admin', 'partner')),
  full_name   text,
  country     text,
  email       text,
  phone       text,
  referred_by text,                       -- Mensis referrer (e.g. "Nathalia")
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- is_admin(): SECURITY DEFINER so it bypasses RLS on profiles and avoids
-- recursive policy evaluation.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and active = true
  );
$$;

-- A user can read its own profile; admins can read every profile.
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- Only admins can update profiles (deactivate access, edit details).
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- Inserts happen server-side with the service role (which bypasses RLS),
-- so no insert policy is exposed to regular users.

-- ----------------------------------------------------------------------------
-- opportunities: business opportunities registered by partners
-- ----------------------------------------------------------------------------
create table public.opportunities (
  id                uuid primary key default gen_random_uuid(),
  partner_id        uuid not null references auth.users(id) on delete cascade,
  client_name       text not null,
  contact_name      text,
  contact_email     text,
  contact_phone     text,
  country           text,
  estimated_avatars integer,
  estimated_value   numeric,
  notes             text,
  status            text not null default 'pending'
                      check (status in ('pending', 'approved', 'won', 'lost')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index opportunities_partner_id_idx on public.opportunities(partner_id);
create index opportunities_status_idx     on public.opportunities(status);

alter table public.opportunities enable row level security;

-- A partner sees only its own opportunities; admins see all.
create policy "opp_select_own_or_admin" on public.opportunities
  for select using (partner_id = auth.uid() or public.is_admin());

-- A partner can register opportunities under its own id; admins can too.
create policy "opp_insert_own_or_admin" on public.opportunities
  for insert with check (partner_id = auth.uid() or public.is_admin());

-- Only admins change status (approve / mark won / lost).
create policy "opp_update_admin" on public.opportunities
  for update using (public.is_admin()) with check (public.is_admin());

-- Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger opportunities_touch_updated_at
  before update on public.opportunities
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- Auto-create a profile when a new auth user is created, pulling details
-- from the user metadata passed at creation time.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, country, email, phone, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'partner'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'country',
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'referred_by'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Seed: promote the existing Adrian account to admin.
-- ----------------------------------------------------------------------------
insert into public.profiles (id, role, full_name, email, active)
select id, 'admin', 'Adrian Diaz', email, true
from auth.users
where email = 'adrian.diaz@mensismentor.com'
on conflict (id) do update set role = 'admin', active = true;
