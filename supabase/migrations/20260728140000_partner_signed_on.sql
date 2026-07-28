-- Fecha de firma del contrato.
--
-- `process_stage` guarda solo la etapa actual: no queda registro de cuándo un
-- partner llegó a "Partner!", así que no había forma de contar cuántos firmaron
-- en una semana. Esta columna es esa fecha.
--
-- Es `date` y no `timestamptz` a propósito: la métrica es "en qué semana cayó",
-- y una marca de tiempo en UTC puede caer del lado equivocado del lunes cuando
-- se lee en hora local (Colombia va -5). Con una fecha suelta no hay corrimiento.
alter table public.profiles add column signed_on date;

-- Se llena sola al mover el partner a "Partner!" y se limpia si vuelve atrás,
-- para que la etapa y la fecha nunca se contradigan. Va en la base y no en la
-- app para que valga por cualquier camino que escriba la fila.
create or replace function public.sync_partner_signed_on()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.process_stage = 'Partner!' and new.signed_on is null then
      new.signed_on := current_date;
    end if;
    return new;
  end if;

  if new.process_stage is distinct from old.process_stage then
    if new.process_stage = 'Partner!' then
      -- Si el update ya trae una fecha explícita (el contrato se firmó antes de
      -- cargarlo al portal), se respeta.
      if new.signed_on is null then new.signed_on := current_date; end if;
    else
      new.signed_on := null;
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_sync_signed_on
  before insert or update on public.profiles
  for each row execute function public.sync_partner_signed_on();

-- Los partners que ya estuvieran en "Partner!" antes de esta migración no
-- tienen fecha; se les pone la de hoy para que no queden fuera de todo conteo.
update public.profiles
   set signed_on = current_date
 where process_stage = 'Partner!' and signed_on is null;
