/* global URL */
// The catalog of open data sources: reading it, checking it, naming what is fetched.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const CATALOG_PATH = fileURLToPath(new URL("../../data/sources.json", import.meta.url));

/** Publishers the catalog may point at. A file may still redirect elsewhere once requested. */
export const ALLOWED_HOSTS = ["www.insee.fr", "api.insee.fr", "www.data.gouv.fr"];

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const REQUIRED = ["id", "title", "publisher", "licence", "attribution", "page", "grain"];

export function loadCatalog(path = CATALOG_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function checkUrl(value, what) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return `${what}: not a URL`;
  }
  if (url.protocol !== "https:") return `${what}: must be https`;
  if (!ALLOWED_HOSTS.includes(url.hostname)) return `${what}: host ${url.hostname} is not allowed`;
  return undefined;
}

/** Everything wrong with the catalog, as sentences. An empty list means it can be fetched. */
export function checkCatalog(catalog) {
  const problems = [];
  const sources = catalog?.sources;
  if (!Array.isArray(sources) || sources.length === 0) return ["the catalog has no sources"];
  const ids = new Set();
  for (const [i, source] of sources.entries()) {
    const at = typeof source?.id === "string" ? source.id : `source ${i + 1}`;
    for (const key of REQUIRED) {
      if (typeof source?.[key] !== "string" || source[key].trim() === "") {
        problems.push(`${at}: ${key} is missing`);
      }
    }
    if (typeof source?.id === "string") {
      if (!ID.test(source.id)) problems.push(`${at}: id must be lowercase words joined by hyphens`);
      if (ids.has(source.id)) problems.push(`${at}: id is used twice`);
      ids.add(source.id);
    }
    if (typeof source?.page === "string") {
      const bad = checkUrl(source.page, `${at}: page`);
      if (bad) problems.push(bad);
    }
    const files = source?.files;
    if (!Array.isArray(files) || files.length === 0) {
      problems.push(`${at}: no files`);
      continue;
    }
    const names = new Set();
    for (const file of files) {
      const name = typeof file?.name === "string" ? file.name : "";
      if (!FILE_NAME.test(name)) problems.push(`${at}: file name "${name}" is not a plain name`);
      if (names.has(name)) problems.push(`${at}: file name "${name}" is used twice`);
      names.add(name);
      const bad = checkUrl(file?.url, `${at}: ${name || "file"}`);
      if (bad) problems.push(bad);
    }
  }
  return problems;
}

/**
 * Where a fetched file lives in the bucket. The hash is part of the name, so a file that has not
 * changed since the last run lands on the same key and a changed one never overwrites the old.
 */
export function objectKey(sourceId, name, sha256) {
  if (!ID.test(sourceId)) throw new Error(`bad source id: ${sourceId}`);
  if (!FILE_NAME.test(name)) throw new Error(`bad file name: ${name}`);
  if (!/^[0-9a-f]{64}$/.test(sha256)) throw new Error("bad sha256");
  return `raw/${sourceId}/${sha256.slice(0, 12)}-${name}`;
}

/** The sources to fetch: all of them, or the one asked for. */
export function selectSources(catalog, only) {
  const wanted = (only ?? "").trim();
  if (wanted === "") return catalog.sources;
  const found = catalog.sources.filter((source) => source.id === wanted);
  if (found.length === 0) throw new Error(`no source with id "${wanted}"`);
  return found;
}
