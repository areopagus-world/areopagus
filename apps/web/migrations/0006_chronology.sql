-- Chronology: what happened, when and where, and how events connect to each other.
create table events (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces (id) on delete cascade,
  happened_on date not null,
  title text not null,
  body text not null default '',
  place_id bigint references places (id),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  created_at timestamptz not null default now()
);
create index events_space_idx on events (space_id, happened_on desc, created_at desc);

-- Typed links between events. The first slice uses "continues"; the other kinds are in the model from day one.
create table event_links (
  from_event uuid not null references events (id) on delete cascade,
  to_event uuid not null references events (id) on delete cascade,
  kind text not null check (kind in ('continues', 'answers', 'caused', 'part_of')),
  created_at timestamptz not null default now(),
  primary key (from_event, to_event, kind),
  check (from_event <> to_event)
);
create index event_links_to_idx on event_links (to_event);
