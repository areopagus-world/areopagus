-- Reports from readers and the moderator's decisions. Hidden content stays in the database, out of public view.
alter table spaces add column hidden_at timestamptz, add column hidden_note text;
alter table communities add column hidden_at timestamptz, add column hidden_note text;
alter table events add column hidden_at timestamptz, add column hidden_note text;

create table reports (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('space', 'community', 'event')),
  target_id uuid not null,
  label text not null,
  path text not null,
  reason text not null check (reason in ('illegal', 'harassment', 'scam', 'impersonation', 'private', 'other')),
  details text not null,
  reporter_id uuid references users (id) on delete set null,
  contact text not null default '',
  ip_hash text not null,
  status text not null default 'open' check (status in ('open', 'kept', 'hidden', 'restored')),
  note text not null default '',
  decided_by uuid references users (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index reports_status_idx on reports (status, created_at desc);
create index reports_ip_idx on reports (ip_hash, created_at);
