import { describe, expect, it } from "vitest";
import { project } from "./europe";
import { fineTile, isTile } from "./fine";
import { TILE, TILE_COLS, TILE_ROWS } from "./view";

const tileOf = (lon: number, lat: number) => {
  const [x, y] = project(lon, lat);
  return [Math.floor(x / TILE), Math.floor(y / TILE)] as const;
};

describe("fine tiles", () => {
  it("knows which tiles exist", () => {
    expect(isTile(0, 0)).toBe(true);
    expect(isTile(TILE_COLS - 1, TILE_ROWS - 1)).toBe(true);
    expect(isTile(TILE_COLS, 0)).toBe(false);
    expect(isTile(-1, 0)).toBe(false);
    expect(isTile(1.5, 0)).toBe(false);
  });

  it("draws land and coast where there is a coast", () => {
    const [col, row] = tileOf(7.262, 43.7031); // Nice
    const svg = fineTile(col, row);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('fill="#1e1a17"');
    expect(svg).toContain('stroke="#3a342e"');
  });

  it("draws only sea in open sea", () => {
    const [col, row] = tileOf(-20, 45); // the Atlantic west of Biscay
    const svg = fineTile(col, row);
    expect(svg).not.toContain("<path");
  });
});

describe("short paths", () => {
  it("writes numbers and steps as short as SVG allows", async () => {
    const { path, short } = await import("./fine");
    expect(short(0.5)).toBe(".5");
    expect(short(-0.5)).toBe("-.5");
    expect(short(12)).toBe("12");
    expect(
      path(
        [
          [10, 10],
          [10.5, 9.5],
          [10.5, 9.5],
          [9, 11],
        ],
        true,
      ),
    ).toBe("M10,10l.5-.5-1.5,1.5z");
    expect(path([[1, 1]], false)).toBe("");
  });
});

describe("the tiles in public/map/tiles", () => {
  it("are the ones the code draws: run pnpm map:tiles after changing the map", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const dir = join(__dirname, "..", "..", "public", "map", "tiles");
    for (let col = 0; col < TILE_COLS; col++) {
      for (let row = 0; row < TILE_ROWS; row++) {
        const file = readFileSync(join(dir, String(col), `${row}.svg`), "utf8");
        expect(file, `${col}/${row}`).toBe(fineTile(col, row));
      }
    }
  });
});
