# Areopagus

A European network of living people. Everyone has a space of their own, people find each other by skill and interest, ask each other directly, sell their work without a middleman and gather into communities that develop their towns and villages.

> "Then Paul stood in the middle of the Areopagus and said..." (Acts 17:22)

The Areopagus was a rock in Athens where people spoke in the open to those who did not share their beliefs. This project aims to be that kind of place: a common square that belongs to the people standing on it.

## Why

Many online services were good until they had owners to pay. Then listings became ads, feeds became bait and sellers became the product. Areopagus is built so that this cannot happen here: it is run by a non-profit association with no shares to sell, the fee ceiling is written into its core rules, the code is open and every space can be exported and taken elsewhere.

In an age of AI the network keeps one promise: there is a living person at the other end.

## What it is

- **A space for everyone.** A page that belongs to a person, a family, a workshop, a parish or a club, assembled from blocks and styled by its owner.
- **People ask people.** Search returns people, not pages. A question goes to someone who can answer it, and the answer stays on their space.
- **A map of Europe.** Country, region, town, village. Every place has a page showing who lives there, what they can do and what the place lacks.
- **Skills, labs and joint projects.** Skills come from a shared dictionary and are confirmed by people who worked with you. Labs gather people of one skill. Projects assemble a team by skill.
- **A shop without the squeeze.** Handmade goods and services. Listing is free, placement in search is never for sale, buyers stay with the seller.
- **Communities.** By place, by trade, by interest or by project. Each has its space, roles, rules, an open ledger and a visible path of development.
- **Encrypted messaging.** End-to-end encrypted chats and service bots, built on the Matrix protocol.

## What it stands on

Areopagus is built on Christian values, written as rules for how the network behaves rather than as a creed its members must hold. Anyone who accepts the rules may take part.

- The dignity of every person. Nobody is ranked, scored or sold.
- Truth. No dark patterns, fake reviews or hidden advertising.
- Service instead of retention. No endless feed and no engagement algorithms.
- Protection of children and the family.
- Mercy in moderation: rules known in advance, decisions explained, a way to appeal and a way back.
- Open to all. Faith is neither checked nor imposed.

The network is not a church, a denomination or a theological authority.

## Status

Early. The concept and the architecture are written down; the product is not built yet. The first version is a space with skills, communities, the map and questions to people, launched in one place.

- [Concept](docs/concept.md)
- [Architecture](docs/architecture.md)
- [Governance](docs/governance.md)
- [Roadmap](docs/roadmap.md)
- [Open decisions](docs/open-decisions.md)
- [Decision records](docs/adr/README.md)

## Stack

A TypeScript modular monolith: Next.js, Node, PostgreSQL with PostGIS and pgvector, Redis with BullMQ, Meilisearch, S3-compatible storage hosted in the EU, a Matrix homeserver for messaging. Mobile via Expo.

## Development

```sh
corepack enable
pnpm install
pnpm services:up   # PostgreSQL, Redis and Meilisearch in Docker
pnpm check         # lint, format, typecheck, tests
```

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Governance

Areopagus is being set up as a non-profit association under French law (loi 1901). The founder acts as technical lead, not owner, and intends to step back once the project can stand on its own.

## Licence

Code: [AGPL-3.0](LICENSE). Reference data: CC0. Community-contributed content: CC BY-SA 4.0. Third-party texts keep their own licences, listed per source.

Contact: hello@areopagus.world. Security: see [SECURITY.md](SECURITY.md).
