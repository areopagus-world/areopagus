# Security

## Reporting a problem

Report privately, not in a public issue:

- GitHub: [open a private advisory](https://github.com/areopagus-world/areopagus/security/advisories/new)
- Email: security@areopagus.world

Include what you found, how to reproduce it and what an attacker could do with it. You will get an answer within five working days. Please give us reasonable time to fix the problem before you publish it.

Research done in good faith, without reading or changing other people's data and without degrading the service, will not be met with legal action.

## What matters most here

Three parts of Areopagus are worth more to an attacker than an ordinary site:

1. **Votes and delegated voices.** Fake spaces, tampering with tallies, linking a ballot to a person.
2. **Customisable spaces.** Anything that lets one person's page run code in another person's browser.
3. **Money in the shop.** Payment flows, payout details, forged webhooks.

The threat model and the measures against each threat are in [docs/architecture.md](docs/architecture.md#threats-and-measures).

## Status

Nothing is in production yet. An external security audit is required before voting and the shop are opened.
