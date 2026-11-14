-- Settlements of Europe from GeoNames (CC BY 4.0). A space may point at one of them.
create table places (
  id bigint primary key,
  name text not null,
  ascii text not null,
  country char(2) not null,
  population integer not null default 0,
  lat double precision not null,
  lon double precision not null
);
create index places_ascii_idx on places (lower(ascii) text_pattern_ops);
create index places_name_idx on places (lower(name) text_pattern_ops);

alter table spaces add column place_id bigint references places (id);
create index spaces_place_idx on spaces (place_id);
