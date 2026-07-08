-- Client-request details captured when an opportunity advances to tenant
-- creation, plus Mensis provisioning fields. `country`, `contact_name` and
-- `contact_email` already exist and are reused (empresa country + client contact).
alter table public.opportunities
  add column video_platform text check (video_platform in ('teams', 'google_meet')),
  add column requires_pilot boolean,
  add column tenant_url text,
  add column admin_user text;

-- Partners now drive their own funnel (advance stage, fill the client request),
-- not just admins. Allow updating their own rows. Column-level rules — partners
-- cannot set the Mensis provisioning fields (tenant_url, admin_user) — are
-- enforced in the API layer.
drop policy if exists "opp_update_admin" on public.opportunities;
create policy "opp_update_own_or_admin" on public.opportunities
  for update using (partner_id = auth.uid() or public.is_admin())
  with check (partner_id = auth.uid() or public.is_admin());
