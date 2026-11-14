# apps

Deployable applications. Nothing is here yet; this file reserves the layout.

| App      | What it is                                          | Stage |
| -------- | --------------------------------------------------- | ----- |
| `web`    | Next.js PWA: map, spaces, questions                 | 1     |
| `api`    | The modular monolith: HTTP API and queue workers    | 1     |
| `mobile` | Expo app sharing components and API client with web | 3     |

Domain logic does not live in an app. It lives in `packages/`, one package per module, and apps wire modules together. See [docs/architecture.md](../docs/architecture.md).
