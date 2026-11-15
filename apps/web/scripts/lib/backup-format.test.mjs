import { describe, expect, it } from "vitest";
import { dependencyOrder, FORMAT, readBackup, REQUIRED, VERSION } from "./backup-format.mjs";

describe("dependencyOrder", () => {
  it("puts every table after the tables it references", () => {
    const order = dependencyOrder(
      ["events", "spaces", "users", "places", "event_links"],
      [
        ["spaces", "users"],
        ["spaces", "places"],
        ["events", "spaces"],
        ["events", "places"],
        ["event_links", "events"],
        ["events", "events"],
      ],
    );
    const at = (table) => order.indexOf(table);
    expect(order).toHaveLength(5);
    expect(at("users")).toBeLessThan(at("spaces"));
    expect(at("places")).toBeLessThan(at("spaces"));
    expect(at("spaces")).toBeLessThan(at("events"));
    expect(at("events")).toBeLessThan(at("event_links"));
  });

  it("refuses a cycle", () => {
    expect(() =>
      dependencyOrder(
        ["a", "b"],
        [
          ["a", "b"],
          ["b", "a"],
        ],
      ),
    ).toThrow(/cycle/);
  });
});

const tables = [...REQUIRED];
const header = JSON.stringify({ format: FORMAT, version: VERSION, migrations: ["0001"], tables });
const body = (counts) =>
  tables.flatMap((table) => [
    JSON.stringify({ table }),
    ...Array.from({ length: counts[table] ?? 0 }, () => "{}"),
  ]);
const end = (counts) =>
  JSON.stringify({ end: true, rows: Object.fromEntries(tables.map((t) => [t, counts[t] ?? 0])) });

describe("readBackup", () => {
  it("reads a complete backup and counts rows", async () => {
    const counts = { users: 2, spaces: 1 };
    const seen = [];
    const result = await readBackup([header, ...body(counts), end(counts)], {
      onRow: (table) => seen.push(table),
    });
    expect(result.rows.users).toBe(2);
    expect(seen).toEqual(["users", "users", "spaces"]);
  });

  it("refuses a backup cut short", async () => {
    await expect(readBackup([header, ...body({ users: 2 })])).rejects.toThrow(/cut short/);
  });

  it("refuses a backup whose counts do not match", async () => {
    await expect(readBackup([header, ...body({ users: 2 }), end({ users: 3 })])).rejects.toThrow(
      /users/,
    );
  });

  it("refuses a backup without a required table", async () => {
    const partial = JSON.stringify({
      format: FORMAT,
      version: VERSION,
      migrations: [],
      tables: ["users"],
    });
    await expect(readBackup([partial])).rejects.toThrow(/missing/);
  });

  it("refuses another file", async () => {
    await expect(readBackup(['{"hello":1}'])).rejects.toThrow(/not an Areopagus/);
  });
});
