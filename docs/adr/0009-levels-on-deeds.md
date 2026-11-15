# 0009. A level belongs to a deed, never to a person

- Status: Accepted
- Date: 2026-11-15

## Context

The Integral Balance of the Earth answers a place's state with deeds aimed at the level that needs them. Snapshots (ADR 0008) show where a place stands on each level; the chronology already holds what people and communities did there. Linking the two lets anyone see, under each level of a place, what is being done about it. ADR 0003 forbids any level, score or rating of a person, and a count of someone's deeds by level would become exactly that.

## Decision

An event in a chronology may name the level of need it serves, from 1 to 8, or none. The level is chosen by the author and shown next to the event. A place page lists, under each level, the public deeds of that place over the past year: their number and the newest three, each linking to its chronology. No page, list or export sums the levels of one person's or one community's deeds.

## Consequences

- The cycle of the method closes in the product: a snapshot shows the state of a level, the deeds below it show the answer.
- The level is optional, so old events and quick notes stay as they are.
- Private, hidden and planned deeds, and deeds of hidden spaces and communities, do not count on the place page.
- A deed is counted where its space or community was when it was written.

## Alternatives considered

- **A level computed from the text.** Hidden judgement of what people do; the author knows the deed better.
- **A profile of each space by the levels of its deeds.** A level of a person in all but name; ruled out by ADR 0003.
- **Several levels per deed.** More precise, harder to read; one level per deed keeps the counts honest. A deed that serves two needs can be written as two events.
