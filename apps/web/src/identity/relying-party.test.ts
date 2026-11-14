import { describe, expect, it } from "vitest";
import { relyingPartyId } from "./relying-party";

describe("relyingPartyId", () => {
  it("is the host of the app by default", () => {
    expect(relyingPartyId("https://beta.areopagus.world", {})).toBe("beta.areopagus.world");
    expect(relyingPartyId("http://localhost:3000", {})).toBe("localhost");
  });

  it("can be the parent domain, so passkeys survive the move from beta", () => {
    const env = { WEBAUTHN_RP_ID: "areopagus.world" };
    expect(relyingPartyId("https://beta.areopagus.world", env)).toBe("areopagus.world");
    expect(relyingPartyId("https://areopagus.world", env)).toBe("areopagus.world");
  });

  it("ignores a domain the app is not part of", () => {
    const env = { WEBAUTHN_RP_ID: "example.org" };
    expect(relyingPartyId("https://beta.areopagus.world", env)).toBe("beta.areopagus.world");
    expect(
      relyingPartyId("https://evilareopagus.world", { WEBAUTHN_RP_ID: "areopagus.world" }),
    ).toBe("evilareopagus.world");
  });
});
