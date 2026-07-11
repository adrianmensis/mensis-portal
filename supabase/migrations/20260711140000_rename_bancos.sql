-- Drop "Consultoras" from the banks card now that Consultoras is its own card.
update public.use_cases
set name = 'Bancos',
    description = 'Banca corporativa y de inversión.'
where slug = 'bancos-consultoras';
