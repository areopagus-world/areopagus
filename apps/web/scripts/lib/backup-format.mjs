/* global process */
// Shared by export-data.mjs and import-data.mjs: the order of tables, the file format, and its check.
//
// The file is gzip-compressed JSON lines:
//   {"format":"areopagus-data","version":1,"createdAt":...,"migrations":[...],"tables":[...]}
//   {"table":"users"}
//   {...one row of users, as row_to_json gave it...}
//   {"table":"spaces"}
//   ...
//   {"end":true,"rows":{"users":12,"spaces":10,...}}
// Rows are never parsed on the way: PostgreSQL writes them and reads them back as they are.

export const FORMAT = "areopagus-data";
export const VERSION = 1;

/** Short-lived tables that a restore does not need: sign-in links, sessions, passkey challenges. */
export const EPHEMERAL = new Set(["login_tokens", "sessions", "webauthn_challenges"]);

/** A backup without these is refused. */
export const REQUIRED = [
  "schema_migrations",
  "users",
  "spaces",
  "events",
  "communities",
  "reports",
  "places",
];

/**
 * Orders tables so that every table comes after the tables it references.
 * `edges` are [child, parent] pairs from foreign keys; references to oneself are ignored.
 */
export function dependencyOrder(tables, edges) {
  const parents = new Map(tables.map((table) => [table, new Set()]));
  for (const [child, parent] of edges) {
    if (child !== parent && parents.has(child) && parents.has(parent))
      parents.get(child).add(parent);
  }
  const ordered = [];
  const done = new Set();
  let remaining = [...tables].sort();
  while (remaining.length > 0) {
    const ready = remaining.filter((table) =>
      [...parents.get(table)].every((parent) => done.has(parent)),
    );
    if (ready.length === 0)
      throw new Error(`foreign keys form a cycle between: ${remaining.join(", ")}`);
    for (const table of ready) {
      ordered.push(table);
      done.add(table);
    }
    remaining = remaining.filter((table) => !done.has(table));
  }
  return ordered;
}

/**
 * Reads a backup line by line and checks it: header, sections in the announced order,
 * the closing line, row counts, required tables. Calls onSection/onRow as it goes.
 * Throws with a plain explanation when the file is not a complete backup.
 */
export async function readBackup(lines, { onHeader, onSection, onRow } = {}) {
  let header;
  let current;
  let index = -1;
  const counted = {};
  let end;
  for await (const line of lines) {
    if (line === "") continue;
    if (end) throw new Error("data after the closing line");
    if (!header) {
      header = JSON.parse(line);
      if (header.format !== FORMAT || header.version !== VERSION)
        throw new Error("not an Areopagus data backup");
      for (const table of REQUIRED) {
        if (!header.tables.includes(table))
          throw new Error(`table ${table} is missing from the backup`);
      }
      await onHeader?.(header);
      continue;
    }
    if (line.startsWith('{"table":')) {
      const { table } = JSON.parse(line);
      index += 1;
      if (header.tables[index] !== table)
        throw new Error(`table ${table} is out of the announced order`);
      if (current) await onSection?.(current, null);
      current = table;
      counted[table] = 0;
      await onSection?.(null, table);
      continue;
    }
    if (line.startsWith('{"end":')) {
      if (current) await onSection?.(current, null);
      end = JSON.parse(line);
      continue;
    }
    if (!current) throw new Error("a row before any table");
    counted[current] += 1;
    await onRow?.(current, line);
  }
  if (!header) throw new Error("the file is empty");
  if (!end) throw new Error("the backup is cut short: no closing line");
  if (index + 1 !== header.tables.length) throw new Error("some tables are missing from the body");
  for (const table of header.tables) {
    if (end.rows[table] !== counted[table]) {
      throw new Error(`table ${table}: ${counted[table]} rows read, ${end.rows[table]} announced`);
    }
  }
  return { header, rows: counted };
}

/** A setting read from the environment, without the spaces and line breaks a paste can bring along. */
export function setting(name) {
  return process.env[name]?.replace(/\s+/g, "") || undefined;
}
