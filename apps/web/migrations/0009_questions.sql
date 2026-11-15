-- Questions to a person, to a place or to everyone, their answers, and the asker's thanks.
create table questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references users (id) on delete cascade,
  to_space_id uuid references spaces (id) on delete cascade,
  place_id bigint references places (id),
  skill text not null default '',
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  hidden_at timestamptz,
  hidden_note text,
  check (to_space_id is null or place_id is null)
);
create index questions_recent_idx on questions (created_at desc);
create index questions_space_idx on questions (to_space_id, created_at desc);
create index questions_place_idx on questions (place_id, created_at desc);
create index questions_author_idx on questions (author_id, created_at);

create table answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions (id) on delete cascade,
  author_id uuid not null references users (id) on delete cascade,
  body text not null,
  thanked_at timestamptz,
  created_at timestamptz not null default now(),
  hidden_at timestamptz,
  hidden_note text
);
create index answers_question_idx on answers (question_id, created_at);
create index answers_author_idx on answers (author_id, created_at);

alter table reports drop constraint reports_kind_check;
alter table reports add constraint reports_kind_check
  check (kind in ('space', 'community', 'event', 'question', 'answer'));
