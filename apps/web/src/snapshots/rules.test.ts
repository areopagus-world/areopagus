import { describe, expect, it } from "vitest";
import {
  checkLevel,
  checkValue,
  HALF_LIFE_DAYS,
  lean,
  position,
  signed,
  summarize,
  SUMMARY_MIN,
  weight,
  weightedQuantile,
} from "./rules";

describe("checkLevel", () => {
  it("takes the eight levels and nothing else", () => {
    expect(checkLevel("1")).toBe(1);
    expect(checkLevel("8")).toBe(8);
    expect(checkLevel("0")).toBeUndefined();
    expect(checkLevel("9")).toBeUndefined();
    expect(checkLevel("1.5")).toBeUndefined();
    expect(checkLevel(null)).toBeUndefined();
  });
});

describe("checkValue", () => {
  it("takes whole steps between the two ends", () => {
    expect(checkValue("-100")).toBe(-100);
    expect(checkValue("0")).toBe(0);
    expect(checkValue("-0")).toBe(0);
    expect(checkValue(" 30 ")).toBe(30);
    expect(checkValue("100")).toBe(100);
  });

  it("refuses what is off the scale", () => {
    expect(checkValue("110")).toBeUndefined();
    expect(checkValue("-110")).toBeUndefined();
    expect(checkValue("15")).toBeUndefined();
    expect(checkValue("1e2")).toBeUndefined();
    expect(checkValue("")).toBeUndefined();
    expect(checkValue(undefined)).toBeUndefined();
  });
});

describe("weight", () => {
  it("halves every half-life and never grows for the future", () => {
    expect(weight(0)).toBe(1);
    expect(weight(HALF_LIFE_DAYS)).toBeCloseTo(0.5);
    expect(weight(2 * HALF_LIFE_DAYS)).toBeCloseTo(0.25);
    expect(weight(-5)).toBe(1);
  });
});

describe("weightedQuantile", () => {
  it("finds the middle by weight, not by count", () => {
    const points = [
      { value: -50, weight: 1 },
      { value: 0, weight: 1 },
      { value: 50, weight: 3 },
    ];
    expect(weightedQuantile(points, 0.5)).toBe(50);
    expect(weightedQuantile(points, 0.25)).toBe(0);
  });
});

describe("summarize", () => {
  const fresh = (values: number[]) => values.map((value) => ({ value, ageDays: 0 }));

  it("shows only the count while there are too few views", () => {
    expect(summarize(fresh(Array(SUMMARY_MIN - 1).fill(10)))).toEqual({ count: SUMMARY_MIN - 1 });
  });

  it("gives the middle and the middle half once enough people took part", () => {
    const summary = summarize(fresh([-80, -60, -40, -40, -30, -30, -20, -10, 0, 20]));
    expect(summary).toEqual({ count: 10, median: -30, low: -40, high: -10 });
  });

  it("lets old views count less", () => {
    const old = Array.from({ length: 6 }, () => ({ value: 60, ageDays: 3 * HALF_LIFE_DAYS }));
    const summary = summarize([...old, ...fresh([-20, -20, -20, -20])]);
    expect(summary).toMatchObject({ count: 10, median: -20 });
  });
});

describe("reading the scale", () => {
  it("names the lean of the middle", () => {
    expect(lean(-30)).toBe("short");
    expect(lean(-20)).toBe("balance");
    expect(lean(20)).toBe("balance");
    expect(lean(40)).toBe("excess");
  });

  it("writes signed points with a true minus sign", () => {
    expect(signed(30)).toBe("+30");
    expect(signed(0)).toBe("0");
    expect(signed(-30)).toBe("−30");
  });

  it("places points along the bar", () => {
    expect(position(-100)).toBe(0);
    expect(position(0)).toBe(50);
    expect(position(100)).toBe(100);
  });
});
