# Translations of the public page

One file per language. `en.json` is the source: every other file has the same keys in the same order.

## Adding or fixing a language

1. Copy `en.json` to `<code>.json` (ISO 639-1 code) and translate the values. Keep `{a}` and `{b}`.
2. Run `pnpm site:check`. It verifies keys, placeholders, punctuation and length.
3. Run `pnpm site:build` and open `apps/site/dist/<code>/index.html`.
4. Open a pull request. Say whether you are a native speaker.

Write the way people speak. Do not translate word for word: if English says it in a way your language would not,
say it your way and keep the meaning.

## Three levels of checking

| Level           | What it catches                                | How                           |
| --------------- | ---------------------------------------------- | ----------------------------- |
| Structure       | Missing keys, lost placeholders, text too long | `pnpm site:check`, runs in CI |
| Editor (Claude) | Translated-sounding phrases, wrong register    | `pnpm site:review`, by hand   |
| Native speaker  | Everything a machine misses                    | A person, in a pull request   |

## Status

| Language   | Code | Written by | Editor review | Native review |
| ---------- | ---- | ---------- | ------------- | ------------- |
| English    | en   | Claude     | no            | no            |
| Français   | fr   | Claude     | no            | no            |
| Deutsch    | de   | Claude     | no            | no            |
| Español    | es   | Claude     | no            | no            |
| Italiano   | it   | Claude     | no            | no            |
| Português  | pt   | Claude     | no            | no            |
| Nederlands | nl   | Claude     | no            | no            |
| Polski     | pl   | Claude     | no            | no            |
| Русский    | ru   | Claude     | no            | founder       |

A language counts as checked only when a native speaker has read it on the live page.
