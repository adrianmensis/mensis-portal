-- Etapas reales del proceso de un partner. Reemplazan al set genérico que
-- traía el esquema inicial ("Prospecto", "Entrevista", "Onboarding", …):
--
--   IA Partner Showcase → Business Discovery → Contract Review → Partner!
--
-- Es el embudo por el que pasa un candidato hasta quedar activo en la red.

-- Los partners cargados hasta hoy entraron todos como "Prospecto", que
-- equivale a la primera etapa del embudo nuevo.
update public.profiles
   set process_stage = 'IA Partner Showcase'
 where role = 'partner'
   and (
     process_stage is null
     or process_stage not in ('IA Partner Showcase', 'Business Discovery', 'Contract Review', 'Partner!')
   );

-- Las cuentas de Mensis (admin / partner_admin) no recorren el embudo.
update public.profiles
   set process_stage = null
 where role <> 'partner'
   and process_stage is not null
   and process_stage not in ('IA Partner Showcase', 'Business Discovery', 'Contract Review', 'Partner!');

alter table public.profiles drop constraint if exists profiles_process_stage_check;
alter table public.profiles
  add constraint profiles_process_stage_check
    check (
      process_stage is null
      or process_stage in ('IA Partner Showcase', 'Business Discovery', 'Contract Review', 'Partner!')
    );

-- El trigger escribía el valor crudo del metadata. Con el check de arriba, una
-- etapa inválida haría fallar el insert del perfil y, con él, la creación del
-- usuario entero ("Database error creating new user"). Se clampa igual que
-- role y category: valor válido o la primera etapa del embudo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role     text := new.raw_user_meta_data ->> 'role';
  meta_category text := new.raw_user_meta_data ->> 'category';
  meta_stage    text := new.raw_user_meta_data ->> 'process_stage';
  final_role    text := case when meta_role in ('admin', 'partner_admin', 'partner') then meta_role else 'partner' end;
begin
  insert into public.profiles (
    id, role, full_name, country, email, phone, referred_by,
    entry_date, process_stage, linkedin_url, category, reference
  )
  values (
    new.id,
    final_role,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'country',
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'referred_by',
    nullif(new.raw_user_meta_data ->> 'entry_date', '')::date,
    case
      when meta_stage in ('IA Partner Showcase', 'Business Discovery', 'Contract Review', 'Partner!') then meta_stage
      when final_role = 'partner' then 'IA Partner Showcase'
    end,
    new.raw_user_meta_data ->> 'linkedin_url',
    case when meta_category in ('consultor', 'empresa') then meta_category end,
    nullif(new.raw_user_meta_data ->> 'reference', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
