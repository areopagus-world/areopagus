/* global URL */
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_LANG, loadLocales, SITE } from "../../../scripts/site-locales.mjs";
import { CHAPTERS, LEGEND_SIZES, LEGEND_VERSION, renderLegend } from "./legend.mjs";

const { langs, locales } = loadLocales();
const page = (lang, app = false) =>
  renderLegend({ lang, t: locales[lang], langs, defaultLang: DEFAULT_LANG, css: "", app });

describe("legend page", () => {
  it("ships every picture it points to", () => {
    for (const { id } of CHAPTERS) {
      for (const width of LEGEND_SIZES) {
        const file = new URL(`hero/legend/${id}-${LEGEND_VERSION}-${width}.webp`, SITE);
        expect(existsSync(file), file.pathname).toBe(true);
      }
    }
  });

  it("tells all eight chapters in every language, in order", () => {
    for (const lang of langs) {
      const html = page(lang);
      expect(locales[lang].legend.ch).toHaveLength(CHAPTERS.length);
      let last = -1;
      for (const { id } of CHAPTERS) {
        const at = html.indexOf(`id="${id}"`);
        expect(at).toBeGreaterThan(last);
        last = at;
      }
    }
  });

  it("loads only the first picture at once", () => {
    const html = page("en");
    expect(html.match(/fetchpriority="high"/g)).toHaveLength(1);
    expect(html.match(/loading="lazy"/g)).toHaveLength(CHAPTERS.length - 1);
  });

  it("links every language to its own legend and back to its main page", () => {
    const html = page("ru");
    expect(html).toContain('href="/fr/legend/"');
    expect(html).toContain('href="/legend/" hreflang="en"');
    expect(html).toContain('<a class="mark" href="/ru/">');
  });

  it("uses the app's copy of the pictures when the app serves the page", () => {
    expect(page("en", true)).toContain("/site/hero/legend/athens-");
    expect(page("en", false)).toContain('src="/hero/legend/athens-');
  });

  it("names its sources: NASA for the Earth and a Bible translation", () => {
    for (const lang of langs)
      expect(locales[lang].legend.credits).toContain("NASA Earth Observatory");
    expect(locales.pt.legend.credits).toContain("CC BY 4.0");
  });

  it("gives every picture a description", () => {
    for (const lang of langs) {
      for (const c of locales[lang].legend.ch) expect(c.alt.length).toBeGreaterThan(20);
    }
  });
});
