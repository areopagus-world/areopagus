-- Communities: a shared page with members and a chronology of its own.
create table communities (
  id uuid primary key default gen_random_uuid(),
  handle citext not null unique,
  name text not null,
  about text not null default '',
  place text not null default '',
  place_id bigint references places (id),
  founder_id uuid not null references users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index communities_place_idx on communities (place_id);

create table community_members (
  community_id uuid not null references communities (id) on delete cascade,
  user_id uuid not null references users (id) on delete cascade,
  role text not null default 'member' check (role in ('founder', 'member')),
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);
create index community_members_user_idx on community_members (user_id);

-- Spaces and communities share one address space: areopagus.world/<handle>.
create function handle_is_free() returns trigger language plpgsql as $$
begin
  perform pg_advisory_xact_lock(hashtext(lower(new.handle::text)));
  if tg_table_name = 'spaces' and exists (select 1 from communities where handle = new.handle) then
    raise exception 'handle taken by a community' using errcode = '23505';
  end if;
  if tg_table_name = 'communities' and exists (select 1 from spaces where handle = new.handle) then
    raise exception 'handle taken by a space' using errcode = '23505';
  end if;
  return new;
end $$;
create trigger spaces_handle_free before insert or update of handle on spaces
  for each row execute function handle_is_free();
create trigger communities_handle_free before insert or update of handle on communities
  for each row execute function handle_is_free();

-- An event belongs either to a space or to a community, and remembers who wrote it.
alter table events alter column space_id drop not null;
alter table events add column community_id uuid references communities (id) on delete cascade;
alter table events add column author_id uuid references users (id) on delete set null;
update events e set author_id = s.user_id from spaces s where s.id = e.space_id;
alter table events add constraint events_one_owner check ((space_id is null) <> (community_id is null));
create index events_community_idx on events (community_id, happened_on desc, created_at desc);
