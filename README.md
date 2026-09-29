# Areopagus

Open infrastructure for Christians around the world: Scripture in parallel translations, the library of the undivided Church, an interactive map and timeline of Christian history, a map of the Christian world today, community pages, prayer and transparent fundraising.

> "Then Paul stood in the middle of the Areopagus and said..." (Acts 17:22)

Paul spoke at the Areopagus to people who did not share his beliefs, in a place where ideas were debated in the open. That is what this project aims to be: a common square, not a church.

## What Areopagus is

- **Infrastructure, not a platform.** Like email, it belongs to no one. Anyone can run a node; a diocese, parish or mission keeps its own data and rules and still sees everyone else.
- **Open.** Code under AGPL-3.0. Reference data under CC0, community-contributed content under CC BY-SA 4.0.
- **Federated.** ActivityPub from the first version.
- **Neutral between traditions.** Every user stays in their own tradition. Tradition and language are attributes of every object, not interface settings.
- **Rooted in the shared heritage.** The content starts with what all Christians accept: Scripture, the Ecumenical Councils, the Fathers and martyrs of the first millennium. Later history is added in layers, labelled by tradition, with sources.

## What Areopagus is not

- Not a church, a denomination or a theological authority. The platform shows what Scripture and the traditions say; it does not rule on questions of faith.
- Not a payment processor. Donations go directly to recipients.
- Not an advertising business. There are no ads and there will be none.

## Community catalogue criterion

A community is listed as Christian in the catalogue if it confesses the Nicene-Constantinopolitan Creed (381). This is a classification inherited from the Councils, not a judgement made by the platform.

## Status

Early. Nothing is built yet. The first public milestone is a map of Christian places of worship built from OpenStreetMap data.

Roadmap for the first three months:

1. Map of places of worship from OpenStreetMap, coloured by tradition
2. Stable text addressing (`bible/gen/1/1`) and Scripture in English, French and Russian with parallel reading
3. Skeleton of first-millennium history from Wikidata on the map and timeline
4. Daily liturgical calendar, personal prayer book and notes, offline-capable PWA
5. Community pages: schedule, announcements, location

## Stack

TypeScript modular monolith: Next.js, Node, PostgreSQL with PostGIS and pgvector, Redis, Meilisearch, S3-compatible storage hosted in the EU. Mobile via Expo.

## Contributing

Developers, translators, historians, theologians and editors are all needed; code is about a third of the work. See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## Governance

Areopagus is being set up as a non-profit association under French law (loi 1901). The founder acts as technical lead, not owner, and intends to step back once the project can stand on its own.

## Licence

Code: [AGPL-3.0](LICENSE). Data: CC0 for reference datasets, CC BY-SA 4.0 for community contributions. Third-party texts keep their own licences, listed per source.

Contact: [areopagus.world](https://areopagus.world)
