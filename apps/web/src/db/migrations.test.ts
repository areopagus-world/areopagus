import { describe, expect, it } from "vitest";
import { pendingMigrations } from "./migrations";

describe("pendingMigrations", () => {
  it("returns unapplied migrations in numeric order", () => {
    const files = ["0002_spaces.sql", "0001_init.sql", "0003_skills.sql"];
    expect(pendingMigrations(files, ["0001"]).map((m) => m.id)).toEqual(["0002", "0003"]);
  });

  it("returns nothing when everything is applied", () => {
    expect(pendingMigrations(["0001_init.sql"], ["0001"])).toEqual([]);
  });

  it("rejects a badly named file", () => {
    expect(() => pendingMigrations(["init.sql"], [])).toThrow(/Bad migration file name/);
  });

  it("rejects two files with the same number", () => {
    expect(() => pendingMigrations(["0001_a.sql", "0001_b.sql"], [])).toThrow(/Duplicate/);
  });

  it("rejects an applied migration that is no longer in the repository", () => {
    expect(() => pendingMigrations(["0002_b.sql"], ["0001"])).toThrow(/missing/);
  });
});
