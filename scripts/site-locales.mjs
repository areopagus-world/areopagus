/* global URL */
// Shared helpers: load the locale files of the public site and check them against English.
import { readdirSync, readFileSync } from "node:fs";

export const SITE = new URL("../apps/site/", import.meta.url);
export const DEFAULT_LANG = "en";
// Order of the language switch. A locale file not listed here is appended alphabetically.
const ORDER = ["en", "fr", "de", "es", "it", "pt", "nl", "pl", "ru"];

export function loadLocales() {
  const dir = new URL("locales/", SITE);
  const found = readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -5));
  const langs = [
    ...ORDER.filter((code) => found.includes(code)),
    ...found.filter((code) => !ORDER.includes(code)).sort(),
  ];
  const locales = Object.fromEntries(
    langs.map((code) => [code, JSON.parse(readFileSync(new URL(`${code}.json`, dir), "utf8"))]),
  );
  return { langs, locales };
}

/** Flattens a locale into "path -> string" pairs, e.g. "ways.0.1". */
export function flatten(value, prefix = "", out = {}) {
  if (typeof value === "string") out[prefix] = value;
  else
    for (const [key, child] of Object.entries(value))
      flatten(child, prefix ? `${prefix}.${key}` : key, out);
  return out;
}

const SAME_AS_ENGLISH_OK = new Set(["name", "engDomain"]);
const BUTTONS = ["ctaPath", "ctaJoin", "ctaIdea", "ctaGive"];

/** Returns a list of problems for one locale compared with English. An empty list means it passes. */
export function checkLocale(code, locale, english) {
  const problems = [];
  const ref = flatten(english);
  const got = flatten(locale);
  for (const key of Object.keys(ref)) if (!(key in got)) problems.push(`${key}: missing`);
  for (const key of Object.keys(got)) if (!(key in ref)) problems.push(`${key}: not in English`);

  for (const [key, text] of Object.entries(got)) {
    if (!(key in ref)) continue;
    const source = ref[key];
    if (text.trim() === "") problems.push(`${key}: empty`);
    if (text !== text.trim()) problems.push(`${key}: leading or trailing space`);
    if (/\s{2,}/.test(text)) problems.push(`${key}: double space`);
    if (/[—–]/.test(text)) problems.push(`${key}: dash character, rephrase without it`);
    for (const mark of source.match(/\{\w+\}/g) ?? []) {
      if (!text.includes(mark)) problems.push(`${key}: placeholder ${mark} lost`);
    }
    if (source.endsWith(".") !== text.endsWith("."))
      problems.push(`${key}: final full stop differs from English`);
    const untranslated =
      code !== DEFAULT_LANG &&
      text === source &&
      !SAME_AS_ENGLISH_OK.has(key) &&
      source.includes(" ");
    if (untranslated) problems.push(`${key}: identical to English, probably untranslated`);
    if (text.length > Math.max(source.length * 2.2, source.length + 24)) {
      problems.push(`${key}: more than twice as long as English, will not fit`);
    }
  }
  for (const key of BUTTONS) {
    if ((got[key] ?? "").length > 34) problems.push(`${key}: button text over 34 characters`);
  }
  return problems;
}
