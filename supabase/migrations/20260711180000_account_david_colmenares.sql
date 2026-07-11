-- Real account: David Colmenares (CEO, Allianz Colombia) under Aseguradoras.
insert into public.target_accounts
  (use_case_id, first_name, last_name, role, country, company, email, website, linkedin_url, phone, winning_message)
select id, 'David', 'Colmenares', 'CEO', 'CO', 'Allianz Colombia',
       'david.colmenares@allianz.co', null,
       'https://www.linkedin.com/in/davidcolmenares/', null,
       'Dar servicio y soporte a la fuerza comercial de agentes externos hoy exige contratar mucho personal. Con gemelos digitales que aprenden de tus ejecutivos reales, atiendes a todos los agentes a la vez: creces en ventas y liberas ~6 horas por ejecutivo cada semana.'
from public.use_cases where slug = 'aseguradoras';
