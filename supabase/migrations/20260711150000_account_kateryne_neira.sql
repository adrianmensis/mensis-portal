-- Real account: Kateryne Neira (Seguros Bolívar) under Aseguradoras. The winning
-- message is the shared angle for every insurer in this vertical.
insert into public.target_accounts
  (use_case_id, first_name, last_name, role, country, company, email, website, linkedin_url, phone, winning_message)
select id, 'Kateryne', 'Neira', null, 'CO', 'Seguros Bolívar S.A',
       'kateryne.neira@segurosbolivar.com', null,
       'https://www.linkedin.com/in/julian-said-lozano-perez-a3293a4a', '+57 1 800 0123322',
       'Dar servicio y soporte a la fuerza comercial de agentes externos hoy exige contratar mucho personal. Con gemelos digitales que aprenden de tus ejecutivos reales, atiendes a todos los agentes a la vez: creces en ventas y liberas ~6 horas por ejecutivo cada semana.'
from public.use_cases where slug = 'aseguradoras';
