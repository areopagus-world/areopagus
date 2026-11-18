-- A person's own spiral: the eight levels of the Earth balance as the skeleton of their capsule.
-- The person files each entry under a level, may name the levels in their own words and decides
-- whether anyone else sees the spiral. Nothing about the person is computed here (ADR 0010).
alter table spaces add column spiral_public boolean not null default false;

create table spiral_titles (
  space_id uuid not null references spaces (id) on delete cascade,
  level smallint not null check (level between 1 and 8),
  title text not null check (char_length(title) between 1 and 40),
  primary key (space_id, level)
);
