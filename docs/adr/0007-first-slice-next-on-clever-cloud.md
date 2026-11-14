# 0007. First slice: one Next.js app on Clever Cloud

- Status: Accepted
- Date: 2026-11-14

## Context

The first working slice of the network is the space: sign in, create a page with a name, a place and skills,
get a public address. One developer builds and runs it. The architecture document lists Next.js for the web
and a separate Node server (Fastify or NestJS) for the API.

## Decision

- Start with a single Next.js application in `apps/web`. Domain logic lives in `packages/*` modules and is
  called from route handlers and server actions. No separate API server until a second client needs one.
- Host on Clever Cloud (France): Node.js runtime, managed PostgreSQL with PostGIS and pgvector.
- Sign-in by e-mail link, then passkey. No passwords.
- A space lives at `areopagus.world/<name>`. A custom domain is added on top by subscription.
- While the slice is built, the app runs at `beta.areopagus.world`. The apex moves to the app when the
  space is ready; the public page stays reachable.
- Schema changes are plain SQL files in `apps/web/migrations`, applied in order on every deploy by
  `apps/web/scripts/migrate.mjs`, each in its own transaction.

## Consequences

- One process to deploy, watch and roll back. Module boundaries are kept by the lint rule, so splitting out
  an API server later is a move of files, not a rewrite.
- Background work (mail, federation, video) will need a worker process. It is added when the first job exists.
- Clever Cloud has no built-in preview per branch. Previews are a second small app fed from a `preview`
  branch, added when needed.
