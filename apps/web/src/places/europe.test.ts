import { describe, expect, it } from "vitest";
import { MAP_HEIGHT, MAP_WIDTH, onMap, parseGeoNamesLine, project } from "./europe";

const line = (over: Record<number, string> = {}) => {
  const f = [
    "3034006",
    "Beaulieu-sur-Mer",
    "Beaulieu-sur-Mer",
    "",
    "43.70755",
    "7.33155",
    "P",
    "PPL",
    "FR",
    "",
    "93",
    "06",
    "062",
    "06011",
    "3787",
    "",
    "19",
    "Europe/Paris",
    "2016-02-18",
  ];
  for (const [i, v] of Object.entries(over)) f[Number(i)] = v;
  return f.join("\t");
};

describe("parseGeoNamesLine", () => {
  it("reads a European settlement", () => {
    expect(parseGeoNamesLine(line())).toEqual({
      id: 3034006,
      name: "Beaulieu-sur-Mer",
      ascii: "Beaulieu-sur-Mer",
      country: "FR",
      population: 3787,
      lat: 43.70755,
      lon: 7.33155,
    });
  });

  it("skips other continents, non-settlements and broken lines", () => {
    expect(parseGeoNamesLine(line({ 8: "US" }))).toBeUndefined();
    expect(parseGeoNamesLine(line({ 6: "T" }))).toBeUndefined();
    expect(parseGeoNamesLine("only\tthree\tfields")).toBeUndefined();
    expect(parseGeoNamesLine(line({ 4: "north" }))).toBeUndefined();
  });

  it("cuts Russia at the Urals", () => {
    expect(parseGeoNamesLine(line({ 8: "RU", 5: "37.6" }))?.country).toBe("RU");
    expect(parseGeoNamesLine(line({ 8: "RU", 5: "131.9" }))).toBeUndefined();
  });
});

describe("project", () => {
  it("puts the corners of the frame on the corners of the map", () => {
    expect(project(-25, 72)).toEqual([0, 0]);
    const [x, y] = project(45, 34);
    expect(x).toBe(MAP_WIDTH);
    expect(Math.round(y)).toBe(MAP_HEIGHT);
  });

  it("places north above south and west left of east", () => {
    const [xParis, yParis] = project(2.35, 48.86);
    const [xRome, yRome] = project(12.5, 41.9);
    expect(xParis).toBeLessThan(xRome);
    expect(yParis).toBeLessThan(yRome);
  });

  it("knows what lies outside the frame", () => {
    expect(onMap(7.33, 43.7)).toBe(true);
    expect(onMap(-74, 40.7)).toBe(false);
  });
});
