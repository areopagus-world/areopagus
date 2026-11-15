import { getPool } from "@/db/pool";
import {
  LEVELS,
  MAX_SNAPSHOTS_PER_DAY,
  REPLACE_DAYS,
  summarize,
  type Level,
  type Reading,
  type Summary,
} from "./rules";

export interface LevelView {
  level: Level;
  residents: Summary | { count: number };
  visitors: Summary | { count: number };
}

/**
 * The summaries of a place, level by level, for its people and for the view from outside.
 * Each person counts once per level, with their latest snapshot. People whose space a moderator
 * has hidden do not count.
 */
export async function placeSnapshots(placeId: string): Promise<LevelView[]> {
  const { rows } = await getPool().query<{
    level: number;
    value: number;
    resident: boolean;
    ageDays: number;
  }>(
    `select level, value, resident, "ageDays" from (
       select distinct on (n.author_id, n.level) n.level, n.value, n.resident,
              extract(epoch from now() - n.created_at) / 86400 as "ageDays"
       from snapshots n
       join spaces s on s.user_id = n.author_id and s.hidden_at is null
       where n.place_id = $1 and n.parameter = 'main'
       order by n.author_id, n.level, n.created_at desc
     ) latest`,
    [placeId],
  );
  return LEVELS.map((level) => {
    const of = (resident: boolean): Reading[] =>
      rows
        .filter((r) => r.level === level && r.resident === resident)
        .map((r) => ({ value: r.value, ageDays: Number(r.ageDays) }));
    return { level, residents: summarize(of(true)), visitors: summarize(of(false)) };
  });
}

/** The person's own latest snapshot of each level of a place. Only they see it. */
export async function ownSnapshots(
  userId: string,
  placeId: string,
): Promise<Map<Level, { value: number; day: string }>> {
  const { rows } = await getPool().query<{ level: Level; value: number; day: string }>(
    `select distinct on (level) level, value, to_char(created_at, 'YYYY-MM-DD') as day
     from snapshots
     where author_id = $1 and place_id = $2 and parameter = 'main'
     order by level, created_at desc`,
    [userId, placeId],
  );
  return new Map(rows.map((r) => [r.level, { value: r.value, day: r.day }]));
}

/**
 * Records how the person sees one level of a place. A newer snapshot within REPLACE_DAYS replaces
 * the older one, so each person keeps one current view per level.
 */
export async function saveSnapshot(
  userId: string,
  placeId: string,
  level: Level,
  value: number,
): Promise<"saved" | "no-space" | "no-target" | "limit"> {
  const pool = getPool();
  const { rows } = await pool.query<{
    space: boolean;
    homeId: string | null;
    place: boolean;
    today: number;
  }>(
    `select exists (select 1 from spaces where user_id = $1 and hidden_at is null) as space,
            (select place_id::text from spaces where user_id = $1) as "homeId",
            exists (select 1 from places where id = $2) as place,
            (select count(*)::int from snapshots
             where author_id = $1 and created_at > now() - interval '1 day') as today`,
    [userId, placeId],
  );
  const state = rows[0];
  if (!state?.space) return "no-space";
  if (!state.place) return "no-target";
  if (state.today >= MAX_SNAPSHOTS_PER_DAY) return "limit";
  const resident = state.homeId === placeId;
  await pool.query(
    `with recent as (
       select id from snapshots
       where author_id = $1 and place_id = $2 and level = $3 and parameter = 'main'
         and created_at > now() - make_interval(days => $6)
       order by created_at desc limit 1
     ), updated as (
       update snapshots s set value = $4, resident = $5, created_at = now()
       from recent where s.id = recent.id
       returning s.id
     )
     insert into snapshots (author_id, place_id, level, parameter, value, resident)
     select $1, $2, $3, 'main', $4, $5
     where not exists (select 1 from updated)`,
    [userId, placeId, level, value, resident, REPLACE_DAYS],
  );
  return "saved";
}
