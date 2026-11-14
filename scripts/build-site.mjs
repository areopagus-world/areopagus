/* global URL, console, process */
// Builds apps/site/dist: one static page per language, readable without JavaScript.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { pathFor, renderPage } from "../apps/site/src/page.mjs";
import { checkLocale, DEFAULT_LANG, loadLocales, SITE } from "./site-locales.mjs";

const { langs, locales } = loadLocales();
const failed = langs.flatMap((code) =>
  checkLocale(code, locales[code], locales[DEFAULT_LANG]).map((problem) => `${code}: ${problem}`),
);
if (failed.length > 0) {
  console.error(failed.join("\n"));
  process.exit(1);
}

// French puts a no-break space before double punctuation.
function french(value) {
  if (typeof value === "string") return value.replace(/ ([:;!?»])/g, " $1").replace(/« /g, "« ");
  if (Array.isArray(value)) return value.map(french);
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, french(child)]));
}

const roadmap = JSON.parse(readFileSync(new URL("src/roadmap.json", SITE), "utf8"));
const css = readFileSync(new URL("src/style.css", SITE), "utf8")
  .trimEnd()
  .replace(/^(?=.)/gm, "      ");
const dist = new URL("dist/", SITE);

rmSync(dist, { recursive: true, force: true });
cpSync(new URL("public/", SITE), dist, { recursive: true });
for (const lang of langs) {
  const t = lang === "fr" ? french(locales[lang]) : locales[lang];
  const dir = new URL(`.${pathFor(lang, DEFAULT_LANG)}`, dist);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    new URL("index.html", dir),
    renderPage({ lang, t, langs, defaultLang: DEFAULT_LANG, roadmap, css }),
  );
}
console.log(`built ${langs.length} languages: ${langs.join(", ")}`);
