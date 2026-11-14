import { getPool } from "@/db/pool";
import { MAX_EVENTS, type EventInput } from "./rules";

export interface TimelineEvent {
  id: string;
  happenedOn: string;
  title: string;
  body: string;
  visibility: "public" | "private";
  /** The earlier event this one continues, when it is visible to the reader. */
  continues: { id: string; title: string } | null;
  /** Set on community events: who wrote it. */
  /** Set on the owner's own view when a moderator has hidden the event. */
  hidden?: boolean;
  hiddenNote?: string | null;
  authorId?: string | null;
  author?: { handle: string; name: string } | null;
}

const SELECT = `
  select e.id, to_char(e.happened_on, 'YYYY-MM-DD') as "happenedOn", e.title, e.body, e.visibility,
         e.hidden_note as "hiddenNote", (e.hidden_at is not null) as hidden,
         case when p.id is null then null else json_build_object('id', p.id, 'title', p.title) end as continues
  from events e
  join spaces s on s.id = e.space_id
  left join event_links l on l.from_event = e.id and l.kind = 'continues'
  left join events p on p.id = l.to_event`;
const ORDER = "order by e.happened_on desc, e.created_at desc";

/** What anyone may see on a space's page. A link to a private event is not shown. */
export async function publicTimeline(handle: string): Promise<TimelineEvent[]> {
  const { rows } = await getPool().query<TimelineEvent>(
    `${SELECT} and p.visibility = 'public'
     where s.handle = $1 and e.visibility = 'public' and e.hidden_at is null ${ORDER} limit $2`,
    [handle, MAX_EVENTS],
  );
  return rows;
}

/** Everything the owner wrote, private events included. */
export async function ownTimeline(userId: string): Promise<TimelineEvent[]> {
  const { rows } = await getPool().query<TimelineEvent>(
    `${SELECT} where s.user_id = $1 ${ORDER} limit $2`,
    [userId, MAX_EVENTS],
  );
  return rows;
}

/**
 * Adds an event to the person's chronology. `continuesId` must be one of their own events.
 * Returns "no-space" when the person has no space yet and "full" at the limit.
 */
export async function addEvent(
  userId: string,
  event: EventInput,
  continuesId: string | undefined,
): Promise<"added" | "no-space" | "full"> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const space = await client.query<{ id: string; place_id: string | null; n: number }>(
      `select s.id, s.place_id::text, (select count(*)::int from events where space_id = s.id) as n
       from spaces s where s.user_id = $1 for update`,
      [userId],
    );
    const own = space.rows[0];
    if (!own || own.n >= MAX_EVENTS) {
      await client.query("rollback");
      return own ? "full" : "no-space";
    }
    const created = await client.query<{ id: string }>(
      `insert into events (space_id, author_id, happened_on, title, body, place_id, visibility)
       values ($1, $2, $3, $4, $5, $6, $7) returning id`,
      [own.id, userId, event.happenedOn, event.title, event.body, own.place_id, event.visibility],
    );
    if (continuesId) {
      await client.query(
        `insert into event_links (from_event, to_event, kind)
         select $1, id, 'continues' from events where id = $2 and space_id = $3`,
        [created.rows[0]?.id, continuesId, own.id],
      );
    }
    await client.query("commit");
    return "added";
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

/** Removes one of the person's own events. Someone else's id changes nothing. */
export async function removeEvent(userId: string, id: string): Promise<void> {
  await getPool().query(
    "delete from events e using spaces s where s.id = e.space_id and s.user_id = $1 and e.id = $2",
    [userId, id],
  );
}
