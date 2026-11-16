/** Countries whose settlements are loaded. Russia is cut at the Urals by longitude. */
export const EUROPE = new Set([
  "AD",
  "AL",
  "AT",
  "AX",
  "BA",
  "BE",
  "BG",
  "BY",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FO",
  "FR",
  "GB",
  "GG",
  "GI",
  "GR",
  "HR",
  "HU",
  "IE",
  "IM",
  "IS",
  "IT",
  "JE",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MD",
  "ME",
  "MK",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "RS",
  "RU",
  "SE",
  "SI",
  "SK",
  "SM",
  "UA",
  "VA",
  "XK",
]);

export interface PlaceRow {
  id: number;
  name: string;
  ascii: string;
  country: string;
  population: number;
  lat: number;
  lon: number;
}

/**
 * Reads one line of a GeoNames dump (tab-separated, see geonames.org/export/dump/readme.txt).
 * Returns undefined for lines that are not a European settlement.
 */
export function parseGeoNamesLine(line: string): PlaceRow | undefined {
  const f = line.split("\t");
  if (f.length < 15) return undefined;
  const id = Number(f[0]);
  const lat = Number(f[4]);
  const lon = Number(f[5]);
  const country = f[8] ?? "";
  if (!Number.isInteger(id) || !Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;
  if (f[6] !== "P" || !EUROPE.has(country)) return undefined;
  if (country === "RU" && lon > 60) return undefined;
  const name = f[1] ?? "";
  if (!name) return undefined;
  return { id, name, ascii: f[2] || name, country, population: Number(f[14]) || 0, lat, lon };
}

// The map frame: longitude -25..45, latitude 34..72, Mercator.
const WEST = -25;
const EAST = 45;
const SOUTH = 34;
const NORTH = 72;
export const MAP_WIDTH = 1000;
const mercator = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const SCALE = MAP_WIDTH / (((EAST - WEST) * Math.PI) / 180);
export const MAP_HEIGHT = Math.round((mercator(NORTH) - mercator(SOUTH)) * SCALE);

/** Position of a point on the map, in viewBox units. */
export function project(lon: number, lat: number): [number, number] {
  const x = (((lon - WEST) * Math.PI) / 180) * SCALE;
  const y = (mercator(NORTH) - mercator(Math.max(-85, Math.min(85, lat)))) * SCALE;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

/** The longitude and latitude of a point of the map, the inverse of project. */
export function unproject(x: number, y: number): [number, number] {
  const lon = WEST + ((x / SCALE) * 180) / Math.PI;
  const m = mercator(NORTH) - y / SCALE;
  const lat = ((2 * Math.atan(Math.exp(m)) - Math.PI / 2) * 180) / Math.PI;
  return [lon, lat];
}

export function onMap(lon: number, lat: number): boolean {
  return lon >= WEST && lon <= EAST && lat >= SOUTH && lat <= NORTH;
}
