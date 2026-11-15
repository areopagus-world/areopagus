# 0008. Snapshots describe places and are shown only as a summary

- Status: Accepted
- Date: 2026-11-15

## Context

The Integral Balance of the Earth needs a first picture of each place: for every level, where the place stands between lack and excess. Official statistics arrive late and rarely at the scale of a town. People who live in a place, or know it from outside, can say where it stands. ADR 0003 forbids any score of a person, and a set of answers tied to a name would quickly turn into one. A position on care, order or links can also reveal beliefs (GDPR art. 9).

## Decision

A member with a space can record, for each level of a place, a position on a slider from lack (-100) through balance (0) to excess (+100), in steps of 10. A snapshot is about the place, never about people. The site shows only a summary per level: the median and the middle half of opinions, residents and visitors apart, once at least 10 people have recorded one. Older snapshots weigh less: the weight halves every 365 days. A new snapshot within 30 days replaces the previous one for that level. The site has no view of one person's snapshots, for members or for moderators; only the author sees their own.

## Consequences

- A place gets a first picture without waiting for official data, and anyone can see how it was made.
- Below 10 people nothing is shown, so a small place stays blank for a while.
- Snapshots of authors whose space is hidden are left out of the summary.
- Snapshots are deleted with the account.
- The levels and their axes are a working catalogue: the wording can change, the stored values keep their meaning (level number and position).
- Later parameters per level can be added under the same table (`parameter` column), without a new rule.

## Alternatives considered

- **Show every snapshot with its author.** Turns an opinion about a place into a profile of a person; ruled out by ADR 0003.
- **Average instead of median.** A few extreme answers would move it; the median with the middle half resists that.
- **A free score from 1 to 10.** No shared middle; the slider keeps balance at the centre and both excesses visible.
- **Only residents.** Visitors see what residents stop noticing; both are kept and shown apart.
