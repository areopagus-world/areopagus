import { describe, expect, it } from "vitest";
import { hashSecret, isAllowed, newSecret, normalizeEmail } from "./tokens";

describe("newSecret", () => {
  it("returns a long random secret and its hash", () => {
    const a = newSecret();
    const b = newSecret();
    expect(a.secret).not.toBe(b.secret);
    expect(a.secret.length).toBeGreaterThanOrEqual(43);
    expect(a.hash).toBe(hashSecret(a.secret));
    expect(a.hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("normalizeEmail", () => {
  it("trims and lower-cases", () => {
    expect(normalizeEmail("  Anna@Example.ORG ")).toBe("anna@example.org");
  });

  it("rejects what cannot be an address", () => {
    for (const bad of [
      "",
      "anna",
      "anna@",
      "@example.org",
      "a b@example.org",
      "anna@example",
      42,
      null,
    ]) {
      expect(normalizeEmail(bad)).toBeUndefined();
    }
  });

  it("rejects an address longer than 254 characters", () => {
    expect(normalizeEmail(`${"a".repeat(250)}@example.org`)).toBeUndefined();
  });
});

describe("isAllowed", () => {
  it("lets everyone in when there is no list", () => {
    expect(isAllowed("anna@example.org", undefined)).toBe(true);
    expect(isAllowed("anna@example.org", " , ")).toBe(true);
  });

  it("lets in only listed addresses, ignoring case and spaces", () => {
    const list = "Pavel@Example.org, anna@example.org";
    expect(isAllowed("pavel@example.org", list)).toBe(true);
    expect(isAllowed("eve@example.org", list)).toBe(false);
  });
});
