# Open decisions

Questions not yet decided. Each one becomes an ADR when it is closed. "Blocks" says what cannot start until then.

## Product

| #   | Question                                                        | Blocks             |
| --- | --------------------------------------------------------------- | ------------------ |
| 1   | Which place do we start in: one town, a département, a country? | Stage 1            |
| 2   | Main domain: areopagus.eu or areopagus.world?                   | Stage 1            |
| 3   | Interface languages of the first version                        | Stage 1            |
| 4   | How a space is confirmed: two vouches, phone, document?         | `identity`, voting |
| 5   | Who sits on the council of keepers and how it is formed         | Statutes           |
| 6   | Cap on entrusted voices for one leader: 10% or another share    | `governance`       |
| 7   | Ceiling on the fee from a sale                                  | `shop`, statutes   |
| 8   | ActivityPub federation in the first version or later            | Nothing in Stage 1 |
| 9   | Is the earlier charter archived or rewritten for this concept?  | Nothing            |

## Architecture

| #   | Question                                                                 | Blocks               |
| --- | ------------------------------------------------------------------------ | -------------------- |
| 10  | Hosting provider in the EU and a second provider for backups             | Stage 1              |
| 11  | Edge provider with overload protection, preferably European              | Stage 1              |
| 12  | Server framework: Fastify or NestJS                                      | `apps/api`           |
| 13  | Targets for data loss and recovery time: 5 minutes and 4 hours, or other | Backup design        |
| 14  | Who is the second person with access to the site                         | Launch               |
| 15  | AI model and where it runs                                               | `ai`, privacy policy |
| 16  | Matrix homeserver implementation                                         | `messaging`          |
| 17  | Federation with other Matrix servers                                     | Nothing in Stage 2   |
| 18  | Is the no-code bot builder in the first version of messaging?            | `messaging` scope    |

## Legal, to check with a lawyer

- Duties under the Digital Services Act and LCEN for a small platform.
- The shop: trader traceability (DSA art. 30), DAC7 reporting, consumer rights in distance selling, VAT rules for platforms.
- Paid services by a loi 1901 association: VAT and commercial taxes.
- Joint projects with shared revenue between private persons.
- Duties of a messaging service operator in the EU and France.
- Whether the European Accessibility Act applies to the shop.
