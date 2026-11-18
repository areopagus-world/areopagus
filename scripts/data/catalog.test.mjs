import { describe, expect, it } from "vitest";
import { checkCatalog, loadCatalog, objectKey, selectSources } from "./catalog.mjs";

const SHA = "a".repeat(64);
const source = (over = {}) => ({
  id: "one",
  title: "One",
  publisher: "Insee",
  licence: "Licence Ouverte 2.0",
  attribution: "Insee",
  page: "https://www.insee.fr/fr/statistiques/1",
  grain: "commune",
  files: [{ name: "one.csv", url: "https://www.insee.fr/fr/statistiques/fichier/1/one.csv" }],
  ...over,
});

describe("the catalog in the repository", () => {
  it("can be fetched as it stands", () => {
    expect(checkCatalog(loadCatalog())).toEqual([]);
  });

  it("names a licence and an attribution for every source", () => {
    for (const entry of loadCatalog().sources) {
      expect(entry.licence, entry.id).not.toBe("");
      expect(entry.attribution, entry.id).not.toBe("");
    }
  });
});

describe("checkCatalog", () => {
  it("accepts a well-formed source", () => {
    expect(checkCatalog({ sources: [source()] })).toEqual([]);
  });

  it("refuses an empty catalog", () => {
    expect(checkCatalog({ sources: [] })).toEqual(["the catalog has no sources"]);
    expect(checkCatalog({})).toEqual(["the catalog has no sources"]);
  });

  it("refuses a host that is not a known publisher", () => {
    const bad = source({ files: [{ name: "x.csv", url: "https://example.org/x.csv" }] });
    expect(checkCatalog({ sources: [bad] })).toEqual([
      "one: x.csv: host example.org is not allowed",
    ]);
  });

  it("refuses plain http", () => {
    const bad = source({ files: [{ name: "x.csv", url: "http://www.insee.fr/x.csv" }] });
    expect(checkCatalog({ sources: [bad] })).toEqual(["one: x.csv: must be https"]);
  });

  it("refuses a file name that could leave its folder", () => {
    const bad = source({ files: [{ name: "../x.csv", url: "https://www.insee.fr/x.csv" }] });
    expect(checkCatalog({ sources: [bad] })[0]).toBe(
      'one: file name "../x.csv" is not a plain name',
    );
  });

  it("refuses a repeated id and a missing attribution", () => {
    const problems = checkCatalog({ sources: [source(), source({ attribution: "" })] });
    expect(problems).toContain("one: id is used twice");
    expect(problems).toContain("one: attribution is missing");
  });
});

describe("objectKey", () => {
  it("puts the hash in the name, so a changed file never overwrites the old one", () => {
    expect(objectKey("one", "one.csv", SHA)).toBe("raw/one/aaaaaaaaaaaa-one.csv");
    expect(objectKey("one", "one.csv", "b".repeat(64))).toBe("raw/one/bbbbbbbbbbbb-one.csv");
  });

  it("refuses anything that is not a plain id, name and hash", () => {
    expect(() => objectKey("One", "one.csv", SHA)).toThrow();
    expect(() => objectKey("one", "a/b.csv", SHA)).toThrow();
    expect(() => objectKey("one", "one.csv", "abc")).toThrow();
  });
});

describe("selectSources", () => {
  const catalog = { sources: [source(), source({ id: "two" })] };

  it("takes everything when nothing is asked for", () => {
    expect(selectSources(catalog, undefined)).toHaveLength(2);
    expect(selectSources(catalog, "  ")).toHaveLength(2);
  });

  it("takes the one asked for, and says so when it is not there", () => {
    expect(selectSources(catalog, "two").map((s) => s.id)).toEqual(["two"]);
    expect(() => selectSources(catalog, "three")).toThrow('no source with id "three"');
  });
});
