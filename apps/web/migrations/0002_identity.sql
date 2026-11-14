-- People, one-time sign-in links and sessions. Only hashes of secrets are stored.
create table users (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  created_at timestamptz not null default now()
);

create table login_tokens (
  token_hash text primary key,
  email citext not null,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);
create index login_tokens_email_idx on login_tokens (email, created_at);
create index login_tokens_ip_idx on login_tokens (ip_hash, created_at);

create table sessions (
  token_hash text primary key,
  user_id uuid not null references users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index sessions_user_idx on sessions (user_id);
