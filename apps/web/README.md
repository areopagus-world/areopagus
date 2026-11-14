# apps/web

The network itself: a Next.js application backed by PostgreSQL.

## Run locally

```bash
pnpm services:up                      # PostgreSQL, Redis, Meilisearch in Docker
cp .env.example .env                  # once, at the repository root
pnpm --filter @areopagus/web migrate  # apply SQL migrations
pnpm --filter @areopagus/web dev      # http://localhost:3000
```

`GET /api/health` answers 200 only when the app and the database both respond.

## Migrations

Files in `migrations/` are named `NNNN_description.sql` and run in order, once, each in a transaction.
Never edit a migration that has been merged: add a new one. Follow expand then contract, so the previous
build keeps working against the new schema and a rollback of the code is always safe.

## Clever Cloud

Node.js application linked to this GitHub repository, with a PostgreSQL add-on. Environment variables:

| Variable               | Value                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| `APP_FOLDER`           | `apps/web`                                                        |
| `CC_NODE_BUILD_TOOL`   | `custom`                                                          |
| `CC_CUSTOM_BUILD_TOOL` | `corepack enable && pnpm install --frozen-lockfile && pnpm build` |
| `CC_PRE_RUN_HOOK`      | `node scripts/migrate.mjs`                                        |
| `CC_RUN_COMMAND`       | `pnpm start`                                                      |
| `CC_NODE_VERSION`      | `22`                                                              |

The PostgreSQL add-on injects `POSTGRESQL_ADDON_URI`, which the app reads when `DATABASE_URL` is not set.
