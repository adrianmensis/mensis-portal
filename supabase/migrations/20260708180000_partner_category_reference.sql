-- Partner classification captured during intake.
-- category: whether the partner operates as an independent consultant or a company.
-- reference: how the partner was acquired (e.g. "Referido por don Adri",
-- "Orgánico", "Campaña Mensis"). Distinct from `referred_by` (internal Mensis owner).
alter table public.profiles
  add column category  text check (category in ('consultor', 'empresa')),
  add column reference text;
