import { getPool } from "@/db/pool";

export interface Space {
  handle: string;
  name: string;
  about: string;
  place: string;
  skills: string[];
}

const COLUMNS = "handle, name, about, place, skills";

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
      `insert into spaces (user_id, handle, name, about, place, skills)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (user_id) do update
         set handle = excluded.handle, name = excluded.name, about = excluded.about,
             place = excluded.place, skills = excluded.skills, updated_at = now()`,
      [userId, space.handle, space.name, space.about, space.place, space.skills],
    );
    return "saved";
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return "taken";
    throw error;
  }
}
