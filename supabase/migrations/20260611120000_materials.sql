-- Material library: files uploaded by admins (Mensis team) and downloaded by
-- every partner. The binary lives in a private Storage bucket; one metadata
-- row per file lives in public.materials.

-- ----------------------------------------------------------------------------
-- Private Storage bucket. All upload/download happens server-side through the
-- service-role client (which bypasses Storage RLS), so no storage.objects
-- policies are needed.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('materials', 'materials', false)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- materials: one row per uploaded file.
-- ----------------------------------------------------------------------------
create table public.materials (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  file_path   text not null,            -- object key inside the 'materials' bucket
  file_name   text not null,            -- original filename, for the download
  mime_type   text,
  size_bytes  bigint,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index materials_created_at_idx on public.materials(created_at desc);

alter table public.materials enable row level security;

-- Every authenticated user (admin or partner) can list the library.
create policy "materials_select_authenticated" on public.materials
  for select using (auth.uid() is not null);

-- Only admins manage the library. Writes also go through the service-role
-- client server-side, but these policies keep the table safe for any
-- session-scoped access.
create policy "materials_insert_admin" on public.materials
  for insert with check (public.is_admin());

create policy "materials_delete_admin" on public.materials
  for delete using (public.is_admin());
