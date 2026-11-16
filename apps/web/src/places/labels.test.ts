import { describe, expect, it } from "vitest";
import { placeLabels, type MapLight } from "./labels";

const light = (id: string, x: number, y: number, spaces = 1): MapLight => ({
  id,
  name: id,
  country: "FR",
  x,
  y,
  spaces,
});

describe("placeLabels", () => {
  it("puts a lonely name to the right of its light", () => {
    expect(placeLabels([light("Nice", 100, 100)], 1)).toEqual([
      { id: "Nice", x: 107, y: 105, anchor: "start" },
    ]);
  });

  it("moves a name aside rather than over a neighbour, biggest place first", () => {
    const labels = placeLabels([light("Monaco", 112, 100), light("Nice", 100, 100, 9)], 1);
    const nice = labels.find((label) => label.id === "Nice");
    expect(nice?.anchor).toBe("end");
    expect(labels.find((label) => label.id === "Monaco")?.anchor).toBe("start");
  });

  it("leaves a name out when every side is taken", () => {
    const crowd = [
      light("A", 100, 100, 5),
      light("B", 108, 100, 4),
      light("C", 92, 100, 3),
      light("D", 100, 92, 2),
      light("E", 100, 108, 1),
    ];
    const ids = placeLabels(crowd, 1).map((label) => label.id);
    expect(ids.length).toBeLessThan(crowd.length);
  });

  it("scales with the zoom", () => {
    const [far] = placeLabels([light("Nice", 100, 100)], 1);
    const [close] = placeLabels([light("Nice", 100, 100)], 0.1);
    expect((far?.x ?? 0) - 100).toBeCloseTo(((close?.x ?? 0) - 100) * 10);
  });
});
