# 0001. Modular monolith

- Status: Accepted
- Date: 2026-09-23

## Context

The project starts with one developer and no outside funding. It will grow many services: spaces, map, questions, shop, voting, messaging. Each must be addable without rewriting the rest.

## Decision

One deployable application in TypeScript, divided into modules. A module owns its tables, has its own database schema and role, and talks to other modules only through its public entry point and through events written to a transactional outbox.

## Consequences

- One thing to deploy, monitor and back up.
- A new service is a new module subscribing to existing events.
- The boundaries are enforced by the linter and by database roles, not by the network, so discipline is needed.
- A module that outgrows the monolith can be moved to its own process along its existing boundary.

## Alternatives considered

- **Microservices from the start.** Operational cost one person cannot carry; rejected in the original charter.
- **A monolith without boundaries.** Fast at first, then every change touches everything.
