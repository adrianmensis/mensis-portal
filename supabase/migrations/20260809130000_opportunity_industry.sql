-- Industria del prospecto. Códigos estables en la base, etiquetas en la UI
-- (ver INDUSTRY_LABELS). Las corredoras y los brokers entran en 'insurance':
-- para el negocio son el mismo mercado que las aseguradoras.
alter table public.opportunities
  add column industry text
    check (industry in (
      'insurance', 'banking', 'consulting', 'legal', 'technology', 'government',
      'education', 'healthcare', 'retail', 'manufacturing', 'logistics',
      'real_estate', 'hospitality', 'media', 'energy', 'agriculture',
      'nonprofit', 'other'
    ));

create index opportunities_industry_idx on public.opportunities(industry);

-- Backfill de las oportunidades ya registradas, clasificadas revisando el
-- sitio web de cada prospecto. Las que no se pudieron determinar (sitio caído,
-- página vacía o sin URL) quedan en null para que el partner las complete:
-- seq 1 Biovenko, 2 ManzaTé, 3 y 15 Cocoserv, 10 MOVE Group, 25 Martinexsa,
-- 28 cidesco, 39 Vera Pymes, 43 Grupo Javelly, 47 Goque Group.
update public.opportunities o
set industry = m.industry
from (values
  (4,  'insurance'),      -- Redbridge Assist — asistencia en viajes, grupo asegurador
  (7,  'manufacturing'),  -- Grupo RIBEPAR — pinturas
  (8,  'real_estate'),    -- JYC Bolivia — ascensores Orona
  (9,  'insurance'),      -- Nacional Seguros
  (11, 'legal'),          -- Carolina Ortiz — abogada laboral
  (12, 'legal'),          -- Allison Zabala — blindaje patrimonial
  (13, 'legal'),          -- La firma de abogados
  (14, 'legal'),          -- León Cortés — consultorio jurídico
  (16, 'media'),          -- Voz Anunciante
  (17, 'retail'),         -- Price Shoes
  (18, 'nonprofit'),      -- Visión Mundial
  (19, 'government'),     -- Conapina (.gob.sv)
  (20, 'real_estate'),    -- Inversiones Bolívar — proyectos inmobiliarios
  (21, 'government'),     -- Defensoría del Consumidor (.gob.sv)
  (22, 'consulting'),     -- Advice Group LATAM
  (23, 'real_estate'),    -- Agrisal — inmobiliario y hotelero
  (24, 'banking'),        -- Fedecrédito
  (26, 'education'),      -- Universidad Albert Einstein
  (27, 'manufacturing'),  -- Inquisalva — colorantes y químicos
  (29, 'insurance'),      -- El Águila Compañía de Seguros
  (30, 'insurance'),      -- Aseguradora Interacciones
  (31, 'insurance'),      -- Ecuaprimas — correduría de seguros
  (32, 'insurance'),      -- PROFIDESE — seguro de crédito
  (33, 'insurance'),      -- Allianz Argentina
  (34, 'insurance'),      -- Howden — correduría
  (35, 'insurance'),      -- Almudena Seguros y Reaseguros
  (36, 'insurance'),      -- NEXO Corredores de Seguros
  (37, 'insurance'),      -- Multiseguros Corredores de Seguros
  (38, 'insurance'),      -- FID Seguros
  (40, 'education'),      -- Universidad Castro Carazo
  (41, 'technology'),     -- Titanium
  (42, 'manufacturing'),  -- Tostacafé — tueste y molienda de café
  (44, 'education'),      -- Innovalearninghub
  (45, 'technology'),     -- Incompany — partner Salesforce
  (46, 'insurance'),      -- Brokers Financial Group
  (48, 'retail'),         -- Linda Corp — tiendas Tambo
  (49, 'hospitality'),    -- TASØ Hospitality Group
  (50, 'real_estate'),    -- RE/MAX Perú
  (51, 'government'),     -- Municipalidad de Parrita
  (52, 'other')           -- Federación Ecuatoriana de Fútbol
) as m(seq, industry)
where o.seq = m.seq;
