// The legend of the station as a page of its own: eight chapters told by pictures, read by scrolling.
// Works without JavaScript; pictures load lazily, the first one at once.
import { esc, heroBase, legendPath, ORIGIN, pathFor, quote } from "./page.mjs";

// Chapter pictures, in reading order. The first five are engravings of old Athens,
// the last three are photographs of the station. `focus` keeps the subject in view on narrow screens.
export const CHAPTERS = [
  { id: "athens", old: true, focus: "68%" },
  { id: "agora", old: true, focus: "64%" },
  { id: "altar", old: true, focus: "70%" },
  { id: "globe", old: true, focus: "64%" },
  { id: "night", old: true, focus: "62%" },
  { id: "cargo", old: false, focus: "45%" },
  { id: "dome", old: false, focus: "48%" },
  { id: "garden", old: false, focus: "50%" },
];
export const LEGEND_SIZES = [1280, 1920, 2560];
// Part of every file name, so a new set of pictures never meets an old one in a cache.
export const LEGEND_VERSION = "v1";
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function picture(media, id, alt, eager) {
  const base = `${media}/legend/${id}-${LEGEND_VERSION}`;
  const srcset = LEGEND_SIZES.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy"';
  return `<picture>
          <img src="${base}-1920.webp" srcset="${srcset}" sizes="100vw" width="1920" height="1080" alt="${esc(alt)}" ${loading} decoding="async" />
        </picture>`;
}

function chapter(lang, media, c, meta, index) {
  const verse = c.q
    ? `
          <blockquote class="verse"><p>${quote(lang, c.q)}</p><cite>${esc(c.r)}</cite></blockquote>`
    : "";
  const after = c.a ? `\n          <p>${esc(c.a)}</p>` : "";
  return `
      <section class="ch ${meta.old ? "old" : "now"}" id="${meta.id}" style="--focus: ${meta.focus}">
        ${picture(media, meta.id, c.alt, index === 0)}
        <div class="card">
          <p class="k"><span>${ROMAN[index]}</span>${esc(c.k)}</p>
          <h2>${esc(c.h)}</h2>
          <p>${esc(c.p)}</p>${verse}${after}
        </div>
      </section>`;
}

export function renderLegend({ lang, t, langs, names = {}, defaultLang, css, app = false }) {
  const L = t.legend;
  const media = heroBase(app);
  const alternates = langs
    .map(
      (code) =>
        `<link rel="alternate" hreflang="${code}" href="${ORIGIN}${legendPath(code, defaultLang)}" />`,
    )
    .join("\n    ");
  const nav = langs
    .map((code) => {
      const current = code === lang ? ' aria-current="page"' : "";
      return `<a href="${legendPath(code, defaultLang)}" hreflang="${code}" lang="${code}"${current}><span>${esc(names[code] ?? code)}</span><small>${code.toUpperCase()}</small></a>`;
    })
    .join("");
  const chapters = CHAPTERS.map((meta, i) => chapter(lang, media, L.ch[i], meta, i)).join("");
  const words = L.words
    .map(
      (w) => `
          <li>
            <blockquote class="verse"><p>${quote(lang, w.q)}</p><cite>${esc(w.r)}</cite></blockquote>
            <p class="rule">${esc(w.rule)}</p>
          </li>`,
    )
    .join("");
  const legal = app
    ? `<br /><a href="/legal">${esc(t.legal)}</a> · <a href="/privacy">${esc(t.privacy)}</a>`
    : "";

  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(L.title)} · Areopagus</title>
    <meta name="description" content="${esc(L.meta)}" />
    <link rel="canonical" href="${ORIGIN}${legendPath(lang, defaultLang)}" />
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${ORIGIN}/legend/" />
    <link rel="preconnect" href="https://fonts.bunny.net" />
    <link href="https://fonts.bunny.net/css?family=unbounded:500,800|golos-text:400,600" rel="stylesheet" />
    <style>
${css}
    </style>
  </head>
  <body class="legend">
    <div class="wrap">
      <header class="top">
        <a class="mark" href="${pathFor(lang, defaultLang)}"><i></i>AREOPAGUS</a>
        <details class="langs">
          <summary aria-label="Language: ${esc(names[lang] ?? lang)}">${lang.toUpperCase()}</summary>
          <nav aria-label="Language">${nav}</nav>
        </details>
      </header>
      <div class="intro">
        <h1>${esc(L.title)}</h1>
        <p class="lead">${esc(L.lead)}</p>
      </div>
    </div>
    <main>${chapters}
      <section class="words wrap">
        <h2>${esc(L.wordsTitle)}</h2>
        <ol>${words}
        </ol>
      </section>
    </main>
    <footer class="wrap">
      <p class="credits">${esc(L.credits)}</p>
      <p><a href="${pathFor(lang, defaultLang)}">${esc(L.back)}</a>${legal}</p>
    </footer>
  </body>
</html>
`;
}
