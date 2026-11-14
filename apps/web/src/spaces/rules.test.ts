import { describe, expect, it } from "vitest";
import { checkHandle, cleanText, MAX_SKILLS, parseSkills } from "./rules";

describe("checkHandle", () => {
  it("accepts letters, digits and inner hyphens, and lower-cases", () => {
    expect(checkHandle(" Anna-Maria2 ")).toEqual({ handle: "anna-maria2" });
    expect(checkHandle("abc")).toEqual({ handle: "abc" });
  });

  it("rejects wrong length, edges and characters", () => {
    for (const bad of [
      "ab",
      "a".repeat(31),
      "-anna",
      "anna-",
      "an--na",
      "анна",
      "anna maria",
      "anna_m",
      "",
      7,
    ]) {
      expect(checkHandle(bad)).toEqual({ problem: "format" });
    }
  });

  it("rejects addresses the app needs for itself", () => {
    for (const taken of ["login", "API", "map", "areopagus"]) {
      expect(checkHandle(taken)).toEqual({ problem: "reserved" });
    }
    // Two-letter addresses such as "me" or "fr" are already too short.
    expect(checkHandle("me")).toEqual({ problem: "format" });
  });
});

describe("cleanText", () => {
  it("collapses whitespace and cuts single-line text", () => {
    expect(cleanText("  Anna \n  Maria  ", 50)).toBe("Anna Maria");
    expect(cleanText("abcdef", 3)).toBe("abc");
    expect(cleanText(undefined, 10)).toBe("");
  });

  it("keeps paragraphs in multi-line text", () => {
    expect(cleanText("one\r\n\r\n\r\n\r\ntwo   words", 100, true)).toBe("one\n\ntwo words");
  });
});

describe("parseSkills", () => {
  it("splits on commas and new lines, trims, drops duplicates", () => {
    expect(parseSkills("Carpentry, baking\nCARPENTRY,  ,French ")).toEqual([
      "Carpentry",
      "baking",
      "French",
    ]);
  });

  it("keeps at most the allowed number", () => {
    const many = Array.from({ length: 30 }, (_, i) => `skill ${i}`).join(",");
    expect(parseSkills(many)).toHaveLength(MAX_SKILLS);
  });
});
