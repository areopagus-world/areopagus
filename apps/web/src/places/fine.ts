import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/land-10m.json";
import { clipOutline, clipRing, type Box, type Point } from "./clip";
import { MAP_HEIGHT, MAP_WIDTH, project } from "./europe";
import { unwrap } from "./outline";
import { TILE, TILE_COLS, TILE_MARGIN, TILE_ROWS } from "./view";

interface Ring {
  points: Point[];
  box: Box;
}

const PRECISION = 10;

let rings: Ring[] | undefined;
const tiles = new Map<string, string>();

/** The detailed coast (Natural Earth 1:10m, public domain) in map units, built once per process. */
function fineRings(): Ring[] {
  if (rings) return rings;
  const topology = world as unknown as Topology<{ land: GeometryCollection }>;
  const land = feature(topology, topology.objects.land);
  const found: Ring[] = [];
  const add = (ring: number[][]) => {
    const unwrapped = unwrap(ring);
    for (const turn of [-360, 0, 360]) {
      const points = unwrapped.map(([lon = 0, lat = 0]) => {
        const [x, y] = project(lon + turn, lat);
        return [Math.round(x * PRECISION) / PRECISION, Math.round(y * PRECISION) / PRECISION];
      }) as Point[];
      // A loop, not Math.min(...xs): the mainland has too many points to spread into arguments.
      const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
      for (const [x, y] of points) {
        if (x < box.x0) box.x0 = x;
        if (x > box.x1) box.x1 = x;
        if (y < box.y0) box.y0 = y;
        if (y > box.y1) box.y1 = y;
      }
      if (box.x1 < 0 || box.x0 > MAP_WIDTH || box.y1 < 0 || box.y0 > MAP_HEIGHT) continue;
      found.push({ points, box });
    }
  };
  for (const piece of land.features) {
    const geometry = piece.geometry;
    if (geometry.type === "Polygon") (geometry.coordinates as number[][][]).forEach(add);
    if (geometry.type === "MultiPolygon")
      (geometry.coordinates as number[][][][]).forEach((polygon) => polygon.forEach(add));
  }
  rings = found;
  return found;
}

/** A number as short as SVG allows: "0.5" as ".5", "-0.5" as "-.5", no trailing zeros. */
export function short(n: number): string {
  const text = String(Math.round(n * PRECISION) / PRECISION);
  return text.replace(/^(-?)0\./, "$1.");
}

/** A pair for a path, with no comma where the minus sign already separates the numbers. */
const pair = (dx: number, dy: number) => {
  const y = short(dy);
  return `${short(dx)}${y.startsWith("-") ? "" : ","}${y}`;
};

/**
 * A path in relative steps: the first point absolute, then each step from the previous point.
 * Steps are short numbers, so the detailed coast takes about half the bytes.
 */
export function path(points: Point[], close: boolean): string {
  let d = "";
  let px = 0;
  let py = 0;
  let steps = 0;
  for (const [x, y] of points) {
    const rx = Math.round(x * PRECISION);
    const ry = Math.round(y * PRECISION);
    if (d === "") {
      d = `M${pair(rx / PRECISION, ry / PRECISION)}`;
    } else {
      if (rx === px && ry === py) continue;
      const step = pair((rx - px) / PRECISION, (ry - py) / PRECISION);
      d += (steps === 0 ? "l" : step.startsWith("-") ? "" : " ") + step;
      steps++;
    }
    px = rx;
    py = ry;
  }
  return steps > 0 ? d + (close ? "z" : "") : "";
}

/** True when col and row name a tile of the map. */
export function isTile(col: number, row: number): boolean {
  return (
    Number.isInteger(col) &&
    Number.isInteger(row) &&
    col >= 0 &&
    row >= 0 &&
    col < TILE_COLS &&
    row < TILE_ROWS
  );
}

/**
 * One tile of the detailed map as SVG in map units: the sea, the land and the coast line, with a
 * small margin around the tile. The tiles are drawn ahead of time by scripts/build-map-tiles.mjs
 * into public/map/tiles, so the server never loads the detailed coast.
 */
export function fineTile(col: number, row: number): string {
  const key = `${col}/${row}`;
  const cached = tiles.get(key);
  if (cached) return cached;
  const box: Box = {
    x0: col * TILE - TILE_MARGIN,
    y0: row * TILE - TILE_MARGIN,
    x1: (col + 1) * TILE + TILE_MARGIN,
    y1: (row + 1) * TILE + TILE_MARGIN,
  };
  let land = "";
  let coast = "";
  for (const ring of fineRings()) {
    if (
      ring.box.x1 < box.x0 ||
      ring.box.x0 > box.x1 ||
      ring.box.y1 < box.y0 ||
      ring.box.y0 > box.y1
    )
      continue;
    land += path(clipRing(ring.points, box), true);
    for (const line of clipOutline(ring.points, box)) coast += path(line, false);
  }
  const size = TILE + 2 * TILE_MARGIN;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x0} ${box.y0} ${size} ${size}">` +
    `<rect x="${box.x0}" y="${box.y0}" width="${size}" height="${size}" fill="#0e0c0a"/>` +
    (land ? `<path d="${land}" fill="#1e1a17"/>` : "") +
    (coast
      ? `<path d="${coast}" fill="none" stroke="#3a342e" stroke-width="0.035" stroke-linejoin="round"/>`
      : "") +
    `</svg>`;
  tiles.set(key, svg);
  return svg;
}
