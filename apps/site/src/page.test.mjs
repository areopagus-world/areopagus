/* global URL */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_LANG, loadLocales, SITE } from "../../../scripts/site-locales.mjs";
import { HERO, heroBase, quote, renderPage } from "./page.mjs";

const { langs, locales } = loadLocales();
const roadmap = JSON.parse(readFileSync(new URL("src/roadmap.json", SITE), "utf8"));
const page = (app) =>
  renderPage({
    lang: "en",
    t: locales.en,
    langs,
    defaultLang: DEFAULT_LANG,
    roadmap,
    css: "",
    app,
  });

describe("station hero", () => {
  it("ships every file the page points to", () => {
    const files = [
      "1280.webp",
      "1920.webp",
      "2560.webp",
      "1920.webm",
      "2560.webm",
      "1920.mp4",
      "2560.mp4",
    ];
    for (const file of files.map((name) => `${HERO}-${name}`)) {
      expect(existsSync(new URL(`hero/${file}`, SITE)), file).toBe(true);
    }
  });

  it("points at the app's copy when the app serves the page", () => {
    expect(heroBase(true)).toBe("/site/hero");
    expect(heroBase(false)).toBe("/hero");
    expect(page(true)).toContain(`/site/hero/${HERO}-1920.webp`);
    expect(page(false)).toContain(`src="/hero/${HERO}-1920.webp"`);
  });

  it("does not download the loop until the script decides it may play", () => {
    const html = page(true);
    expect(html).toContain('preload="none"');
    expect(html).not.toMatch(/<source src="[^"]+\.(mp4|webm)"/);
    expect(html).toMatch(/data-src="[^"]+-1920\.mp4"/);
    expect(html).toMatch(/data-hd="[^"]+-2560\.mp4"/);
    expect(html).toContain("prefers-reduced-motion: reduce");
  });

  it("credits the Earth imagery", () => {
    expect(page(true)).toContain("NASA Earth Observatory");
  });
});

describe("station legend", () => {
  it("comes right after the first screen, before the path", () => {
    const html = page(false);
    const station = html.indexOf('<section id="station">');
    expect(station).toBeGreaterThan(html.indexOf('class="credit"'));
    expect(station).toBeLessThan(html.indexOf('<section id="path">'));
  });

  it("is written in every language", () => {
    for (const lang of langs) {
      const html = renderPage({
        lang,
        t: locales[lang],
        langs,
        defaultLang: DEFAULT_LANG,
        roadmap,
        css: "",
      });
      for (const key of ["stationTitle", "earthTitle", "aboardTitle"]) {
        expect(html).toContain(locales[lang][key]);
      }
    }
  });

  it("quotes the Lord's Prayer in each language's own quotation marks", () => {
    expect(page(false)).toContain("\u201cLet your will be done on earth as it is in heaven\u201d");
    expect(quote("ru", "Да будет воля Твоя")).toBe("\u00abДа будет воля Твоя\u00bb");
    expect(quote("de", "Dein Wille")).toBe("\u201eDein Wille\u201c");
    for (const lang of langs) expect(locales[lang].stationVerseRef).toMatch(/6[:,]10$/);
  });

  it("says the way aboard comes after a legal review", () => {
    expect(locales.en.aboardText).toMatch(/after a legal review/);
  });
});
