# 0012. A partner may invite a person to a capsule, never make one for them

- Status: Proposed
- Date: 2026-11-25

## Context

A programme run outside Areopagus wants to give the people who take part in it a capsule, with a
year of the extended capsule paid in advance, and to let them carry over what they made during the
programme. The core rule of truth forbids hidden placement and dark patterns. Under the GDPR, data
moves from one controller to another only on a clear basis that the person can see. ADR 0003 forbids
any profile, level or score of a person, and a programme may well hold one. Paid extensions of a
capsule do not exist yet, and the association that will sell them is not yet founded.

## Decision

A partner gives a person an invitation, never a capsule. The invitation is a single-use signed
code. A capsule exists only when the person signs in on Areopagus themselves and accepts. Before
they accept, one screen says that the capsule lives on Areopagus, who runs it, what will be carried
over, and what the paid year includes and when it ends.

What is carried over is the list of entries the person picks one by one; each lands in their
chronology as private and without a level, unless the person sets one. Anything the partner
computed about the person (profiles, scores, maps of needs, levels) is refused by the import. A
prepaid year of extensions is attached to the invitation as a voucher, and the money is shown in
the monthly accounts as prepaid by a partner.

## Consequences

- No account is ever made for someone who did not sign in, so there is nothing to undo.
- The partner learns only whether its invitation was used, and sees a capsule only where its owner
  made it public.
- The import needs its own checks: a size limit, the entry kinds Areopagus knows, and a refusal of
  any field it does not know.
- Vouchers wait for the extended capsule; until it exists, an accepted voucher is kept and starts
  its year on the day the extension opens.
- The privacy page gains a section on entries carried from a partner programme.

## Alternatives considered

- **The partner creates the account.** Faster for the person, but makes accounts for people who
  never chose the network, and breaks the rule of truth.
- **Carry everything over by default.** Simpler, but moves private writing without a choice per
  entry.
- **The partner reads the capsule through an API.** Ties two services together and leaks private
  entries; the partner has no need for it.
