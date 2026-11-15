-- Snapshots of reality: how a person sees one level of a place, on a scale from shortage (-100)
-- through balance (0) to excess (+100). A snapshot is about the place, not about the person: only
-- summaries are shown, and only once enough people have made one.
create table snapshots (
  id uuid primary key default gen_random_uuid(),
  place_id bigint not null references places (id),
  author_id uuid not null references users (id) on delete cascade,
  level smallint not null check (level between 1 and 8),
  -- "main" is the main axis of the level; named parameters under a level come later.
  parameter text not null default 'main',
  value smallint not null check (value between -100 and 100),
  -- Whether the author's space was tied to this place when the snapshot was made.
  resident boolean not null,
  created_at timestamptz not null default now()
);
create index snapshots_place_idx on snapshots (place_id, parameter, level, author_id, created_at desc);
create index snapshots_author_idx on snapshots (author_id, created_at);
