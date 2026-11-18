import { describe, expect, it } from "vitest";
import { checkSpiral, LEVEL_COLORS, levelTitle, SPIRAL_TITLE_MAX } from "./rules";

const form = (entries: Record<string, string>) => ({
  get: (name: string) => entries[name] ?? null,
});

describe("checkSpiral", () => {
  it("is private and keeps the spiral's names when nothing is filled in", () => {
    expect(checkSpiral(form({}))).toEqual({ public: false, titles: new Map() });
  });

  it("reads the owner's own names and the choice to show the spiral", () => {
    const input = checkSpiral(
      form({ public: "on", title_1: "  Bread and roof ", title_5: "Digital design", title_9: "x" }),
    );
    expect(input.public).toBe(true);
    expect([...input.titles]).toEqual([
      [1, "Bread and roof"],
      [5, "Digital design"],
    ]);
  });

  it("keeps a name to its length and drops an empty one", () => {
    const input = checkSpiral(form({ title_2: "a".repeat(80), title_3: "   " }));
    expect(input.titles.get(2)).toHaveLength(SPIRAL_TITLE_MAX);
    expect(input.titles.has(3)).toBe(false);
  });
});

describe("LEVEL_COLORS", () => {
  it("gives each of the eight levels its own hue", () => {
    expect(new Set(Object.values(LEVEL_COLORS)).size).toBe(8);
  });
});

describe("levelTitle", () => {
  const names = [{ name: "Ground" }, { name: "Own people" }, { name: "Initiative" }];
  const levels = [
    { level: 1 as const, title: "Bread and roof" },
    { level: 2 as const, title: null },
  ];

  it("uses the owner's own title when there is one", () => {
    expect(levelTitle(levels, 1, names)).toBe("Bread and roof");
  });

  it("falls back to the spiral's name for an untitled level or a hidden spiral", () => {
    expect(levelTitle(levels, 2, names)).toBe("Own people");
    expect(levelTitle(undefined, 3, names)).toBe("Initiative");
  });
});
