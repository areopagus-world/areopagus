# Architecture

Areopagus is a modular monolith in TypeScript with one PostgreSQL database as the source of truth. Everything else can be lost and rebuilt. Public pages are served as static files, so the network stays readable when the servers are down. New services arrive as modules that subscribe to events and never touch another module's tables.

## Layers

```
Device          PWA and app: page cache, send queue, message encryption keys; works offline
   |
Edge (EU)       overload protection, rate limits, prebuilt public pages
   |
   +-------------------------------+
   |                               |
Application                     Messaging server
modular monolith,               Matrix protocol, ciphertext only,
stateless servers               its own PostgreSQL
   |
   +---------------+----------------+
   |               |                |
PostgreSQL      Queues, search    Files
all the truth   Redis,            object storage in the EU,
primary +       Meilisearch,      versioned; chat attachments
sync replica,   rebuilt from      are encrypted
hash-chained    the database
journal
   |                                |
Second provider (EU)
database archive and file copies under deletion lock; restore tested weekly
```

## Modules

A module owns its tables and talks to other modules only through its public entry point and through events.

| Module        | Responsibility                                                               | Stage |
| ------------- | ---------------------------------------------------------------------------- | ----- |
| identity      | Sign-in, sessions, confirmation of a space, vouching                         | 1     |
| spaces        | Spaces of people and communities, blocks, themes                             | 1     |
| places        | Map, hierarchy of places, place pages                                        | 1     |
| skills        | Skill dictionary, levels, confirmations, skill map                           | 1     |
| communities   | Members, roles, rules, stages of development                                 | 1     |
| questions     | Questions to people, answers, thanks                                         | 1     |
| search        | Search for people, skills, places; index built from events                   | 1     |
| moderation    | Reports, decisions, appeals, explanations                                    | 1     |
| journal       | Append-only hash-chained journal for money, votes and administrator actions  | 1     |
| notifications | Mail, push, digests                                                          | 1     |
| ai            | Translation, routing of questions, first line of moderation; model adapter   | 1     |
| governance    | Votes, delegated voices, mandates                                            | 2     |
| shop          | Shopfronts, orders, buyer reviews                                            | 2     |
| payments      | Stripe Connect adapter; the network holds no funds                           | 2     |
| messaging     | Links chats to spaces and communities, manages bots; Matrix server alongside | 2     |
| projects      | Joint projects, tasks, files, shares                                         | 3     |
| library       | Scripture and library from the earlier charter                               | 3     |
| federation    | ActivityPub, exchange with other nodes                                       | 3     |

### Module boundaries

- Each module has its own PostgreSQL schema and its own database role. There are no queries against another module's tables.
- A module announces what happened as an event ("space confirmed", "answer marked helpful", "order paid"). The event is written in the same transaction as the change (transactional outbox), so it survives a crash.
- Other modules subscribe through a BullMQ queue. Handlers are idempotent.
- The skill map, the profile of a place and the search index are read models built from events. They can be dropped and rebuilt.

### Extension points

- **Space blocks.** A registry of block types with a described data schema. A new block plugs in without changing `spaces`.
- **Open API and webhooks.** Versioned REST described in OpenAPI.
- **Feature flags.** A module is switched on for one place or community first, then for everyone.
- **Adapters.** Payments, mail, AI, search and file storage each sit behind one interface.
- **Extraction.** A module that outgrows the monolith is moved to its own process along the boundary that already exists.

## Data

| Store                             | Holds                                              | If lost                                           |
| --------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| PostgreSQL with PostGIS, pgvector | People, spaces, communities, votes, orders, events | Restored from the replica or from backup          |
| Object storage (EU)               | Photos, project files, exports                     | Restored from object versions and the second copy |
| Redis with BullMQ                 | Queues, rate limits, sessions                      | Queue rebuilt from the event table                |
| Meilisearch                       | Search index                                       | Rebuilt from PostgreSQL                           |
| Edge cache                        | Prebuilt public pages                              | Rebuilt on request                                |

