-- Human-friendly consecutive partner code (PART-0001, PART-0002, …), mirroring
-- the opportunities `seq`. `seq` is the raw monotonic number; the UI formats it
-- as "PART-####". Adding an identity column backfills existing rows automatically.
alter table public.profiles
  add column seq bigint generated always as identity;

create unique index profiles_seq_key on public.profiles(seq);
