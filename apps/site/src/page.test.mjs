/* global URL */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_LANG, loadLocales, SITE } from "../../../scripts/site-locales.mjs";
import { HERO, heroBase, renderPage } from "./page.mjs";

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
    for (const file of [`${HERO}-1280.webp`, `${HERO}-1920.webp`, `${HERO}.webm`, `${HERO}.mp4`]) {
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
    expect(html).toMatch(/data-src="[^"]+\.mp4"/);
    expect(html).toContain("prefers-reduced-motion: reduce");
  });

  it("credits the Earth imagery", () => {
    expect(page(true)).toContain("NASA Earth Observatory");
  });
});
