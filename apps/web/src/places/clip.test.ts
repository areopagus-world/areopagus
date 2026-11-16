import { describe, expect, it } from "vitest";
import { clipOutline, clipRing, type Point } from "./clip";

const box = { x0: 0, y0: 0, x1: 10, y1: 10 };

const area = (ring: Point[]) =>
  Math.abs(
    ring.reduce((sum, [x, y], i) => {
      const [nx, ny] = ring[(i + 1) % ring.length] as Point;
      return sum + x * ny - nx * y;
    }, 0) / 2,
  );

describe("clipRing", () => {
  it("keeps a ring that lies inside", () => {
    const ring: Point[] = [
      [2, 2],
      [8, 2],
      [8, 8],
      [2, 8],
    ];
    expect(clipRing(ring, box)).toEqual(ring);
  });

  it("fills the whole box when the ring surrounds it", () => {
    const ring: Point[] = [
      [-5, -5],
      [15, -5],
      [15, 15],
      [-5, 15],
    ];
    expect(area(clipRing(ring, box))).toBeCloseTo(100);
  });

  it("cuts a ring that crosses the edge", () => {
    const ring: Point[] = [
      [5, 2],
      [20, 2],
      [20, 8],
      [5, 8],
    ];
    expect(area(clipRing(ring, box))).toBeCloseTo(30);
  });

  it("drops a ring outside", () => {
    expect(
      clipRing(
        [
          [20, 20],
          [30, 20],
          [30, 30],
        ],
        box,
      ),
    ).toEqual([]);
  });
});

describe("clipOutline", () => {
  it("keeps only the coast inside the box, as open lines", () => {
    const ring: Point[] = [
      [5, 2],
      [20, 2],
      [20, 8],
      [5, 8],
    ];
    expect(clipOutline(ring, box)).toEqual([
      [
        [10, 8],
        [5, 8],
        [5, 2],
        [10, 2],
      ],
    ]);
  });

  it("finds no coast in a box the ring does not touch", () => {
    const ring: Point[] = [
      [-5, -5],
      [15, -5],
      [15, 15],
      [-5, 15],
    ];
    expect(clipOutline(ring, box)).toEqual([]);
  });
});
