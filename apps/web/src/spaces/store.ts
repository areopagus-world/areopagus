import { getPool } from "@/db/pool";

export interface Space {
  handle: string;
  name: string;
  about: string;
  place: string;
  skills: string[];
  /** Settlement the space is tied to, if the place was picked from the list. */
  placeId: string | null;
}

const COLUMNS = 'handle, name, about, place, skills, place_id::text as "placeId"';

export async function findSpaceByHandle(handle: string): Promise<Space | undefined> {
  const { rows } = await getPool().query<Space>(`select ${COLUMNS} from spaces where handle = $1`, [
    handle,
  ]);
  return rows[0];
}

export async function findSpaceByUser(userId: string): Promise<Space | undefined> {
  const { rows } = await getPool().query<Space>(
    `select ${COLUMNS} from spaces where user_id = $1`,
    [userId],
  );
  return rows[0];
}

/** Creates or updates the person's space. Returns "taken" when another person already has the handle. */
export async function saveSpace(userId: string, space: Space): Promise<"saved" | "taken"> {
  try {
    await getPool().query(
      `insert into spaces (user_id, handle, name, about, place, skills, place_id)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (user_id) do update
         set handle = excluded.handle, name = excluded.name, about = excluded.about,
             place = excluded.place, skills = excluded.skills, place_id = excluded.place_id,
             updated_at = now()`,
      [userId, space.handle, space.name, space.about, space.place, space.skills, space.placeId],
    );
    return "saved";
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return "taken";
    throw error;
  }
}
