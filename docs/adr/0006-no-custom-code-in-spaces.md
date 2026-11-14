# 0006. No custom code in spaces

- Status: Proposed
- Date: 2026-11-14

## Context

Spaces should be as personal as the pages of early social networks. Those networks let members paste their own HTML, CSS and scripts, and that freedom was the route for worms and account theft. A space is shown to other signed-in members, so code on one space runs with another person's session.

## Decision

A space is customised only through validated parameters: theme, colours, fonts, block order, cover, music. Custom HTML, CSS and scripts are not accepted. A strict content security policy is applied to every page, and uploads are served from a separate domain.

## Consequences

- One person's page cannot run code in another person's browser.
- Themes cannot break contrast or navigation, so every space stays readable and accessible.
- Expression is limited to what the theme system offers. The theme system has to be rich enough that this does not feel like a cage.
- New kinds of block come through the block registry and code review.

## Alternatives considered

- **Sanitised custom CSS.** CSS alone can exfiltrate data and imitate interface elements; safe subsets are hard to keep safe.
- **Custom code in a sandboxed frame.** Possible later for widgets, at the cost of complexity and performance on cheap phones.
