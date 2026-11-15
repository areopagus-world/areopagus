-- A deed in a chronology can name the level of need it serves (1 Footing ... 8 The whole).
-- The level belongs to the deed, never to a person: there is no per-person summary of levels.
alter table events add column level smallint check (level between 1 and 8);
create index events_place_level_idx on events (place_id, level, happened_on desc)
  where level is not null;
