-- Additional partner intake fields captured at creation time.
alter table public.profiles
  add column entry_date    date,    -- fecha de ingreso
  add column process_stage text,    -- etapa del proceso
  add column linkedin_url  text;    -- enlace a perfil de LinkedIn

-- Rebuild the new-user trigger to also pull the new fields from metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, role, full_name, country, email, phone, referred_by,
    entry_date, process_stage, linkedin_url
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'partner'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'country',
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'referred_by',
    nullif(new.raw_user_meta_data ->> 'entry_date', '')::date,
    new.raw_user_meta_data ->> 'process_stage',
    new.raw_user_meta_data ->> 'linkedin_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
