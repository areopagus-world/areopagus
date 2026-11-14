/* global console, process, fetch, Buffer */
// Loads the settlements of Europe from GeoNames into the places table. Safe to run again: rows are updated.
// Usage: pnpm --filter @areopagus/web places            (downloads cities500 from geonames.org)
//        node scripts/import-places.mjs --if-empty     (only when the table is empty; never fails the start)
//        node scripts/import-places.mjs --file dump.zip  (uses a local zip instead)
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import pg from "pg";

const SOURCE = "https://download.geonames.org/export/dump/cities500.zip";
const EUROPE = new Set(
  "AD AL AT AX BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM UA VA XK".split(
    " ",
  ),
);

const url = process.env.DATABASE_URL ?? process.env.POSTGRESQL_ADDON_URI;
if (!url) {
  console.error("No database configured: set DATABASE_URL");
  process.exit(1);
}

// --if-empty: used at every start of the app. Loads the list once and never stops the start if it fails.
const ifEmpty = process.argv.includes("--if-empty");
if (ifEmpty) {
  process.on("uncaughtException", (error) => {
    console.error(`places not loaded, the app starts without them: ${error.message}`);
    process.exit(0);
  });
  const probe = new pg.Client({ connectionString: url });
  await probe.connect();
  const { rows: found } = await probe.query("select 1 from places limit 1");
  await probe.end();
  if (found.length > 0) {
    console.log("places already loaded");
    process.exit(0);
  }
}

const fileFlag = process.argv.indexOf("--file");
let zipped;
if (fileFlag > -1) {
  zipped = readFileSync(process.argv[fileFlag + 1]);
} else {
  console.log(`downloading ${SOURCE}`);
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`GeoNames answered ${response.status}`);
  zipped = Buffer.from(await response.arrayBuffer());
}
const files = unzipSync(new Uint8Array(zipped));
const name = Object.keys(files).find((file) => file.endsWith(".txt"));
if (!name) throw new Error("No .txt file in the archive");

const rows = [];
for (const line of strFromU8(files[name]).split("\n")) {
  const f = line.split("\t");
  if (f.length < 15 || f[6] !== "P" || !EUROPE.has(f[8])) continue;
  const id = Number(f[0]);
  const lat = Number(f[4]);
  const lon = Number(f[5]);
  if (!Number.isInteger(id) || !Number.isFinite(lat) || !Number.isFinite(lon) || !f[1]) continue;
  if (f[8] === "RU" && lon > 60) continue;
  rows.push([id, f[1], f[2] || f[1], f[8], Number(f[14]) || 0, lat, lon]);
}
console.log(`${rows.length} European settlements in the dump`);

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  const BATCH = 1000;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const values = batch
      .map((_, r) => `(${[1, 2, 3, 4, 5, 6, 7].map((c) => `$${r * 7 + c}`).join(",")})`)
      .join(",");
    await client.query(
      `insert into places (id, name, ascii, country, population, lat, lon) values ${values}
       on conflict (id) do update set name = excluded.name, ascii = excluded.ascii, country = excluded.country,
         population = excluded.population, lat = excluded.lat, lon = excluded.lon`,
      batch.flat(),
    );
  }
  const { rows: count } = await client.query("select count(*)::int as n from places");
  console.log(`places table now holds ${count[0].n} settlements`);
} finally {
  await client.end();
}
