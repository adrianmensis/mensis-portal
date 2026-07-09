-- Third role: partner_admin — runs the partner network.
--
-- It manages every partner account (create, edit, enable/disable, delete) and
-- reads the whole opportunity pipeline EXCEPT Mensis' own deals: the ones
-- registered by an admin. Write access to opportunities is unchanged — a
-- partner_admin only edits the opportunities it registered itself.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
    check (role in ('admin', 'partner_admin', 'partner'));

-- SECURITY DEFINER so it bypasses RLS on profiles and avoids recursive policy
-- evaluation — same pattern as is_admin().
create or replace function public.is_partner_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'partner_admin' and active = true
  );
$$;

-- True when the given profile is Mensis staff, i.e. rows owned by it are our
-- own deals rather than part of the partner network.
create or replace function public.is_mensis_owned(owner uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = owner and role = 'admin');
$$;

-- ----------------------------------------------------------------------------
-- profiles: own row, everything (admin), or every non-admin row (partner_admin).
-- ----------------------------------------------------------------------------
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_visible" on public.profiles
  for select using (
    id = auth.uid()
    or public.is_admin()
    or (public.is_partner_admin() and role <> 'admin')
  );

-- ----------------------------------------------------------------------------
-- opportunities: own rows, everything (admin), or the whole network minus
-- Mensis' own deals (partner_admin).
-- ----------------------------------------------------------------------------
drop policy if exists "opp_select_own_or_admin" on public.opportunities;
create policy "opp_select_visible" on public.opportunities
  for select using (
    partner_id = auth.uid()
    or public.is_admin()
    or (public.is_partner_admin() and not public.is_mensis_owned(partner_id))
  );

-- Update stays "own row, or any row for an admin" (policy opp_update_own_or_admin
-- from 20260708150000): a partner_admin reads the network but writes only its own.

-- ----------------------------------------------------------------------------
-- Carry the intake fields added since the trigger was last rebuilt (category,
-- reference) and clamp role/category to their check constraints, so a bad
-- metadata value can never break user creation.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role     text := new.raw_user_meta_data ->> 'role';
  meta_category text := new.raw_user_meta_data ->> 'category';
begin
  insert into public.profiles (
    id, role, full_name, country, email, phone, referred_by,
    entry_date, process_stage, linkedin_url, category, reference
  )
  values (
    new.id,
    case when meta_role in ('admin', 'partner_admin', 'partner') then meta_role else 'partner' end,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'country',
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'referred_by',
    nullif(new.raw_user_meta_data ->> 'entry_date', '')::date,
    new.raw_user_meta_data ->> 'process_stage',
    new.raw_user_meta_data ->> 'linkedin_url',
    case when meta_category in ('consultor', 'empresa') then meta_category end,
    nullif(new.raw_user_meta_data ->> 'reference', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
