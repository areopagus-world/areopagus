import { describe, expect, it } from "vitest";
import { canonicalRedirect } from "./canonical";

describe("canonicalRedirect", () => {
  const main = "https://areopagus.world";

  it("sends side hosts to the main one, keeping the path", () => {
    expect(canonicalRedirect("www.areopagus.world", "/fr/", main)).toBe(
      "https://areopagus.world/fr/",
    );
    expect(canonicalRedirect("beta.areopagus.world", "/pavel?x=1", main)).toBe(
      "https://areopagus.world/pavel?x=1",
    );
  });

  it("leaves the main host and foreign hosts alone", () => {
    expect(canonicalRedirect("areopagus.world", "/", main)).toBeUndefined();
    expect(canonicalRedirect("areopagus.world:443", "/", main)).toBeUndefined();
    expect(canonicalRedirect("app-123.cleverapps.io", "/", main)).toBeUndefined();
    expect(canonicalRedirect("evilareopagus.world", "/", main)).toBeUndefined();
  });

  it("redirects nothing while the app lives on a subdomain or has no origin set", () => {
    expect(
      canonicalRedirect("areopagus.world", "/", "https://beta.areopagus.world"),
    ).toBeUndefined();
    expect(
      canonicalRedirect("www.areopagus.world", "/", "https://beta.areopagus.world"),
    ).toBeUndefined();
    expect(canonicalRedirect("beta.areopagus.world", "/", undefined)).toBeUndefined();
    expect(canonicalRedirect("beta.areopagus.world", "/", "not a url")).toBeUndefined();
  });
});
