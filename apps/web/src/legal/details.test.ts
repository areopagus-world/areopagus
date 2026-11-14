import { describe, expect, it } from "vitest";
import { publisher } from "./details";

describe("publisher", () => {
  it("names donnee.dev and points to its site when nothing is set", () => {
    expect(publisher({})).toEqual({
      name: "donnee.dev",
      contactHref: "https://donnee.dev",
      contactLabel: "donnee.dev",
      address: undefined,
      siret: undefined,
      phone: undefined,
    });
  });

  it("uses the details that are set and an e-mail as the contact", () => {
    const p = publisher({
      LEGAL_NAME: "Jeanne Martin EI",
      LEGAL_EMAIL: " hello@example.org ",
      LEGAL_SIRET: "123 456 789 00012",
      LEGAL_PHONE: "",
    });
    expect(p.name).toBe("Jeanne Martin EI");
    expect(p.contactHref).toBe("mailto:hello@example.org");
    expect(p.contactLabel).toBe("hello@example.org");
    expect(p.siret).toBe("123 456 789 00012");
    expect(p.phone).toBeUndefined();
  });
});
