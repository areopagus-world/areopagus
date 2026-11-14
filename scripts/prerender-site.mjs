/* global URL, console */
// Writes the English text into apps/site/index.html so the page reads without JavaScript.
// Run after changing ROADMAP or T in that file: `pnpm site:prerender`.
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../apps/site/index.html", import.meta.url);
let html = readFileSync(file, "utf8");

const start = html.indexOf("const ROADMAP");
const end = html.indexOf("const el =");
if (start < 0 || end < 0) throw new Error("ROADMAP/T block not found in apps/site/index.html");
const { ROADMAP, T } = new Function(`${html.slice(start, end)}; return { ROADMAP, T };`)();
const t = T.en;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fill = (name, inner) => {
  const re = new RegExp(`(<!--pre:${name}-->)[\\s\\S]*?(<!--/pre-->)`);
  if (!re.test(html)) throw new Error(`marker ${name} not found`);
  html = html.replace(re, (_, a, b) => a + inner + b);
};

let total = 0;
let done = 0;
let nodes = '<div class="lit"></div>';
for (const group of ROADMAP) {
  nodes += `<div class="stage">${esc(group.stage.en)}</div>`;
  for (const [state, title] of group.nodes) {
    nodes += `<div class="node ${state}"><b>${esc(title.en)}</b><small>${esc(t.state[state])}</small></div>`;
    total += 1;
    if (state === "done") done += 1;
  }
}
fill("nodes", nodes);
fill(
  "ways",
  t.ways.map(([h, p]) => `<li><div><h3>${esc(h)}</h3><p>${esc(p)}</p></div></li>`).join(""),
);
fill("rules", t.rules.map((r) => `<li>${esc(r)}</li>`).join(""));
fill("count", esc(t.count.replace("{a}", done).replace("{b}", total)));

html = html.replace(/(data-i18n="(\w+)"[^>]*>)[^<]*(<)/g, (m, a, key, b) =>
  typeof t[key] === "string" ? a + esc(t[key]) + b : m,
);
html = html.replace(
  /(data-i18n-html="(\w+)"[^>]*>)[\s\S]*?(<\/h1>)/g,
  (m, a, key, b) => a + t[key] + b,
);

writeFileSync(file, html);
console.log(`prerendered: ${done} of ${total} lit`);
