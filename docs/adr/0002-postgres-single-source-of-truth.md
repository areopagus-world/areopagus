# 0002. PostgreSQL as the single source of truth

- Status: Accepted
- Date: 2026-11-14

## Context

The network must survive the loss of any one part and must be restorable by one or two people from a runbook. The more stores hold data that exists nowhere else, the harder that is.

## Decision

Everything of value lives in PostgreSQL. Queues, the search index and the page cache are derived from it and can be dropped and rebuilt. Money, votes and administrator actions are written to an append-only hash-chained journal in the same database, and its head hash is published daily outside the platform.

## Consequences

- One store to replicate, archive and restore; one restore test proves recoverability.
- Events use a transactional outbox, so nothing depends on the queue being durable.
- No blockchain and no token, as the charter decided: the hash chain plus a public anchor gives tamper evidence without them.
- PostgreSQL is the scaling limit. Read replicas and, later, extracting heavy modules are the way past it.

## Alternatives considered

- **A separate event store or message broker as the source of truth.** A second system that must never lose data.
- **A public blockchain for the ledger.** Legal risk and speculation for no gain over a published hash.
