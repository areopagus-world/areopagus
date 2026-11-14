import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/land-50m.json";
import { MAP_HEIGHT, MAP_WIDTH, project } from "./europe";

type Ring = number[][];

let cached: string | undefined;

/**
 * Removes the jumps of a ring that crosses the antimeridian (Eurasia at Chukotka): each jump of more than
 * 180 degrees shifts what follows by a full turn, so no line runs across the whole map.
 */
export function unwrap(ring: Ring): Ring {
  let shift = 0;
  let before: number | undefined;
  return ring.map(([lon = 0, lat = 0]) => {
    if (before !== undefined && lon - before > 180) shift -= 360;
    if (before !== undefined && before - lon > 180) shift += 360;
    before = lon;
    return [lon + shift, lat];
  });
}

/** SVG path of the land in the map frame, from Natural Earth (public domain). Built once per process. */
export function europeOutline(): string {
  if (cached) return cached;
  const topology = world as unknown as Topology<{ land: GeometryCollection }>;
  // Land only, no state borders: the map shows where people are, not whose territory it is.
  const land = feature(topology, topology.objects.land);
  const parts: string[] = [];
  const draw = (ring: Ring) => {
    // The ring may start on either side of the antimeridian, so it is tried one turn west, in place and one
    // turn east; only the copies that reach the frame are drawn.
    const unwrapped = unwrap(ring);
    for (const turn of [-360, 0, 360]) {
      const points = unwrapped.map(([lon = 0, lat = 0]) => project(lon + turn, lat));
      const visible = points.some(
        ([x, y]) => x > -50 && x < MAP_WIDTH + 50 && y > -50 && y < MAP_HEIGHT + 50,
      );
      if (!visible) continue;
      let previous = "";
      let d = "";
      for (const [x, y] of points) {
        const point = `${Math.round(x)},${Math.round(y)}`;
        if (point === previous) continue;
        d += (d ? "L" : "M") + point;
        previous = point;
      }
      if (d.includes("L")) parts.push(`${d}Z`);
    }
  };
  for (const piece of land.features) {
    const geometry = piece.geometry;
    if (geometry.type === "Polygon") (geometry.coordinates as Ring[]).forEach(draw);
    if (geometry.type === "MultiPolygon")
      (geometry.coordinates as Ring[][]).forEach((polygon) => polygon.forEach(draw));
  }
  cached = parts.join("");
  return cached;
}
