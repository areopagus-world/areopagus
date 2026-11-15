# 0003. No scoring of individual people

- Status: Accepted
- Date: 2026-11-14

## Context

An earlier draft gave every profile a level computed from behaviour using a model of value levels, first visible, then hidden. A hidden score contradicts the core rule of truth. Any score ranks people, which contradicts the rule of dignity. Legally, an automated profile of a person's values in a network built on Christian values is close to data about beliefs (GDPR art. 9) and, if it affected anything, to automated decision-making (art. 22).

## Decision

A person has no level, score or rating: not open, not hidden, not opt-in. The level model is applied only to communities and places, openly, as a profile of what has been built. A space shows what its owner took part in.

## Consequences

- No profiling of individuals, so the related legal risk does not arise.
- Recognition has to come from deeds, thanks in words and named roles.
- Routing a question to the right person uses skills, place and how past answers were received, not a psychological profile.
- No leaderboards, follower counts or like counts anywhere in the product.

## Alternatives considered

- **Visible level on every profile.** Ranks people and invites gaming.
- **Hidden score used for matching.** Dishonest toward members and legally the riskiest option.
- **Opt-in private profile.** Legally possible, but still measures people; dropped by the founder's decision.
