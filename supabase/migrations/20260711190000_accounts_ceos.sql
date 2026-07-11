-- More insurer CEOs under Aseguradoras. Patricia Restrepo's company/role were
-- inferred from her email domain (asulado.com.co) + the list context.
with uc as (
  select id from public.use_cases where slug = 'aseguradoras'
)
insert into public.target_accounts
  (use_case_id, first_name, last_name, role, country, company, email, linkedin_url, winning_message)
select uc.id, v.first_name, v.last_name, v.role, 'CO', v.company, v.email, v.linkedin_url,
  'Dar servicio y soporte a la fuerza comercial de agentes externos hoy exige contratar mucho personal. Con gemelos digitales que aprenden de tus ejecutivos reales, atiendes a todos los agentes a la vez: creces en ventas y liberas ~6 horas por ejecutivo cada semana.'
from uc cross join (values
  ('Luiz',           'Campos',             'CEO', 'HDI Seguros Colombia', 'luiz.minarellicampos@hdiseguros.com.co', 'https://www.linkedin.com/in/luizfmcampos/'),
  ('Carlos Eduardo', 'Luna',               'CEO', 'Seguros Confianza',    'cluna@confianza.com.co',                 'https://www.linkedin.com/in/carlos-eduardo-luna-597aa841/'),
  ('Patricia',       'Restrepo Gutiérrez', 'CEO', 'Asulado',              'prestrepo@asulado.com.co',               'https://www.linkedin.com/in/patriciarestrepogutierrez/')
) as v(first_name, last_name, role, company, email, linkedin_url);
