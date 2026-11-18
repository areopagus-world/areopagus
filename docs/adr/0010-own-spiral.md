# 0010. A person keeps their own spiral

- Status: Accepted
- Date: 2026-11-18

## Context

Areopagus gives everyone a capsule: a capsule of time with a chronology, a present state and what
its owner means to do next. The eight levels of the Earth balance are the skeleton of the capsule:
the same form serves a person, a family, a community and a port, which is why we call it the
fractal of development. ADR 0009 kept any sum of levels away from a person, so that no one would
end up with a level. People still want to see their own life along the spiral, the way an author
keeps their work by direction, and to choose whether to show it.

## Decision

The owner of a capsule keeps their own spiral. They choose the level of each entry, may give each
level a name in their own words (at most 40 characters), and see, for each level, how many entries
they filed there, private ones included. A level opens the entries filed under it. The spiral is
hidden from others until the owner turns it on; then visitors see the same layout counting only
public entries.

Nothing about the person is computed. The site never infers a level from what someone writes,
never shows a level of the person, never ranks or compares spirals, never searches or filters
people by their spiral and never sums spirals across people. This amends ADR 0009 for the owner's
own capsule only; everywhere else its rule stands.

## Consequences

- The capsule reads like a table of contents of a life or a work, in the owner's words, on one
  shared frame.
- Nothing is forced: a capsule works without a spiral, and every entry can stay without a level.
- Names of levels can say something personal; they stay private until the owner shows the spiral.
- The same spiral can later serve community capsules, under the same rules.

## Alternatives considered

- **Keep ADR 0009 for everyone.** Safer, but the owner could not see their own work along the
  spiral, which is the point of the fractal.
- **A computed profile of the person.** A level of a person in all but name; ruled out by ADR 0003.
- **Free directions without the spiral.** Readable, but loses the shared frame that lets a person,
  a community and a place speak the same language.
