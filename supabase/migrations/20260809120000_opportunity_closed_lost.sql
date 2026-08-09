-- "Cerrada perdida": estado terminal, fuera del embudo. No es un paso más del
-- camino (lead → … → cliente), es la salida. Cuando una oportunidad se pierde
-- hay que decir por qué: el motivo se guarda como código (lost_reason) más una
-- nota libre opcional (lost_notes).
alter table public.opportunities
  drop constraint if exists opportunities_stage_check;

alter table public.opportunities
  add constraint opportunities_stage_check
    check (stage in ('lead', 'meeting_scheduled', 'pilot', 'tenant_creation', 'client', 'closed_lost'));

alter table public.opportunities
  add column lost_reason text
    check (lost_reason in ('price', 'no_budget', 'competitor', 'no_response', 'timing', 'no_fit', 'other')),
  add column lost_notes text,
  add column closed_lost_at timestamptz;

-- El motivo y la etapa van juntos: si está perdida hay motivo, y si hay motivo
-- está perdida. Reabrir una oportunidad limpia el motivo (lo hace la API).
-- Nombre propio: `opportunities_lost_reason_check` ya lo toma el check en línea
-- de la columna de arriba.
alter table public.opportunities
  add constraint opportunities_lost_reason_stage_check
    check ((stage = 'closed_lost') = (lost_reason is not null));
