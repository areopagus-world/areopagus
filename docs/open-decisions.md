# Open decisions

Questions not yet decided. Each one becomes an ADR when it is closed. "Blocks" says what cannot start until then.

## Product

| #   | Question                                                                                          | Blocks                             |
| --- | ------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | Which place do we start in: one town, a département, a country?                                   | Stage 1                            |
| 4   | How a space is confirmed: two vouches, phone, document?                                           | `identity`, voting                 |
| 5   | Who sits on the council of keepers and how it is formed                                           | Statutes                           |
| 6   | Cap on entrusted voices for one leader: 10% or another share                                      | `governance`                       |
| 7   | Ceiling on the fee from a sale                                                                    | `shop`, statutes                   |
| 8   | ActivityPub federation in the first version or later                                              | Nothing in Stage 1                 |
| 9   | Is the earlier charter archived or rewritten for this concept?                                    | Nothing                            |
| 19  | Price of a year of the extended capsule, and who holds prepaid years until the association exists | Vouchers, first partner invitation |

## Architecture

| #   | Question                                                                                                             | Blocks               |
| --- | -------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 11  | Edge provider with overload protection, preferably European                                                          | Stage 1              |
| 13  | Targets for data loss and recovery time: 5 minutes and 4 hours, or other (nightly backups give up to 24 hours today) | Backup design        |
| 14  | Who is the second person with access to the site                                                                     | Launch               |
| 15  | AI model and where it runs                                                                                           | `ai`, privacy policy |
| 16  | Matrix homeserver implementation                                                                                     | `messaging`          |
| 17  | Federation with other Matrix servers                                                                                 | Nothing in Stage 2   |
| 18  | Is the no-code bot builder in the first version of messaging?                                                        | `messaging` scope    |

## Legal, to check with a lawyer

- Duties under the Digital Services Act and LCEN for a small platform.
- The shop: trader traceability (DSA art. 30), DAC7 reporting, consumer rights in distance selling, VAT rules for platforms.
- Paid services by a loi 1901 association: VAT and commercial taxes.
- Joint projects with shared revenue between private persons.
- Duties of a messaging service operator in the EU and France.
- Whether the European Accessibility Act applies to the shop.

## Closed

Decided while building Stage 1. Each still needs its ADR.

| #   | Question            | Decision                                                                                           |
| --- | ------------------- | -------------------------------------------------------------------------------------------------- |
| 2   | Main domain         | areopagus.world; www and beta redirect to it. areopagus.eu and areopagus.fr stay with the project. |
| 3   | Interface languages | The network in English, French and Russian; the public page in nine languages.                     |
| 10  | Hosting and backups | Clever Cloud (France) for the app and PostgreSQL; Scaleway for mail and encrypted backups.         |
| 12  | Server framework    | No separate API server: one Next.js app with route handlers, modules inside it.                    |
