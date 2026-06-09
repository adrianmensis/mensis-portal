-- Prospect-oriented fields for opportunities: company website and headcount.
alter table public.opportunities
  add column website      text,
  add column collaborators integer;
