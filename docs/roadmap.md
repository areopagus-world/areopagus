# Roadmap

Each stage starts only when the previous one is in use. One developer cannot rebuild everything at once, so the order is strict.

## Stage 0. Foundations

- [x] Concept, architecture and governance written down
- [x] Monorepo, linting, tests, CI, local services
- [x] `journal`: hash-chained append-only journal
- [ ] Close the open decisions that block Stage 1 ([open decisions](open-decisions.md)); domain, languages, hosting and server framework are closed
- [x] Public page "Built together" on areopagus.world: the path, how to take part, support; nine languages
- [ ] Three screens designed and tested with three generations: map, space, question to a person
- [ ] An hour with a lawyer: DSA duties, the shop, joint projects with money, messaging
- [ ] Association statutes with the core written in; second founder

## Stage 1. One place

A person can create a space, list skills, join a community, find people on the map and ask a question.

- [x] `identity`: passkey sign-in and mail-link sign-in
- [ ] `identity`: vouching
- [x] `places`: settlements of Europe, the map of lights, a page per place
- [ ] `places`: boundaries of the first place from OpenStreetMap
- [x] `spaces`: address, name, place, skills, public page
- [ ] `spaces`: blocks, themes, three-value visibility, export
- [ ] `skills`: dictionary import, levels, confirmations
- [x] `communities`: create, join, leave, a timeline of its own
- [ ] `communities`: roles, rules, open ledger
- [x] `questions`: ask a person, a place or everyone; answers and thanks
- [x] `search`: people by skill and place, communities by description
- [x] `moderation`: reports, decisions with reasons, hide and restore
- [ ] `moderation`: appeals inside the network (by e-mail for now)
- [x] `chronology`: events, "continues" links, the timeline on space and community pages
- [x] `apps/web`: interface in English, French and Russian; the public page served as static files
- [ ] `apps/web`: PWA with offline cache and send queue
- [x] Nightly encrypted backups at a second provider (Scaleway), kept 30 days
- [ ] Monthly restore drill on record, status page

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
