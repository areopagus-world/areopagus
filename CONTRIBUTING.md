# Contributing to Areopagus

The project needs more than code. If you can do any of the following, you are welcome:

- **Developers:** TypeScript, PostgreSQL/PostGIS, maps (MapLibre), Matrix, accessibility, offline-first PWA
- **Designers:** interfaces a teenager and a grandparent both understand in a minute
- **Translators:** interface and content, any European language
- **Security specialists:** threat modelling, review of voting and payment flows
- **Lawyers:** GDPR, the Digital Services Act, French association law, consumer law for marketplaces
- **Community people:** villages, parishes, workshops and clubs willing to try early versions

## How to start

1. Read the [README](README.md), the [concept](docs/concept.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).
2. Open an issue describing what you want to work on before a large change.
3. Keep pull requests small and focused.

## Development setup

You need Node 22, pnpm 10 and Docker.

```sh
corepack enable
pnpm install
cp .env.example .env
pnpm services:up
pnpm check
```

`pnpm check` runs the linter, the formatter check, the type checker and the tests. CI runs the same four steps on every pull request.

## How the code is organised

```
apps/        deployable applications (web, api, later mobile)
packages/    one package per module, plus shared libraries
docs/        concept, architecture, governance, roadmap, decision records
```

Three rules keep the codebase extensible:

1. **A module owns its tables.** No module reads or writes another module's tables.
2. **Modules talk through public entry points and events.** Import `@areopagus/journal`, never `@areopagus/journal/src/...`. The linter enforces this.
3. **External services sit behind adapters.** Payments, mail, AI, search and file storage can each be replaced by changing one file.

## Decisions

A choice that shapes the product or the architecture is recorded as an ADR in [docs/adr](docs/adr/README.md). Questions still open are listed in [docs/open-decisions.md](docs/open-decisions.md). If your change depends on an open question, raise it as a Decision issue first.

## Tests

New behaviour comes with tests. Anything touching money, votes or the journal needs tests for the failure cases as well as the success case.

## Data and texts

Only add texts and datasets that are in the public domain or under an open licence, and record the source and licence with each. When in doubt, open an issue first.

## Language

Code, commits and issues are in English. Discussions may be in any language; say which one you are writing in.
