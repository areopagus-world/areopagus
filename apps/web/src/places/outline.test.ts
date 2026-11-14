import { describe, expect, it } from "vitest";
import { project } from "./europe";
import { europeOutline, unwrap } from "./outline";

describe("unwrap", () => {
  it("leaves an ordinary ring alone", () => {
    const ring = [
      [-5, 40],
      [10, 40],
      [10, 50],
      [-5, 40],
    ];
    expect(unwrap(ring)).toEqual(ring);
  });

  it("continues past the antimeridian instead of jumping across the map", () => {
    expect(
      unwrap([
        [170, 65],
        [179, 66],
        [-178, 66],
        [-170, 65],
        [175, 64],
      ]).map(([lon]) => lon),
    ).toEqual([170, 179, 182, 190, 175]);
  });
});

/** Even-odd test of a point against every ring of the outline path. */
function isLand(lon: number, lat: number): boolean {
  const [px, py] = project(lon, lat);
  let inside = false;
  for (const ring of europeOutline().split("Z")) {
    const points = ring
      .slice(1)
      .split("L")
      .map((pair) => pair.split(",").map(Number));
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [xi = 0, yi = 0] = points[i] ?? [];
      const [xj = 0, yj = 0] = points[j] ?? [];
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

describe("europeOutline", () => {
  it("has the continent as land and the seas as water", () => {
    for (const [lon, lat] of [
      [2.35, 48.86], // Paris
      [-3.7, 40.4], // Madrid
      [13.4, 52.5], // Berlin
      [30.5, 50.45], // Kyiv
      [-0.1, 51.5], // London
      [21.0, 52.2], // Warsaw
    ]) {
      expect(isLand(lon ?? 0, lat ?? 0), `${lon},${lat}`).toBe(true);
    }
    for (const [lon, lat] of [
      [-15, 48], // Atlantic
      [5, 40], // Mediterranean
      [3, 56], // North Sea
      [34, 43.5], // Black Sea
      [19.5, 58], // Baltic
    ]) {
      expect(isLand(lon ?? 0, lat ?? 0), `${lon},${lat}`).toBe(false);
    }
  });
});
