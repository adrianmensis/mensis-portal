-- Two more use-case cards → 6 total: Consultoras and Bufetes de abogados.
insert into public.use_cases (slug, name, description, icon, accent, sort_order) values
  ('consultoras',      'Consultoras',          'Firmas de consultoría estratégica y de gestión.',    'briefcase', 'rose', 5),
  ('bufetes-abogados', 'Bufetes de abogados',  'Estudios jurídicos y firmas legales corporativas.',  'scale',     'teal', 6)
on conflict (slug) do nothing;
