/* global console, process, URL */
// Applies pending SQL migrations in order, each in its own transaction. Safe to run on every deploy.
import { readdirSync, readFileSync } from "node:fs";
import pg from "pg";

const url = process.env.DATABASE_URL ?? process.env.POSTGRESQL_ADDON_URI;
if (!url) {
  console.error("No database configured: set DATABASE_URL");
  process.exit(1);
}
const dir = new URL("../migrations/", import.meta.url);
const files = readdirSync(dir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  // One deploy at a time: a second runner waits here instead of racing.
  await client.query("select pg_advisory_lock(727001)");
  await client.query(
    "create table if not exists schema_migrations (id text primary key, applied_at timestamptz not null default now())",
  );
  const { rows } = await client.query("select id from schema_migrations");
  const applied = new Set(rows.map((row) => row.id));
  for (const file of files) {
    const id = file.slice(0, 4);
    if (!/^\d{4}_[a-z0-9_]+\.sql$/.test(file)) throw new Error(`Bad migration file name: ${file}`);
    if (applied.has(id)) continue;
    await client.query("begin");
    try {
      await client.query(readFileSync(new URL(file, dir), "utf8"));
      await client.query("insert into schema_migrations (id) values ($1)", [id]);
      await client.query("commit");
      console.log(`applied ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }
  console.log("migrations up to date");
} finally {
  await client.end();
}
