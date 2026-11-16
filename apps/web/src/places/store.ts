import { getPool } from "@/db/pool";

export interface Place {
  id: string;
  name: string;
  country: string;
}

export interface Light extends Place {
  lat: number;
  lon: number;
  spaces: number;
}

const label = (place: Place) => `${place.name}, ${place.country}`;
export { label as placeLabel };

/** Settlements whose name starts with the query, biggest first. */
export async function searchPlaces(query: string): Promise<Place[]> {
  const q = query
    .trim()
    .toLowerCase()
    .replace(/[%_\\]/g, "");
  if (q.length < 2) return [];
  const { rows } = await getPool().query<Place>(
    // Places where people already are come first: "Beau" should find Beaulieu-sur-Mer, where
    // someone lives, before Beauvais, which is bigger.
    `select p.id::text, p.name, p.country from places p
     where lower(p.ascii) like $1 or lower(p.name) like $1
     order by (exists (select 1 from spaces s where s.place_id = p.id and s.hidden_at is null)
               or exists (select 1 from communities c where c.place_id = p.id and c.hidden_at is null)) desc,
              p.population desc, p.name
     limit 8`,
    [`${q}%`],
  );
  return rows;
}

export async function findPlace(
  id: string,
): Promise<(Place & { lat: number; lon: number }) | undefined> {
  if (!/^\d{1,12}$/.test(id)) return undefined;
  const { rows } = await getPool().query<Place & { lat: number; lon: number }>(
    "select id::text, name, country, lat, lon from places where id = $1",
    [id],
  );
  return rows[0];
}

/** Every settlement that has at least one space: the lights of the map. */
export async function lights(): Promise<Light[]> {
  const { rows } = await getPool().query<Light>(
    `select p.id::text, p.name, p.country, p.lat, p.lon, count(*)::int as spaces
     from spaces s join places p on p.id = s.place_id
     where s.hidden_at is null
     group by p.id
     order by spaces desc, p.name`,
  );
  return rows;
}

export async function spacesAt(placeId: string): Promise<{ handle: string; name: string }[]> {
  const { rows } = await getPool().query<{ handle: string; name: string }>(
    "select handle, name from spaces where place_id = $1 and hidden_at is null order by name",
    [placeId],
  );
  return rows;
}
