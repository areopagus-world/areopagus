# Roadmap

Each stage starts only when the previous one is in use. One developer cannot rebuild everything at once, so the order is strict.

## Stage 0. Foundations

- [x] Concept, architecture and governance written down
- [x] Monorepo, linting, tests, CI, local services
- [x] `journal`: hash-chained append-only journal
- [ ] Close the open decisions that block Stage 1 ([open decisions](open-decisions.md))
- [ ] Three screens designed and tested with three generations: map, space, question to a person
- [ ] An hour with a lawyer: DSA duties, the shop, joint projects with money, messaging
- [ ] Association statutes with the core written in; second founder

## Stage 1. One place

A person can create a space, list skills, join a community, find people on the map and ask a question.

- [ ] `identity`: passkey sign-in, mail-link fallback, vouching
- [ ] `places`: settlements and boundaries of the first place from OpenStreetMap and GeoNames
- [ ] `spaces`: space of blocks, themes, three-value visibility, export
- [ ] `skills`: dictionary import, levels, confirmations
- [ ] `communities`: members, roles, rules, open ledger
- [ ] `questions`: ask a person, a place or a topic; answers and thanks
- [ ] `search`: people by skill and place
- [ ] `moderation`: reports, decisions with explanations, appeals
- [ ] `apps/web`: static public pages, PWA with offline cache and send queue
- [ ] Backups at a second provider, weekly restore test, status page

## Stage 2. Several places

- [ ] `governance`: votes, delegated voices, mandates
- [ ] `shop` and `payments`: shopfronts, orders, Stripe Connect, buyer reviews
- [ ] Skill map and the profile of a place
- [ ] `messaging`: Matrix homeserver, encrypted chats, community chats, bots
- [ ] Stages of development for communities, tested on three real communities first
- [ ] External security audit before voting and the shop open
- [ ] A second person with access; two-person rule for dangerous operations

## Stage 3. Country and beyond

- [ ] `projects`: joint projects, tasks, files, shares
- [ ] Events and fundraising for places
- [ ] `library`: Scripture and the library from the earlier charter
- [ ] `federation`: ActivityPub
- [ ] Mobile app, voice and video calls
- [ ] Cryptographic secret voting, bug bounty

## Later

- Chronological feed and interest groups, with no engagement algorithm
- The world beyond Europe on the same levels and rules
