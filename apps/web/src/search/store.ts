import { getPool } from "@/db/pool";
import type { CommunityCard } from "@/communities/store";
import { likePattern } from "./rules";

export interface PersonHit {
  handle: string;
  name: string;
  place: string;
  /** Skills of the person that match the phrase, or their first skills when the match was elsewhere. */
  skills: string[];
}

/**
 * People by skill, name or what they wrote about themselves, optionally in one settlement.
 * A match on a skill comes first. Plain SQL is enough at this size; a search engine comes later.
 */
export async function searchPeople(
  query: string | undefined,
  placeId: string | undefined,
): Promise<PersonHit[]> {
  if (!query && !placeId) return [];
  const pattern = query ? likePattern(query) : null;
  const { rows } = await getPool().query<PersonHit>(
    `select s.handle, s.name, s.place,
            coalesce(
              (select array_agg(k) from unnest(s.skills) k where $1::text is not null and lower(k) like $1),
              s.skills[1:3]
            ) as skills
     from spaces s
     where s.hidden_at is null and ($2::bigint is null or s.place_id = $2)
       and ($1::text is null
            or exists (select 1 from unnest(s.skills) k where lower(k) like $1)
            or lower(s.name) like $1
            or lower(s.about) like $1)
     order by ($1::text is not null and exists (select 1 from unnest(s.skills) k where lower(k) like $1)) desc,
              s.name
     limit 50`,
    [pattern, placeId ?? null],
  );
  return rows;
}

export async function searchCommunities(
  query: string | undefined,
  placeId: string | undefined,
): Promise<CommunityCard[]> {
  if (!query && !placeId) return [];
  const pattern = query ? likePattern(query) : null;
  const { rows } = await getPool().query<CommunityCard>(
    `select c.handle, c.name, c.place,
            (select count(*)::int from community_members m where m.community_id = c.id) as members
     from communities c
     where c.hidden_at is null and ($2::bigint is null or c.place_id = $2)
       and ($1::text is null or lower(c.name) like $1 or lower(c.about) like $1)
     order by members desc, c.name
     limit 30`,
    [pattern, placeId ?? null],
  );
  return rows;
}