Rules:

- Synchronous replica in a second data centre with automatic failover.
- Continuous archive of the transaction log at a second provider in the EU; point-in-time recovery.
- Backups under deletion lock. A restore is run and verified automatically every week.
- The journal for money, votes and administrator actions is a hash chain (`packages/journal`). The head hash is published daily in a public repository. There is no blockchain.
- Soft delete with a 30-day undo, then erasure. A GDPR erasure request erases at once.
- A person's place is stored to the settlement, never the address. Payment data and seller documents are held by Stripe.
- Delegations, ballots and stated faith are encrypted at field level on top of disk encryption.

## Messaging

Messaging uses the Matrix protocol with a homeserver in the EU. No cryptography is written in-house ([ADR 0005](adr/0005-matrix-for-messaging.md)).

- Olm for device-to-device channels and Megolm for rooms, both Double Ratchet constructions, through `vodozemac` in `matrix-rust-sdk`. Encryption and decryption happen only on the device.
- Key backup on the server, encrypted so the server cannot open it. New devices are verified from an existing one.
- Push notifications carry no message text.
- Personal and group chats are always encrypted. Public channels of a place are not encrypted and are labelled public.
- MLS (RFC 9420) is the upgrade path once Matrix clients ship it.

### Bots

- A bot belongs to the space of a person or community, is labelled as a bot and appears in the member list.
- A no-code builder for common flows; a Bot API (token, commands, buttons, signed webhooks) for developers.
- A bot holds only the permissions it was granted, and the list is visible to everyone in the chat.
- A bot never starts a personal chat.
- In an encrypted chat a bot is a participant with its own keys and reads messages in plaintext. Bots made in the builder run on Areopagus servers, so the network could technically read those conversations. The chat says so.

### What encryption changes elsewhere

- The server still sees who talks to whom and when. This is stated in the privacy policy and connection logs are kept for the minimum period.
- Moderators cannot read an encrypted chat. A participant reports and attaches the decrypted messages.
- AI translation is off by default in encrypted chats. A person may switch it on for themselves; their device then sends text to the model and the others see that translation is on.
- Losing every device and the recovery key loses the history for good.

## Fault tolerance

Targets for the first version (proposed): data loss of at most 5 minutes, recovery from the loss of a whole site within 4 hours.

| What fails            | What the person sees                            | What the system does                                             |
| --------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| One app server        | Nothing                                         | Load balancer drops it; at least two stateless servers           |
| Primary database      | Writes pause for up to a minute                 | Automatic failover to the synchronous replica                    |
| Database unavailable  | Read-only mode with an explanation              | Public pages from cache; actions queue on the device             |
| Redis and queues      | Notifications and search lag                    | Events wait in the database and are delivered later              |
| Search                | Simpler search by name and place                | Query falls back to PostgreSQL; index rebuilds in the background |
| Stripe                | Payment unavailable, everything else works      | Circuit breaker disables the pay button; order saved as unpaid   |
| AI model              | No translation or suggestions                   | Question goes to a manually chosen person                        |
| File storage          | New uploads fail                                | Existing files served from the edge cache                        |
| Messaging server      | Chats unavailable, everything else works        | Nothing else depends on it                                       |
| Whole data centre     | Static pages and the status page                | Restore at the second provider from the archive, by runbook      |
| The person's internet | Opened pages available; new work saved as draft | PWA keeps a cache and a send queue                               |

What makes this possible: static pages first, stateless servers, timeouts and circuit breakers on every external call, idempotency keys on every action with money or votes, two-step migrations, observability through OpenTelemetry, a status page hosted separately, and a failure drill every quarter.

The weakest point is not technical. It is one person with access. A second person who can bring the network up from the runbook is required before launch.

## Threats and measures

