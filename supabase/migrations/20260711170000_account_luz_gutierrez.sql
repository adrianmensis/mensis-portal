-- Real account: Luz Gutiérrez Dueñas (Seguros Bolívar) under Aseguradoras.
insert into public.target_accounts
  (use_case_id, first_name, last_name, role, country, company, email, website, linkedin_url, phone, winning_message)
select id, 'Luz', 'Gutiérrez Dueñas', null, 'CO', 'Seguros Bolívar S.A',
       'luz.gutierrez@segurosbolivar.com', null,
       'https://www.linkedin.com/in/luz-ang%C3%A9lica-gutierrez-due%C3%B1as-67a020158/', null,
       'Dar servicio y soporte a la fuerza comercial de agentes externos hoy exige contratar mucho personal. Con gemelos digitales que aprenden de tus ejecutivos reales, atiendes a todos los agentes a la vez: creces en ventas y liberas ~6 horas por ejecutivo cada semana.'
from public.use_cases where slug = 'aseguradoras';
