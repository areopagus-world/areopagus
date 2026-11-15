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
| Français   | fr   | Claude     | 2026-11-14    | no            |
| Deutsch    | de   | Claude     | 2026-11-14    | no            |
| Español    | es   | Claude     | 2026-11-14    | no            |
| Italiano   | it   | Claude     | 2026-11-14    | no            |
| Português  | pt   | Claude     | 2026-11-14    | no            |
| Nederlands | nl   | Claude     | 2026-11-14    | no            |
| Polski     | pl   | Claude     | 2026-11-14    | no            |
| Русский    | ru   | Claude     | 2026-11-14    | founder       |

A language counts as checked only when a native speaker has read it on the live page.

The station section (keys `stationTitle` to `stationNote`) was added on 2026-11-15 in all nine languages. It has not had
an editor pass or a native review yet.

Scripture on the site (`stationVerse` and the quotes in `legend`) comes from an old public translation in each
language, never from our own translation: World English Bible (en), Louis Segond 1910 (fr), Luther 1912 (de),
Reina-Valera 1909 (es), Riveduta 1927 (it), Bíblia Livre, CC BY 4.0 Brasil (pt), Statenvertaling (nl), Biblia Gdańska
(pl), Synodal (ru). Keep the wording as printed there; only the final punctuation of a cut verse may change, and the
Portuguese credit says so, as its licence asks.

The `legend` keys (the legend page at `/legend/`) were added on 2026-11-15 in all nine languages. Like the station
section, they have not had an editor pass or a native review yet.
