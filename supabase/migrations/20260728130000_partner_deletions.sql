-- Bitácora de partners eliminados.
--
-- Eliminar un partner borra su cuenta de auth y, en cascada, todas las
-- oportunidades que registró. Antes de eso no quedaba rastro de quién era ni
-- de quién lo borró. Esta tabla guarda una foto del partner al momento de
-- eliminarlo para poder reportarlo después.
--
-- Es un registro histórico: no referencia al partner (ya no existe) y no se
-- actualiza nunca. Solo lo escribe el service role desde /api/partners/[id].

create table public.partner_deletions (
  id                 uuid primary key default gen_random_uuid(),
  -- Foto del partner al momento de borrarlo.
  partner_seq        bigint,
  full_name          text,
  email              text,
  country            text,
  phone              text,
  category           text,
  process_stage      text,
  entry_date         date,
  reference          text,
  referred_by        text,
  partner_role       text,
  linkedin_url       text,
  partner_created_at timestamptz,
  -- Cuántas oportunidades se fueron con él en la cascada.
  opportunity_count  integer not null default 0,
  -- Quién lo eliminó.
  deleted_by         uuid references auth.users(id) on delete set null,
  deleted_by_name    text,
  deleted_by_email   text,
  deleted_at         timestamptz not null default now()
);

create index partner_deletions_deleted_at_idx on public.partner_deletions(deleted_at desc);

alter table public.partner_deletions enable row level security;

-- Lo lee quien administra la red: admin y partner_admin. No hay policy de
-- insert/update/delete a propósito — solo el service role escribe aquí, y
-- nadie puede editar o borrar la bitácora desde la app.
create policy "partner_deletions_select_managers" on public.partner_deletions
  for select using (public.is_admin() or public.is_partner_admin());
