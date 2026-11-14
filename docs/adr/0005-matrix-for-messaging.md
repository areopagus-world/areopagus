# 0005. Matrix for encrypted messaging

- Status: Accepted
- Date: 2026-11-14

## Context

The network needs personal and group messaging with end-to-end encryption, community chats and service bots. A mistake in home-made cryptography is invisible from outside and exposes everyone's correspondence. One developer cannot build and audit a messaging protocol.

## Decision

Use the Matrix protocol with our own homeserver in the EU. Clients use `matrix-rust-sdk`, whose encryption (Olm and Megolm) is implemented in `vodozemac`. We build the interface, the link between chats and spaces, and bots. We write no cryptography.

## Consequences

- Encryption, multi-device support, key backup and attachments come from a maintained open implementation.
- Bots are ordinary Matrix clients; in an encrypted chat a bot is a participant and reads plaintext, which the interface must say.
- The server sees metadata: who talks to whom and when.
- Moderation of encrypted chats works only through reports with attached messages.
- AI translation cannot run on the server for encrypted chats.
- A second service to operate, with its own database and its own security updates, which must be applied promptly.
- MLS becomes available when Matrix clients ship it.

## Alternatives considered

- **Own protocol on MLS with OpenMLS.** The most modern group encryption, but everything around it would have to be built and audited.
- **Embedding a third-party messenger.** Members' correspondence would sit with another operator.
- **Unencrypted in-app messages.** Simple, and unacceptable for a network that promises not to exploit its members.
