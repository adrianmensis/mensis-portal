-- Completa el país de las oportunidades ya cargadas, leyéndolo del dominio del
-- sitio (.com.bo, .gob.sv, .cl) o de la ubicación que el partner dejó escrita
-- en el nombre o las notas. Sin país no hay corte por región, y hasta ahora
-- solo 6 de 50 lo tenían.
--
-- Quedan sin país las que no se pudieron determinar — dominio .com genérico y
-- sin pista en el texto: seq 1 Biovenko, 3 y 15 Cocoserv, 4 Redbridge,
-- 12 Allison Zabala, 22 Advice Group, 25 Martinexsa, 39 Vera Pymes,
-- 41 Titanium, 42 Tostacafé, 44 Innovalearninghub, 46 Brokers Financial,
-- 47 Goque Group, 49 TASØ.
update public.opportunities o
set country = m.country
from (values
  (2,  'CR'),  -- manzate.co.cr
  (7,  'BO'),  -- ribepar.com.bo
  (8,  'BO'),  -- jycbolivia.com
  (9,  'BO'),  -- nacionalseguros.com.bo
  (13, 'CR'),  -- lafirmadeabogadoscr.com
  (17, 'MX'),  -- Price Shoes
  (18, 'SV'),  -- worldvision.org.sv
  (19, 'SV'),  -- conapina.gob.sv
  (20, 'SV'),  -- Inversiones Bolívar, El Salvador
  (21, 'SV'),  -- defensoria.gob.sv
  (23, 'SV'),  -- Agrisal, El Salvador
  (24, 'SV'),  -- fedecredito.com.sv
  (26, 'SV'),  -- uae.edu.sv
  (27, 'SV'),  -- Inquisalva, El Salvador
  (29, 'MX'),  -- elaguila.com.mx
  (30, 'MX'),  -- Aseguradora Interacciones, México
  (31, 'EC'),  -- ecuaprimas.com
  (32, 'MX'),  -- PROFIDESE, Ciudad de México
  (33, 'AR'),  -- allianz.com.ar
  (34, 'ES'),  -- Howden Iberia
  (35, 'ES'),  -- almudenaseguros.es
  (36, 'CL'),  -- nexoseguros.cl
  (37, 'PE'),  -- multiseguros.com.pe
  (38, 'CL'),  -- fidseguros.cl
  (40, 'CR'),  -- Universidad Castro Carazo
  (43, 'MX'),  -- grupojavelly.mx
  (45, 'CR'),  -- incompany.cr
  (48, 'PE'),  -- tambo.pe
  (50, 'PE'),  -- remax.pe
  (51, 'CR'),  -- muniparrita.go.cr
  (52, 'EC')   -- afe.com.ec
) as m(seq, country)
where o.seq = m.seq and o.country is null;
