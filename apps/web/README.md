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
| `CC_PRE_BUILD_HOOK`    | `npm install --global pnpm@10.28.0`                                                 |
| `CC_CUSTOM_BUILD_TOOL` | `pnpm install --frozen-lockfile --prod=false && pnpm --filter @areopagus/web build` |
| `CC_PRE_RUN_HOOK`      | `npm install --global pnpm@10.28.0 && pnpm --filter @areopagus/web migrate`         |
| `CC_RUN_COMMAND`       | `pnpm start`                                                                        |

The PostgreSQL add-on injects `POSTGRESQL_ADDON_URI`, which the app reads when `DATABASE_URL` is not set.

A restart reuses the cached build and skips the build hooks, so the run hook installs pnpm itself.

GitHub side: repository variable `CLEVER_APP_ID`, secrets `CLEVER_TOKEN` and `CLEVER_SECRET`
(from `~/.config/clever-cloud/clever-tools.json`; they expire after one year).

## Sign-in

By e-mail link: a person enters an address, receives a link that works once and for 15 minutes,
and confirms with one button. Only hashes of links and sessions are stored. Passkeys come next.

Sign-in ships switched off. Application variables:

| Variable              | Value                                                             |
| --------------------- | ----------------------------------------------------------------- |
| `AUTH_ENABLED`        | `true` to switch sign-in on                                       |
| `AUTH_ALLOWED_EMAILS` | Comma-separated first circle; empty means everyone may sign in    |
| `APP_ORIGIN`          | Public address, e.g. `https://beta.areopagus.world`               |
| `SMTP_HOST`           | Mail server; without SMTP settings the link is written to the log |
| `SMTP_PORT`           | `587` by default                                                  |
| `SMTP_USER`           | Mail account                                                      |
| `SMTP_PASS`           | Mail secret                                                       |
| `MAIL_FROM`           | Sender, e.g. `Areopagus <hello@areopagus.world>`                  |

Do not open sign-in to everyone before the privacy notice is published: an e-mail address is personal data.
