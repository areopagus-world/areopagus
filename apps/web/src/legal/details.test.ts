import { describe, expect, it } from "vitest";
import { publisher } from "./details";

const full = {
  LEGAL_NAME: "Jeanne Martin EI",
  LEGAL_ADDRESS: "1 rue de la Paix, 75002 Paris, France",
  LEGAL_SIRET: "123 456 789 00012",
  LEGAL_EMAIL: "hello@example.org",
  LEGAL_PHONE: "+33 1 23 45 67 89",
};

describe("publisher", () => {
  it("reads the details when all are set", () => {
    expect(publisher(full)?.name).toBe("Jeanne Martin EI");
    expect(publisher({ ...full, LEGAL_EMAIL: "  hello@example.org " })?.email).toBe(
      "hello@example.org",
    );
  });

  it("is undefined while anything is missing, so the pages stay unpublished", () => {
    expect(publisher({})).toBeUndefined();
    expect(publisher({ ...full, LEGAL_PHONE: "" })).toBeUndefined();
    expect(publisher({ ...full, LEGAL_SIRET: undefined })).toBeUndefined();
  });
});
