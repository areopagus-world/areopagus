/* global console, process */
// Checks a backup made by export-data.mjs and, unless --check is given, loads it into a database.
//
// The target must be empty and have exactly the migrations listed in the backup:
//   createdb ...; node scripts/migrate.mjs; node scripts/import-data.mjs --file backup.jsonl.gz
// Everything is loaded in one transaction: either all rows arrive, or none.
//
// Usage: node scripts/import-data.mjs --check backup.jsonl.gz
//        DATABASE_URL=... node scripts/import-data.mjs --file backup.jsonl.gz
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { createGunzip } from "node:zlib";
import pg from "pg";
import { readBackup, setting } from "./lib/backup-format.mjs";

const flag = (name) => {
  const at = process.argv.indexOf(name);
  return at > -1 ? process.argv[at + 1] : undefined;
};
const checkOnly = flag("--check");
const path = checkOnly ?? flag("--file");
if (!path) {
  console.error("usage: node scripts/import-data.mjs --check FILE | --file FILE");
  process.exit(2);
}
const lines = () =>
  createInterface({ input: createReadStream(path).pipe(createGunzip()), crlfDelay: Infinity });
const quote = (name) => `"${name.replace(/"/g, '""')}"`;

if (checkOnly) {
  try {
    const { header, rows } = await readBackup(lines());
    const total = Object.values(rows).reduce((sum, n) => sum + n, 0);
    console.log(
      `backup ok: ${total} rows in ${header.tables.length} tables, migrations up to ${header.migrations.at(-1)}, made ${header.createdAt}`,
    );
  } catch (error) {
    console.error(`backup refused: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
  process.exit(0);
}

const url = setting("DATABASE_URL") ?? setting("POSTGRESQL_ADDON_URI");
if (!url) {
  console.error("set DATABASE_URL to the empty database to load into");
  process.exit(2);
}
const client = new pg.Client({ connectionString: url });
await client.connect();
const BATCH = 1000;
let batch = [];
const flush = async (table) => {
  if (batch.length === 0) return;
  await client.query(
    `insert into public.${quote(table)} select * from json_populate_recordset(null::public.${quote(table)}, $1::json)`,
    [`[${batch.join(",")}]`],
  );
  batch = [];
};

try {
  await client.query("begin");
  await readBackup(lines(), {
    onHeader: async (header) => {
      const { rows: ready } = await client.query(
        "select to_regclass('public.schema_migrations') as t",
      );
      if (!ready[0]?.t)
        throw new Error("the database has no schema yet: run scripts/migrate.mjs on it first");
      const { rows } = await client.query("select id from schema_migrations order by id");
      const here = rows.map((row) => row.id).join(",");
      if (here !== header.migrations.join(",")) {
        throw new Error(
          `the database has migrations [${here}], the backup needs [${header.migrations.join(",")}]: ` +
            "check out the version of the code with those migrations and run scripts/migrate.mjs on an empty database",
        );
      }
      for (const table of header.tables) {
        if (table === "schema_migrations") continue;
        const { rows: any } = await client.query(`select 1 from public.${quote(table)} limit 1`);
        if (any.length > 0)
          throw new Error(`table ${table} is not empty: load a backup only into an empty database`);
      }
    },
    onSection: async (finished) => {
      if (finished) await flush(finished);
    },
    onRow: async (table, line) => {
      if (table === "schema_migrations") return;
      batch.push(line);
      if (batch.length >= BATCH) await flush(table);
    },
  });
  await client.query("commit");
  console.log("backup loaded");
} catch (error) {
  await client.query("rollback").catch(() => {});
  console.error(`nothing loaded: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
