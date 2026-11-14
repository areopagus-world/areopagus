-- A space is a person's page in the network. One per person for now.
create table spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users (id) on delete cascade,
  handle citext not null unique,
  name text not null,
  about text not null default '',
  place text not null default '',
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
