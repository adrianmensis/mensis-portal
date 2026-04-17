create type objective_category as enum ('sales', 'product', 'fundraising');
create type objective_status as enum ('not_started', 'in_progress', 'completed');

create table objectives (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  category    objective_category not null,
  status      objective_status not null default 'not_started',
  target_date date,
  progress    int default 0,
  sort_order  int default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table objectives enable row level security;

create policy "Authenticated users full access"
  on objectives for all to authenticated
  using (true) with check (true);

create trigger objectives_updated_at
  before update on objectives
  for each row execute function update_updated_at();

insert into objectives (name, description, category, status, target_date, sort_order) values
('600 Avatars', 'Alcanzar 600 avatares activos entre clientes y trials', 'sales', 'in_progress', '2026-12-31', 1),
('100 Partners', 'Construir red de 100 partners que revendan Mensis', 'sales', 'in_progress', '2026-12-31', 2),
('End-to-End Self-Service', 'Flujo completo: creación rápida de tenants, dashboard del cliente, Stripe para pagos, onboarding self-service para cualquier usuario', 'product', 'not_started', '2026-12-31', 1),
('Data Pipeline & AI', 'Limpieza y depuración de datos — optimizar pipeline, memory y agent. Crear proceso propio para data processing', 'product', 'not_started', '2026-12-31', 2),
('Client Iterations', 'Implementar iteraciones y feature requests que los clientes vayan pidiendo', 'product', 'in_progress', null, 3),
('Platform Analytics', 'Medir el uso de la plataforma para tomar decisiones — clicks, sesiones, engagement, métricas de adopción', 'product', 'not_started', '2026-12-31', 4),
('Knowledge Consumption Integrations', 'Integraciones para consumo del conocimiento — Claude AI, WhatsApp, Jira, Teams, Outlook (existentes), Slack', 'product', 'in_progress', '2026-12-31', 5),
('2+ Knowledge Sources', 'Incorporar al menos 2 fuentes de conocimiento adicionales a las llamadas', 'product', 'not_started', '2026-12-31', 6),
('Raise Capital', 'Levantar capital de inversión (VC) para acelerar crecimiento', 'fundraising', 'not_started', null, 1);
