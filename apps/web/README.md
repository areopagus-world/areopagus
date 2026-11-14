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

A Node.js application with a PostgreSQL add-on. Clever Cloud has no access to GitHub: the
`deploy-web` workflow pushes the code after the checks pass, then calls `/api/health`.

Environment variables of the application:

| Variable               | Value                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `CC_NODE_VERSION`      | `22`                                                                                |
| `CC_NODE_BUILD_TOOL`   | `custom`                                                                            |
| `CC_PRE_BUILD_HOOK`    | `corepack enable pnpm`                                                              |
| `CC_CUSTOM_BUILD_TOOL` | `pnpm install --frozen-lockfile --prod=false && pnpm --filter @areopagus/web build` |
| `CC_PRE_RUN_HOOK`      | `pnpm --filter @areopagus/web migrate`                                              |
| `CC_RUN_COMMAND`       | `pnpm start`                                                                        |

The PostgreSQL add-on injects `POSTGRESQL_ADDON_URI`, which the app reads when `DATABASE_URL` is not set.

GitHub side: repository variable `CLEVER_APP_ID`, secrets `CLEVER_TOKEN` and `CLEVER_SECRET`
(from `~/.config/clever-cloud/clever-tools.json`; they expire after one year).
