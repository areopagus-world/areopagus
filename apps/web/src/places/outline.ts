import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/land-50m.json";
import { MAP_HEIGHT, MAP_WIDTH, project } from "./europe";

type Ring = number[][];

let cached: string | undefined;

/** SVG path of the land in the map frame, from Natural Earth (public domain). Built once per process. */
export function europeOutline(): string {
  if (cached) return cached;
  const topology = world as unknown as Topology<{ land: GeometryCollection }>;
  // Land only, no state borders: the map shows where people are, not whose territory it is.
  const land = feature(topology, topology.objects.land);
  const parts: string[] = [];
  const draw = (ring: Ring) => {
    // A ring that crosses the antimeridian (Chukotka) is unwrapped eastwards, otherwise it draws a band across the map.
    const crosses = ring.some(
      ([lon = 0], i) => i > 0 && Math.abs(lon - (ring[i - 1]?.[0] ?? lon)) > 180,
    );
    const points = ring.map(([lon = 0, lat = 0]) =>
      project(crosses && lon < 0 ? lon + 360 : lon, lat),
    );
    const visible = points.some(
      ([x, y]) => x > -50 && x < MAP_WIDTH + 50 && y > -50 && y < MAP_HEIGHT + 50,
    );
    if (!visible) return;
    let previous = "";
    let d = "";
    for (const [x, y] of points) {
      const point = `${Math.round(x)},${Math.round(y)}`;
      if (point === previous) continue;
      d += (d ? "L" : "M") + point;
      previous = point;
    }
    if (d.includes("L")) parts.push(`${d}Z`);
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
