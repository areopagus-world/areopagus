import { describe, expect, it } from "vitest";
import { checkReport, isModerator, moderatorEmails } from "./rules";

describe("checkReport", () => {
  const good = { reason: "scam", details: "Asks for money in every message.", contact: "" };

  it("accepts a reason with details, contact optional", () => {
    expect(checkReport(good)).toEqual({ reason: "scam", details: good.details, contact: "" });
    expect(checkReport({ ...good, contact: " Reader@Example.org " })).toMatchObject({
      contact: "reader@example.org",
    });
  });

  it("names the problem", () => {
    expect(checkReport({ ...good, reason: "dislike" })).toEqual({ problem: "reason" });
    expect(checkReport({ ...good, reason: "toString" })).toEqual({ problem: "reason" });
    expect(checkReport({ ...good, details: "bad" })).toEqual({ problem: "details" });
    expect(checkReport({ ...good, contact: "not an address" })).toEqual({ problem: "contact" });
  });
});

describe("isModerator", () => {
  it("is true only for listed addresses", () => {
    expect(isModerator("Mod@Example.org", "a@example.org, mod@example.org")).toBe(true);
    expect(isModerator("x@example.org", "a@example.org, mod@example.org")).toBe(false);
  });

  it("is false for everyone when the list is empty", () => {
    expect(isModerator("x@example.org", "")).toBe(false);
    expect(isModerator("x@example.org", undefined)).toBe(false);
    expect(moderatorEmails(" , ")).toEqual([]);
  });
});
