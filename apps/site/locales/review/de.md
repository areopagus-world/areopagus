# Review: Deutsch

Model: claude-opus-5-5

## Verdict

minor issues: the page reads naturally overall, but a few strings shift the meaning or carry unwanted connotations ("Gemeinsame Sache", "Zahlungen verweigern", "Spende").

## Issues

| key               | current                                                   | problem                                                                                                                          | suggested text                                                           |
| ----------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| count             | {a} von {b} leuchten                                      | The verb breaks when {a} = 1 ("1 von 18 leuchten").                                                                              | Leuchtend: {a} von {b}                                                   |
| pathText          | … Was geplant ist, bleibt ein Umriss. …                   | "bleibt" suggests it will stay an outline for good. The English only describes its current state.                                | … Was geplant ist, ist vorerst ein Umriss. …                             |
| stages.4          | Gemeinsame Sache                                          | Evokes "gemeinsame Sache machen", which means colluding and has a negative ring.                                                 | Gemeinsame Arbeit                                                        |
| nodes.5 / engText | Dein Space                                                | "Space" is an unnecessary anglicism that older readers may find odd.                                                             | Dein Bereich (and "Dein Bereich, dein Laden …" in engText)               |
| nodes.13          | Zahlungen, die niemand verweigern kann                    | "Zahlung verweigern" normally means "refuse to pay" (the payer's act). The intended meaning is that nobody can block a payment.  | Zahlungen, die niemand blockieren kann                                   |
| ways.3.0          | Als Erste ausprobieren                                    | With singular "du" this reads as feminine singular ("als Erste" vs. "als Erster").                                               | Vorab ausprobieren                                                       |
| ways.4.1          | … dafür, dass das Netzwerk läuft.                         | Loses "keeping": the network should keep running, not just run.                                                                  | … dafür, dass das Netzwerk weiterläuft.                                  |
| supText           | … sein Geschäftseinkommen und keine gemeinnützige Spende. | "Geschäftseinkommen" is not idiomatic German.                                                                                    | … eine Einnahme seines Unternehmens und keine gemeinnützige Spende.      |
| rules.1           | Eine Spende kauft kein Stimmgewicht …                     | supText has just said the money is explicitly _not_ a "Spende", a legally loaded word in German. Using it here contradicts that. | Geld kauft hier kein Stimmgewicht, keine Platzierung und kein Abzeichen. |
| untilValue        | Sammlung noch nicht e                                     |
