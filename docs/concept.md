# Concept

Areopagus is a European network of living people. This document says what it is for, what a person can do in it and what it deliberately does not do. Where it conflicts with code or other documents, this document and the [decision records](adr/README.md) win.

## Mission

In an age of AI, people need a place to grow and to earn from their own work that does not depend on the algorithms of one corporation. Areopagus replaces services that were good before they had shareholders to satisfy, and it is built so that it cannot go the same way.

## The station

Areopagus has a legend, and the pictures and the words of the network follow it. Areopagus is an orbital station that Christians build together. It is named after the Areopagus in Athens, where the apostle Paul spoke with the philosophers in their own language (Acts 17:16-34). Everything for the building comes up from the Earth on cargo ships. The crew gathers on the station to agree, then goes back to work on Earth. The aim is that the Earth becomes a garden for all who live on it. One ring of the station is always under construction.

- The Earth: an account is open to everyone. Each person has an earthly space for earthly things: a page, a home port, skills, a journal, questions, communities, a shop. Everyone can see what the station does and where it is heading.
- The station: a cabin for those who believe in God the Father, Jesus Christ and the Holy Spirit. How one comes aboard is being prepared and will be published after a legal review. The station takes a person at their word and does not judge anyone's faith.
- The words of the legend: a community is a crew, the timeline is the logbook, questions are the radio, votes and the court are the assembly on the Areopagus, the roadmap is the slipway, moderation is the watch, the map of lights is the Earth seen from a porthole.

The station in the pictures is drawn close to how such a station would really be built: two rings of 250 m radius turning against each other at 1.9 turns a minute for one g, a non-rotating axis for docking, power and radiators, an orbit of 800 km below the radiation belt. Classical architecture appears where it does a job: a coffered dome over the docking hub, a colonnade that carries the berthing ring, frames that read as pilasters. Earth imagery: NASA Earth Observatory.

## The pieces

### Space

A page of one's own for a person, a family, a workshop, a parish, a club. The address is `areopagus.eu/name`.

- Built from blocks: who I am, what I can do, my work, my answers, my place, links, a shopfront.
- Deeply customisable through themes, fonts, colours and block order. Custom HTML, CSS and scripts are not allowed ([ADR 0006](adr/0006-no-custom-code-in-spaces.md)).
- Each block is visible to everyone, to members of the network, or to its owner only. Faith is optional and hidden by default.
- The whole space can be exported in an open format at any time.

### People ask people

- Search returns people. "Who in Nice repairs old outboard motors" lists the spaces of those who can, by distance and by how past answers were received.
- A question can go to one person, to a place or to a topic.
- The answer stays on the answerer's space. The asker marks whether it helped.
- AI does not answer in place of people. It helps phrase the question, finds whom to ask and translates between languages.

### Map

- The main screen. Levels: Europe, country, region, town, settlement.
- Every place has a page: who lives here and what they can do, open questions, events, communities, shops.
- A space is tied to a settlement, never to an address. Exact location is not stored.
- The base comes from open data: boundaries and settlements from OpenStreetMap and GeoNames.
- The rest of the world joins later on the same levels and rules.

### Skills, labs and joint projects

- Skills come from a shared dictionary. ESCO, the open European classification of skills and occupations, is the proposed base.
- A person sets their own level: learning, able, can teach. People who worked with them confirm the skill, and the confirmation is shown with the work it was given for.
- The skill map is a layer on the map of Europe: where people with a skill live, and where the skill is sought and not found.
- A lab is a community of one skill or topic, local or European, with questions, materials, master and apprentice pairs and projects.
- A joint project has a goal, a deadline and roles written as skills. The result is published on every participant's space. The first version of projects carries no money.

### Shop

A space is also a shopfront for handmade goods and services.

- Listing is free. The network's fee is one number with a ceiling written into the core rules.
- No advertising and no paid placement, in any form.
- Search order is distance, match and confirmed reviews. The formula is published.
- The buyer list and the correspondence stay with the seller and are exported with the space.
- Only someone who paid can leave a review.
- Payment goes directly to the seller through Stripe Connect. The network holds no funds.

### Community

The community is the main unit of the network.

- Kinds: by place (village, quarter, parish), by trade (lab, guild, cooperative), by interest, by project.
- A community has its own space, members with named roles, rules within the core, an open ledger, shared projects and a shared shopfront.
- Three confirmed spaces can open a community.
- A community has a visible path of development. See [governance](governance.md#development-of-communities-and-places).

### Messaging

End-to-end encrypted personal and group chats, community chats and service bots, built on the Matrix protocol with a homeserver in the EU ([ADR 0005](adr/0005-matrix-for-messaging.md)).

## Dignity through participation

The network is arranged so that a person feels their worth through what they take part in, not through a position in a list.

- A space shows deeds, not numbers: whom the person helped, what they taught, what they built with others, which roles they hold.
- There are no rankings of people, no leaderboards, no follower or like counters.
- Every contribution counts as a contribution. The network does not sort deeds into important and small.
- Thanks are left in words by the person who was helped and never turn into a number.
- A newcomer is offered a small real task in their own place on the first day.
- Every member of a community has a named role.
- People are never scored, openly or covertly ([ADR 0003](adr/0003-no-individual-scoring.md)).

## Economy

The network lives on fees for extensions and on voluntary contributions. Everything needed to take part is free forever.

| What                                                  | Terms                                                    |
| ----------------------------------------------------- | -------------------------------------------------------- |
| Space, questions and answers, map, voice              | Free forever, fixed in the core                          |
| Own domain for a space, more storage, extended themes | Small subscription priced from cost                      |
| Business space: workshop, shop, studio                | Higher subscription, bookings and payments built in      |
| Payments between people                               | Direct through Stripe Connect; one published fee or none |
| Fundraising                                           | No network fee, public ledger with a hash chain          |
| Advertising, sale of data, paid placement             | Never                                                    |

Every month the association publishes what came in, what went out and what one active space costs. Surplus is allocated by vote. Protection against extraction is structural: no shares, no sale, a fee ceiling in the core, open code and exportable spaces.

## Design

The image of the network is Europe at night, where every space is a lit window.

- The map is the main screen. The more living spaces in a place, the brighter it is.
- Stone and light: dark warm stone, light paper, one warm accent. The interface itself stays plain: no crosses, domes or stained glass in buttons and frames. The station in the pictures keeps its classical elements where they serve a function.
- A space is a room its owner furnishes; the frame and navigation are the same everywhere.
- One main action per screen. Secondary things are one tap away.
- No red counters, streaks or infinite scroll.
- Every screen is tested with a teenager, a thirty-year-old and someone over sixty. If one of them cannot tell what to do within a minute, the screen is redone.

## What Areopagus is not

- Not a church, a denomination or a theological authority.
- Not an advertising business.
- Not a payment processor.
- Not a blockchain project. There is no token. The journal is hash-chained and built so that a later move would be quick, but a token would need its own decision, a change to the statutes and legal advice (MiCA).
- Not a feed. A chronological feed may come later; an engagement algorithm will not.