| Threat                               | Measure                                                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Request flood (DDoS)                 | Filtering at a European edge provider, static pages, rate limits per address and per account                          |
| Account takeover                     | Passkeys, no passwords; mail link as fallback; changes to mail and payouts need re-confirmation and wait a day        |
| Fake spaces to gain votes            | Voice only for a confirmed space; two confirmed people vouch, vouches are limited; 30-day wait before voting          |
| Capture through delegated voices     | Cap on one leader's share, one-year term, no re-delegation, the core is outside any vote                              |
| Tampering with a tally               | Votes written to the hash-chained journal; tally recomputable from anonymised records; admins cannot write to it      |
| Malicious code in a customised space | No custom HTML, CSS or scripts; themes are validated parameters; strict content security policy                       |
| Malicious files                      | Uploads on a separate domain, images re-encoded, location metadata stripped, antivirus scan                           |
| Spam and mass sign-up                | Limits on a new space, self-hosted proof-of-work challenge, AI first-line moderation                                  |
| Mass harvesting of personal data     | Limits on search and API; full lists of a place for signed-in members only; closed fields never in results            |
| Shop fraud                           | Seller checks and payments by Stripe Connect; signed webhooks only; reviews only from buyers                          |
| Administrator compromise or abuse    | Least privilege, hardware keys, every action journalled, dangerous operations need a second person                    |
| Database leak                        | Disk encryption plus field encryption, a database role per module, data minimisation                                  |
| Ransomware or destroyed backups      | Backups under deletion lock at a second provider, keys kept apart from the working site                               |
| Poisoned dependency                  | Pinned versions, automated vulnerability checks, few dependencies, build secrets unavailable to outside pull requests |
| Prompt injection into AI             | AI has no write access and sees no one else's closed data; its output is untrusted input; a person decides on bans    |
| Coordinated reports against a person | A report never hides content by itself; a burst of reports against one space is flagged as suspicious                 |
| Domain hijack                        | Registrar transfer lock, two-factor sign-in, the association as owner, three domains in different zones               |
| Pressure on the host or the founder  | Open code, exportable spaces and, later, federation: the network can be raised elsewhere                              |

Ballot secrecy in the first version rests on table separation and access rights, not cryptography: the database operator could link a ballot to a person. Cryptographic secret voting is a later stage with an external audit.

An external security audit is required before the shop and voting are opened.

## Interface principles and what they require

| For the person                                          | From the architecture                                                        |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Three ways in: Map, Ask, My space                       | Navigation does not grow with modules; new services are blocks or layers     |
| One page frame for a person, a community and a place    | One "space of blocks" model and one component set for web and mobile         |
| One "Ask" box for search and for a question to a person | One search index across modules; AI parses the query                         |
| Sign in without a password                              | Passkeys as the primary method in `identity`                                 |
| Undo instead of warnings                                | Soft delete and change history                                               |
| Actions land at once, even on a bad connection          | Optimistic UI, send queue on the device, idempotent requests                 |
| Features appear when needed                             | Feature flags by community stage and by role                                 |
| Errors in plain words with a next step                  | One translated error catalogue; an explained read-only mode                  |
| Few settings; closed by default                         | Three-value visibility on every block                                        |
| Own language for everyone                               | Multilingual data model from day one; cached translation                     |
| Fast on a cheap phone                                   | Static pages, a script-size budget, responsive images, speed check in CI     |
| Accessible                                              | WCAG 2.2 AA components, automated checks in CI, themes cannot break contrast |

## Stages

| Stage             | Launches                                         | Infrastructure                                                                                | Security                                                     |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1. One place      | Space with skills, communities, map, questions   | Two app servers, managed PostgreSQL with replica, archive at second provider, edge with cache | Passkeys, limits, journal, file checks, weekly restore test  |
| 2. Several places | Voting and leaders, shop, skill map, messaging   | Separate queue workers, read replica, status page, Matrix homeserver                          | External audit before launch, second person, two-person rule |
| 3. Country and on | Projects, library, federation, mobile app, calls | Second site on hot standby, heavy modules in their own processes                              | Cryptographic secret voting, bug bounty, yearly audit        |
