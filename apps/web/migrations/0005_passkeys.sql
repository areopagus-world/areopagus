-- Passkeys (WebAuthn credentials) and the short-lived challenges of their ceremonies.
create table passkeys (
  id text primary key,
  user_id uuid not null references users (id) on delete cascade,
  public_key bytea not null,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  device_type text not null,
  backed_up boolean not null default false,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index passkeys_user_idx on passkeys (user_id);

create table webauthn_challenges (
  id_hash text primary key,
  challenge text not null,
  user_id uuid references users (id) on delete cascade,
  expires_at timestamptz not null
);
