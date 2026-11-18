/* global console, process, fetch, setTimeout */
// Fetches the open data files of the catalog as published, hashes them and writes a manifest.
// Nothing is unpacked or changed here: this is the raw layer. See docs/runbooks/open-data.md.
//
//   node scripts/data/fetch.mjs --out .data
//   DATA_ONLY=rpls-iris-2022 node scripts/data/fetch.mjs --out .data
import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { checkCatalog, loadCatalog, objectKey, selectSources } from "./catalog.mjs";

const USER_AGENT = "areopagus-open-data (+https://areopagus.world)";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Why a fetch failed, with the network's own word for it when there is one. */
function reason(error) {
  if (!(error instanceof Error)) return String(error);
  const code = error.cause?.code;
  return typeof code === "string" ? `${error.message} (${code})` : error.message;
}

/** Streams one URL to a file. Returns its size, hash and what the server said about it. */
export async function download(url, path, { attempts = 3, waitMs = 2000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });
      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
      const hash = createHash("sha256");
      let bytes = 0;
      const meter = new Transform({
        transform(chunk, _encoding, done) {
          hash.update(chunk);
          bytes += chunk.length;
          done(null, chunk);
        },
      });
      await mkdir(dirname(path), { recursive: true });
      await pipeline(Readable.fromWeb(response.body), meter, createWriteStream(path));
      if (bytes === 0) throw new Error("empty file");
      return {
        bytes,
        sha256: hash.digest("hex"),
        finalUrl: response.url,
        lastModified: response.headers.get("last-modified"),
        etag: response.headers.get("etag"),
      };
    } catch (error) {
      lastError = error;
      await rm(path, { force: true });
      if (attempt < attempts) await sleep(waitMs * attempt);
    }
  }
  throw lastError;
}

/**
 * Fetches every file of the given sources into `out` and returns the manifest.
 * A file that fails is listed under `failures`; the others are still kept.
 */
export async function fetchSources(sources, out, { now = new Date(), log = () => {}, retry } = {}) {
  const manifest = { generatedAt: now.toISOString(), sources: [], failures: [] };
  for (const source of sources) {
    const { files, ...about } = source;
    const fetched = [];
    for (const file of files) {
      const temp = join(out, "tmp", `${source.id}-${file.name}`);
      try {
        const result = await download(file.url, temp, retry);
        const key = objectKey(source.id, file.name, result.sha256);
        const target = join(out, key);
        await mkdir(dirname(target), { recursive: true });
        await rename(temp, target);
        fetched.push({ name: file.name, url: file.url, key, ...result });
        log(`${source.id}/${file.name}: ${result.bytes} bytes`);
      } catch (error) {
        const message = reason(error);
        manifest.failures.push({ id: source.id, name: file.name, url: file.url, error: message });
        log(`${source.id}/${file.name}: FAILED, ${message}`);
      }
    }
    manifest.sources.push({ ...about, fetchedAt: now.toISOString(), files: fetched });
  }
  await rm(join(out, "tmp"), { recursive: true, force: true });
  return manifest;
}

/** The manifest's file name: sortable, one per run. */
export function manifestName(now) {
  return `manifests/${now.toISOString().replace(/[:.]/g, "-")}.json`;
}

async function main() {
  const args = process.argv.slice(2);
  const outAt = args.indexOf("--out");
  const out = outAt >= 0 && args[outAt + 1] ? args[outAt + 1] : ".data";
  const catalog = loadCatalog();
  const problems = checkCatalog(catalog);
  if (problems.length > 0) {
    console.error(`data/sources.json:\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
  const now = new Date();
  const sources = selectSources(catalog, process.env.DATA_ONLY);
  const manifest = await fetchSources(sources, out, { now, log: console.log });
  const path = join(out, manifestName(now));
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`manifest: ${path}`);
  if (manifest.failures.length > 0) {
    console.error(`${manifest.failures.length} file(s) could not be fetched`);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
