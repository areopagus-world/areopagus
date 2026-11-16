import { MAP_HEIGHT, MAP_WIDTH, project, unproject } from "./europe";

/** The part of the map on screen: its centre in map units and how many times it is magnified. */
export interface View {
  cx: number;
  cy: number;
  z: number;
}

export const MIN_ZOOM = 1;
/** At 64 the screen shows about 80 km of coast: Nice and Beaulieu-sur-Mer are apart. */
export const MAX_ZOOM = 64;
/** From this zoom the land is drawn from the detailed coastline in tiles. */
export const FINE_ZOOM = 6;
export const TILE_COLS = 16;
export const TILE = MAP_WIDTH / TILE_COLS;
export const TILE_ROWS = Math.ceil(MAP_HEIGHT / TILE);
/** Tiles overlap by this much so no hairline shows where two of them meet. */
export const TILE_MARGIN = 0.5;

export const FULL_VIEW: View = { cx: MAP_WIDTH / 2, cy: MAP_HEIGHT / 2, z: 1 };

const between = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** Keeps the zoom in range and the view inside the map, so the screen never shows empty space. */
export function clampView(view: View): View {
  const z = between(Number.isFinite(view.z) ? view.z : 1, MIN_ZOOM, MAX_ZOOM);
  const w = MAP_WIDTH / z;
  const h = MAP_HEIGHT / z;
  const cx = between(Number.isFinite(view.cx) ? view.cx : FULL_VIEW.cx, w / 2, MAP_WIDTH - w / 2);
  const cy = between(Number.isFinite(view.cy) ? view.cy : FULL_VIEW.cy, h / 2, MAP_HEIGHT - h / 2);
  return { cx, cy, z };
}

/** The SVG viewBox of a view: x, y, width, height in map units. */
export function viewBox(view: View): [number, number, number, number] {
  const w = MAP_WIDTH / view.z;
  const h = MAP_HEIGHT / view.z;
  return [view.cx - w / 2, view.cy - h / 2, w, h];
}

/**
 * Magnifies the view by a factor, keeping the point under the cursor (fx, fy) where it is.
 * Without a point the centre stays.
 */
export function zoomAt(view: View, factor: number, fx = view.cx, fy = view.cy): View {
  const z = between(view.z * factor, MIN_ZOOM, MAX_ZOOM);
  const kept = view.z / z;
  return clampView({ cx: fx - (fx - view.cx) * kept, cy: fy - (fy - view.cy) * kept, z });
}

/** Moves the view by dx, dy map units. */
export function panBy(view: View, dx: number, dy: number): View {
  return clampView({ cx: view.cx + dx, cy: view.cy + dy, z: view.z });
}

/** Reads a view from the address: ?lat=43.70&lon=7.26&z=16. Anything wrong falls back to all of Europe. */
export function viewFromQuery(query: { lat?: string; lon?: string; z?: string }): View {
  const lat = Number(query.lat);
  const lon = Number(query.lon);
  const z = Number(query.z);
  if (!query.lat || !query.lon || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return clampView({ ...FULL_VIEW, z: Number.isFinite(z) && query.z ? z : 1 });
  }
  const [cx, cy] = project(lon, lat);
  return clampView({ cx, cy, z: Number.isFinite(z) && query.z ? z : 1 });
}

/** The address of a view, short enough to share. */
export function viewQuery(view: View): string {
  const [lon, lat] = unproject(view.cx, view.cy);
  const z = Math.round(view.z * 100) / 100;
  return `lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&z=${z}`;
}

/** The detailed tiles that cover a view, empty below FINE_ZOOM. */
export function tilesInView(view: View): { col: number; row: number }[] {
  if (view.z < FINE_ZOOM) return [];
  const [x, y, w, h] = viewBox(view);
  const tiles: { col: number; row: number }[] = [];
  const firstCol = Math.max(0, Math.floor(x / TILE));
  const lastCol = Math.min(TILE_COLS - 1, Math.floor((x + w) / TILE));
  const firstRow = Math.max(0, Math.floor(y / TILE));
  const lastRow = Math.min(TILE_ROWS - 1, Math.floor((y + h) / TILE));
  for (let row = firstRow; row <= lastRow; row++) {
    for (let col = firstCol; col <= lastCol; col++) tiles.push({ col, row });
  }
  return tiles;
}
