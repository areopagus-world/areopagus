import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { fetchSources, manifestName } from "./fetch.mjs";

const BODY = "CODGEO;P22_LOG\n06088;230000\n";
const SHA = createHash("sha256").update(BODY).digest("hex");
const RETRY = { attempts: 3, waitMs: 1 };

let server;
let base;
let flaky = 0;

beforeAll(async () => {
  server = createServer((request, response) => {
    if (request.url === "/ok.csv") return response.end(BODY);
    if (request.url === "/moved.csv") {
      response.writeHead(302, { location: "/ok.csv" });
      return response.end();
    }
    if (request.url === "/flaky.csv") {
      flaky += 1;
      if (flaky < 3) {
        response.writeHead(503);
        return response.end();
      }
      return response.end(BODY);
    }
    if (request.url === "/empty.csv") return response.end();
    response.writeHead(404);
    response.end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

const source = (id, paths) => ({
  id,
  title: id,
  publisher: "Test",
  licence: "Licence Ouverte 2.0",
  attribution: "Test",
  page: `${base}/`,
  grain: "commune",
  files: paths.map((path) => ({ name: path.slice(1), url: `${base}${path}` })),
});

async function run(sources) {
  const out = await mkdtemp(join(tmpdir(), "areopagus-data-"));
  const now = new Date("2026-11-18T20:00:00.000Z");
  const manifest = await fetchSources(sources, out, { now, retry: RETRY });
  return { out, manifest };
}

describe("fetchSources", () => {
  it("keeps the file unchanged under a name that carries its hash", async () => {
    const { out, manifest } = await run([source("one", ["/ok.csv"])]);
    const [file] = manifest.sources[0].files;
    expect(file).toMatchObject({
      name: "ok.csv",
      key: `raw/one/${SHA.slice(0, 12)}-ok.csv`,
      bytes: BODY.length,
      sha256: SHA,
    });
    expect(await readFile(join(out, file.key), "utf8")).toBe(BODY);
    expect(manifest.failures).toEqual([]);
    expect(manifest.sources[0]).toMatchObject({
      licence: "Licence Ouverte 2.0",
      fetchedAt: manifest.generatedAt,
    });
    await rm(out, { recursive: true });
  });

  it("follows a redirect and records where the file really came from", async () => {
    const { out, manifest } = await run([source("one", ["/moved.csv"])]);
    const [file] = manifest.sources[0].files;
    expect(file.sha256).toBe(SHA);
    expect(file.finalUrl).toBe(`${base}/ok.csv`);
    await rm(out, { recursive: true });
  });

  it("tries again when the server stumbles", async () => {
    flaky = 0;
    const { out, manifest } = await run([source("one", ["/flaky.csv"])]);
    expect(manifest.failures).toEqual([]);
    expect(flaky).toBe(3);
    await rm(out, { recursive: true });
  });

  it("lists a file it could not fetch and still keeps the others", async () => {
    const { out, manifest } = await run([
      source("one", ["/missing.csv", "/ok.csv"]),
      source("two", ["/empty.csv"]),
    ]);
    expect(manifest.sources[0].files.map((f) => f.name)).toEqual(["ok.csv"]);
    expect(manifest.failures.map((f) => [f.id, f.name, f.error])).toEqual([
      ["one", "missing.csv", "HTTP 404"],
      ["two", "empty.csv", "empty file"],
    ]);
    expect(await readdir(out)).toEqual(["raw"]);
    await rm(out, { recursive: true });
  });
});

describe("manifestName", () => {
  it("is one sortable file per run", () => {
    expect(manifestName(new Date("2026-11-18T20:00:00.000Z"))).toBe(
      "manifests/2026-11-18T20-00-00-000Z.json",
    );
  });
});
