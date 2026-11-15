import { getPool } from "@/db/pool";
import { MAX_EVENTS, type EventInput } from "@/chronology/rules";
import type { TimelineEvent } from "@/chronology/store";

export const MAX_FOUNDED = 5;

export interface Community {
  id: string;
  handle: string;
  name: string;
  about: string;
  place: string;
  placeId: string | null;
  founderId: string;
}

export interface CommunityInput {
  handle: string;
  name: string;
  about: string;
  place: string;
  placeId: string | null;
}

export interface CommunityCard {
  handle: string;
  name: string;
  place: string;
  members: number;
}

export interface Member {
  handle: string;
  name: string;
  role: "founder" | "member";
}

const COLUMNS =
  'id, handle, name, about, place, place_id::text as "placeId", founder_id as "founderId"';
const CARD = `c.handle, c.name, c.place,
  (select count(*)::int from community_members m where m.community_id = c.id) as members`;

export async function findCommunity(handle: string): Promise<Community | undefined> {
  const { rows } = await getPool().query<Community>(
    `select ${COLUMNS} from communities where handle = $1 and hidden_at is null`,
    [handle],
  );
  return rows[0];
}

/**
 * Starts a community with the person as its founder and first member.
 * The person needs a space: members are shown by their spaces.
 */
export async function createCommunity(
  userId: string,
  input: CommunityInput,
): Promise<"created" | "taken" | "no-space" | "limit"> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const state = await client.query<{ space: boolean; founded: number }>(
      `select exists (select 1 from spaces where user_id = $1) as space,
              (select count(*)::int from communities where founder_id = $1) as founded`,
      [userId],
    );
    const { space, founded } = state.rows[0] ?? { space: false, founded: 0 };
    if (!space || founded >= MAX_FOUNDED) {
      await client.query("rollback");
      return space ? "limit" : "no-space";
    }
    const created = await client.query<{ id: string }>(
      `insert into communities (handle, name, about, place, place_id, founder_id)
       values ($1, $2, $3, $4, $5, $6) returning id`,
      [input.handle, input.name, input.about, input.place, input.placeId, userId],
    );
    await client.query(
      "insert into community_members (community_id, user_id, role) values ($1, $2, 'founder')",
      [created.rows[0]?.id, userId],
    );
    await client.query("commit");
    return "created";
  } catch (error) {
    await client.query("rollback");
    if ((error as { code?: string }).code === "23505") return "taken";
    throw error;
  } finally {
    client.release();
  }
}

/** Joins a community. Only people with a space can join. Joining twice changes nothing. */
export async function joinCommunity(userId: string, communityId: string): Promise<void> {
  await getPool().query(
    `insert into community_members (community_id, user_id)
     select $2, $1 where exists (select 1 from spaces where user_id = $1)
     on conflict do nothing`,
    [userId, communityId],
  );
}

/** Leaves a community. The founder stays: a community is never left without one. */
export async function leaveCommunity(userId: string, communityId: string): Promise<void> {
  await getPool().query(
    "delete from community_members where community_id = $2 and user_id = $1 and role <> 'founder'",
    [userId, communityId],
  );
}

export async function roleIn(
  userId: string,
  communityId: string,
): Promise<Member["role"] | undefined> {
  const { rows } = await getPool().query<{ role: Member["role"] }>(
    "select role from community_members where community_id = $2 and user_id = $1",
    [userId, communityId],
  );
  return rows[0]?.role;
}

export async function membersOf(communityId: string): Promise<Member[]> {
  const { rows } = await getPool().query<Member>(
    `select s.handle, s.name, m.role
     from community_members m join spaces s on s.user_id = m.user_id
     where m.community_id = $1 and s.hidden_at is null
     order by (m.role = 'founder') desc, m.joined_at
     limit 500`,
    [communityId],
  );
  return rows;
}

export async function listCommunities(): Promise<CommunityCard[]> {
  const { rows } = await getPool().query<CommunityCard>(
    `select ${CARD} from communities c where c.hidden_at is null order by members desc, c.created_at limit 200`,
  );
  return rows;
}

export async function communitiesOf(userId: string): Promise<CommunityCard[]> {
  const { rows } = await getPool().query<CommunityCard>(
    `select ${CARD} from communities c
     join community_members mine on mine.community_id = c.id and mine.user_id = $1
     where c.hidden_at is null
     order by mine.joined_at`,
    [userId],
  );
  return rows;
}

/** Communities of the person behind a space, for the space's public page. */
export async function communitiesOfSpace(handle: string): Promise<CommunityCard[]> {
  const { rows } = await getPool().query<CommunityCard>(
    `select ${CARD} from communities c
     join community_members mine on mine.community_id = c.id
     join spaces s on s.user_id = mine.user_id and s.handle = $1
     where c.hidden_at is null
     order by mine.joined_at`,
    [handle],
  );
  return rows;
}

export async function communitiesAt(placeId: string): Promise<CommunityCard[]> {
  const { rows } = await getPool().query<CommunityCard>(
    `select ${CARD} from communities c where c.place_id = $1 and c.hidden_at is null order by c.name`,
    [placeId],
  );
  return rows;
}

/** The community's chronology, each event with the member who wrote it. */
export async function communityTimeline(communityId: string): Promise<TimelineEvent[]> {
  const { rows } = await getPool().query<TimelineEvent>(
    `select e.id, to_char(e.happened_on, 'YYYY-MM-DD') as "happenedOn", e.title, e.body, e.visibility,
            e.level, null as continues, e.author_id as "authorId",
            case when s.handle is null then null
                 else json_build_object('handle', s.handle, 'name', s.name) end as author
     from events e left join spaces s on s.user_id = e.author_id and s.hidden_at is null
     where e.community_id = $1 and e.hidden_at is null
     order by e.happened_on desc, e.created_at desc
     limit $2`,
    [communityId, MAX_EVENTS],
  );
  return rows;
}

/** A member adds an event to the community's chronology. */
export async function addCommunityEvent(
  userId: string,
  community: Community,
  event: EventInput,
): Promise<"added" | "not-member" | "full"> {
  const { rows } = await getPool().query<{ member: boolean; n: number }>(
    `select exists (select 1 from community_members where community_id = $1 and user_id = $2) as member,
            (select count(*)::int from events where community_id = $1) as n`,
    [community.id, userId],
  );
  const state = rows[0];
  if (!state?.member) return "not-member";
  if (state.n >= MAX_EVENTS) return "full";
  await getPool().query(
    `insert into events (community_id, author_id, happened_on, title, body, place_id, visibility, level)
     values ($1, $2, $3, $4, $5, $6, 'public', $7)`,
    [
      community.id,
      userId,
      event.happenedOn,
      event.title,
      event.body,
      community.placeId,
      event.level,
    ],
  );
  return "added";
}

/** The author removes their own event; the founder may remove any event of the community. */
export async function removeCommunityEvent(
  userId: string,
  communityId: string,
  eventId: string,
): Promise<void> {
  await getPool().query(
    `delete from events e using communities c
     where e.id = $3 and e.community_id = $2 and c.id = e.community_id
       and (e.author_id = $1 or c.founder_id = $1)`,
    [userId, communityId, eventId],
  );
}
