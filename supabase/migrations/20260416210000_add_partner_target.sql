alter table goals add column target_partners int not null default 0;
alter table goals add column current_partners int not null default 0;

update goals set target_partners = 100 where month = '2026-12-01';
