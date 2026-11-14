import { describe, expect, it } from "vitest";
import { cleanQuery, likePattern } from "./rules";

describe("cleanQuery", () => {
  it("trims and collapses spaces", () => {
    expect(cleanQuery("  wood   turning ")).toBe("wood turning");
  });

  it("is undefined for nothing, one letter or a non-string", () => {
    expect(cleanQuery("")).toBeUndefined();
    expect(cleanQuery(" a ")).toBeUndefined();
    expect(cleanQuery(null)).toBeUndefined();
  });

  it("cuts very long phrases", () => {
    expect(cleanQuery("x".repeat(200))?.length).toBe(60);
  });
});

describe("likePattern", () => {
  it("matches anywhere, case-insensitively", () => {
    expect(likePattern("Cooking")).toBe("%cooking%");
  });

  it("takes wildcards literally", () => {
    expect(likePattern("100%_a\\b")).toBe("%100\\%\\_a\\\\b%");
  });
});
