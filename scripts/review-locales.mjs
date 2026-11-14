/* global URL, console, process, fetch */
// Asks Claude to read each translation as a native editor and report what sounds unnatural.
// Needs ANTHROPIC_API_KEY. Usage: pnpm site:review            (all languages)
//                                 pnpm site:review de pl      (only these)
// Writes apps/site/locales/review/<lang>.md. It never changes the translations itself.
import { mkdirSync, writeFileSync } from "node:fs";
import { DEFAULT_LANG, flatten, loadLocales, SITE } from "./site-locales.mjs";

const key = process.env.ANTHROPIC_API_KEY;
if (!key) {
  console.error("Set ANTHROPIC_API_KEY first.");
  process.exit(1);
}
const model = process.env.REVIEW_MODEL ?? "claude-opus-5-5";
const { langs, locales } = loadLocales();
const wanted = process.argv.slice(2);
const targets = langs.filter(
  (code) => code !== DEFAULT_LANG && (wanted.length === 0 || wanted.includes(code)),
);
const english = flatten(locales[DEFAULT_LANG]);
const out = new URL("locales/review/", SITE);
mkdirSync(out, { recursive: true });

const brief = `You are a native-speaking editor and copywriter. You review the translation of a short public web page
for Areopagus, a European network of real people: a page for everyone, a map of every town, a voice for everyone,
no ads, open code. The tone is direct, warm, plain, never corporate and never churchy. Readers are 15 to 60.

For every string judge four things:
1. Does it sound like something a native speaker would write, not like a translation?
2. Is the meaning the same as in English, with nothing added or lost?
3. Is the register consistent across the page (form of address, formality)?
4. Is spelling, grammar and local typography correct?

Answer in Markdown, in English, with exactly these sections:
## Verdict
One line: "natural", "minor issues" or "needs rework", and one sentence why.
## Issues
A table: key | current | problem | suggested text. Only real problems. If there are none, write "None".
## Register
The form of address used and whether it is right for this audience in this language.
Do not rewrite strings that are already good. Do not praise.`;

for (const code of targets) {
  const target = flatten(locales[code]);
  const rows = Object.keys(english)
    .map((k) => `${k}\n  EN: ${english[k]}\n  ${code.toUpperCase()}: ${target[k] ?? "(missing)"}`)
    .join("\n");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: brief,
      messages: [
        { role: "user", content: `Target language: ${locales[code].name} (${code}).\n\n${rows}` },
      ],
    }),
  });
  if (!response.ok) {
    console.error(`${code}: API answered ${response.status} ${await response.text()}`);
    process.exitCode = 1;
    continue;
  }
  const data = await response.json();
  const text = data.content.map((part) => part.text ?? "").join("");
  writeFileSync(
    new URL(`${code}.md`, out),
    `# Review: ${locales[code].name}\n\nModel: ${model}\n\n${text}\n`,
  );
  console.log(`${code}: ${(text.match(/## Verdict\s+(.*)/) ?? [])[1] ?? "written"}`);
}
