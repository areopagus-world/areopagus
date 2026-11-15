/* global console, process */
// Writes every row of the database to a gzip-compressed JSON lines file, in an order that can be
// loaded back. Works with an ordinary database role: managed PostgreSQL plans that refuse pg_dump
// (no access to pg_database) still allow this. The schema itself lives in migrations/.
//
// Usage: node scripts/export-data.mjs --out backup.jsonl.gz
// Reads BACKUP_DATABASE_URL, or DATABASE_URL, or POSTGRESQL_ADDON_URI.
import { createWriteStream } from "node:fs";
import { once } from "node:events";
import { createGzip } from "node:zlib";
import pg from "pg";
import { dependencyOrder, EPHEMERAL, FORMAT, setting, VERSION } from "./lib/backup-format.mjs";

const outFlag = process.argv.indexOf("--out");
const out = outFlag > -1 ? process.argv[outFlag + 1] : undefined;
const url =
  setting("BACKUP_DATABASE_URL") ?? setting("DATABASE_URL") ?? setting("POSTGRESQL_ADDON_URI");
if (!out || !url) {
  console.error(
    "usage: BACKUP_DATABASE_URL=... node scripts/export-data.mjs --out backup.jsonl.gz",
  );
  process.exit(2);
}

const quote = (name) => `"${name.replace(/"/g, '""')}"`;
const client = new pg.Client({ connectionString: url });
await client.connect();
const gzip = createGzip();
const file = createWriteStream(out);
gzip.pipe(file);
const write = async (line) => {
  if (!gzip.write(`${line}\n`)) await once(gzip, "drain");
};

try {
  // One snapshot for the whole export: rows written while it runs do not mix in.
  await client.query("begin isolation level repeatable read read only");
  const { rows: found } = await client.query(
    `select c.relname as name from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind in ('r', 'p')`,
  );
  const { rows: links } = await client.query(
    `select child.relname as child, parent.relname as parent
     from pg_constraint k
     join pg_class child on child.oid = k.conrelid
     join pg_class parent on parent.oid = k.confrelid
     join pg_namespace n on n.oid = child.relnamespace
     where k.contype = 'f' and n.nspname = 'public'`,
  );
  const tables = dependencyOrder(
    found.map((row) => row.name).filter((name) => !EPHEMERAL.has(name)),
    links.map((row) => [row.child, row.parent]),
  );
  const { rows: migrations } = await client.query("select id from schema_migrations order by id");
  await write(
    JSON.stringify({
      format: FORMAT,
      version: VERSION,
      createdAt: new Date().toISOString(),
      migrations: migrations.map((row) => row.id),
      tables,
    }),
  );

  const counts = {};
  for (const table of tables) {
    await write(JSON.stringify({ table }));
    counts[table] = 0;
    await client.query(
      `declare rows_out no scroll cursor for select row_to_json(t)::text as j from public.${quote(table)} t`,
    );
    for (;;) {
      const { rows } = await client.query("fetch 5000 from rows_out");
      if (rows.length === 0) break;
      for (const row of rows) await write(row.j);
      counts[table] += rows.length;
    }
    await client.query("close rows_out");
  }
  await write(JSON.stringify({ end: true, rows: counts }));
  await client.query("commit");
  gzip.end();
  await once(file, "finish");
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  console.log(`exported ${total} rows from ${tables.length} tables`);
} catch (error) {
  console.error(`export failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
