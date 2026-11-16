import { describe, expect, it } from "vitest";
import { MAP_HEIGHT, MAP_WIDTH, project, unproject } from "./europe";
import {
  FINE_ZOOM,
  FULL_VIEW,
  MAX_ZOOM,
  TILE,
  TILE_COLS,
  TILE_ROWS,
  clampView,
  panBy,
  tilesInView,
  viewBox,
  viewFromQuery,
  viewQuery,
  zoomAt,
} from "./view";

const nice = project(7.262, 43.7031);

describe("unproject", () => {
  it("undoes project", () => {
    const [lon, lat] = unproject(...project(7.262, 43.7031));
    expect(lon).toBeCloseTo(7.262, 2);
    expect(lat).toBeCloseTo(43.7031, 2);
  });
});

describe("clampView", () => {
  it("keeps the zoom between all of Europe and the closest view", () => {
    expect(clampView({ ...FULL_VIEW, z: 500 }).z).toBe(MAX_ZOOM);
    expect(clampView({ ...FULL_VIEW, z: 0.1 }).z).toBe(1);
    expect(clampView({ cx: Number.NaN, cy: 5, z: Number.NaN })).toEqual(FULL_VIEW);
  });

  it("keeps the view inside the map", () => {
    expect(clampView({ cx: 0, cy: 0, z: 1 })).toEqual(FULL_VIEW);
    const corner = clampView({ cx: -100, cy: MAP_HEIGHT + 100, z: 4 });
    const [x, y, w, h] = viewBox(corner);
    expect(x).toBeCloseTo(0);
    expect(y + h).toBeCloseTo(MAP_HEIGHT);
    expect(w).toBeCloseTo(MAP_WIDTH / 4);
  });
});

describe("zoomAt", () => {
  it("keeps the point under the cursor in place", () => {
    const start = clampView({ cx: 400, cy: 500, z: 2 });
    const [fx, fy] = nice;
    const share = (view: typeof start) => {
      const [x, y, w, h] = viewBox(view);
      return [(fx - x) / w, (fy - y) / h];
    };
    const zoomed = zoomAt(start, 4, fx, fy);
    expect(zoomed.z).toBe(8);
    const [sx0, sy0] = share(start);
    const [sx1, sy1] = share(zoomed);
    expect(sx1).toBeCloseTo(sx0 ?? 0);
    expect(sy1).toBeCloseTo(sy0 ?? 0);
  });

  it("returns to all of Europe when zoomed out far", () => {
    expect(zoomAt(clampView({ cx: 600, cy: 700, z: 8 }), 0.01)).toEqual(FULL_VIEW);
  });
});

describe("panBy", () => {
  it("moves the view and stops at the edge", () => {
    const view = clampView({ cx: 500, cy: 500, z: 4 });
    expect(panBy(view, 10, -20)).toEqual({ cx: 510, cy: 480, z: 4 });
    expect(viewBox(panBy(view, -10_000, 0))[0]).toBeCloseTo(0);
  });
});

describe("the address of a view", () => {
  it("comes back to the same view", () => {
    const view = clampView({ cx: nice[0], cy: nice[1], z: 16 });
    const query = Object.fromEntries(new URLSearchParams(viewQuery(view)));
    const back = viewFromQuery(query);
    expect(back.z).toBe(16);
    expect(back.cx).toBeCloseTo(view.cx, 1);
    expect(back.cy).toBeCloseTo(view.cy, 1);
  });

  it("falls back to all of Europe on anything wrong", () => {
    expect(viewFromQuery({})).toEqual(FULL_VIEW);
    expect(viewFromQuery({ lat: "x", lon: "7", z: "9" }).cx).toBe(FULL_VIEW.cx);
    expect(viewFromQuery({ lat: "43.7", lon: "7.26", z: "1e9" }).z).toBe(MAX_ZOOM);
  });
});

describe("tilesInView", () => {
  it("asks for no tiles until the map is close", () => {
    expect(tilesInView(clampView({ cx: nice[0], cy: nice[1], z: FINE_ZOOM - 1 }))).toEqual([]);
  });

  it("asks for the few tiles around a close view, inside the grid", () => {
    const tiles = tilesInView(clampView({ cx: nice[0], cy: nice[1], z: MAX_ZOOM }));
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.length).toBeLessThanOrEqual(4);
    expect(tiles).toContainEqual({
      col: Math.floor(nice[0] / TILE),
      row: Math.floor(nice[1] / TILE),
    });
    const wide = tilesInView(clampView({ cx: 999, cy: 999, z: FINE_ZOOM }));
    for (const { col, row } of wide) {
      expect(col).toBeLessThan(TILE_COLS);
      expect(row).toBeLessThan(TILE_ROWS);
    }
  });
});
