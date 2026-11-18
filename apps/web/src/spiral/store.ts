import { getPool } from "@/db/pool";
import type { Level } from "@/snapshots/rules";
import type { SpiralInput } from "./rules";

export interface SpiralLevel {
  level: Level;
  /** The owner's own name for the level, or null for the spiral's name. */
  title: string | null;
  /** How many entries the owner filed under the level and the reader may see. */
  count: number;
}

export interface Spiral {
  public: boolean;
  levels: SpiralLevel[];
}

/**
 * A capsule's spiral. The owner sees every entry they filed, private ones included; anyone else
 * sees only public, unhidden entries, and only when the owner shows the spiral. Nothing is
 * computed about the person: these are counts of their own entries under their own levels.
 */
export async function spiralOf(
  space: { handle: string } | { userId: string },
  reader: "owner" | "public",
): Promise<Spiral | undefined> {
  const byOwner = "userId" in space;
  const { rows } = await getPool().query<{
    public: boolean;
    level: Level;
    title: string | null;
    count: number;
  }>(
    `select s.spiral_public as public, l.level::smallint as level, t.title,
            count(e.id)::int as count
     from spaces s
     cross join generate_series(1, 8) as l(level)
     left join spiral_titles t on t.space_id = s.id and t.level = l.level
     left join events e on e.space_id = s.id and e.level = l.level
       and ($2 or (e.visibility = 'public' and e.hidden_at is null))
     where ${byOwner ? "s.user_id = $1" : "s.handle = $1 and s.hidden_at is null"}
     group by s.spiral_public, l.level, t.title
     order by l.level`,
    [byOwner ? space.userId : space.handle, reader === "owner"],
  );
  const first = rows[0];
  if (!first) return undefined;
  if (reader === "public" && !first.public) return undefined;
  return {
    public: first.public,
    levels: rows.map(({ level, title, count }) => ({ level, title, count })),
  };
}

/** Saves the owner's names for the levels and whether others see the spiral. */
export async function saveSpiral(
  userId: string,
  input: SpiralInput,
): Promise<"saved" | "no-space"> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const { rows } = await client.query<{ id: string }>(
      "update spaces set spiral_public = $2, updated_at = now() where user_id = $1 returning id",
      [userId, input.public],
    );
    const space = rows[0];
    if (!space) {
      await client.query("rollback");
      return "no-space";
    }
    await client.query("delete from spiral_titles where space_id = $1", [space.id]);
    for (const [level, title] of input.titles) {
      await client.query("insert into spiral_titles (space_id, level, title) values ($1, $2, $3)", [
        space.id,
        level,
        title,
      ]);
    }
    await client.query("commit");
    return "saved";
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
