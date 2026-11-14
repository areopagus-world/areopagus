# Review: Italiano

Model: claude-opus-5-5

## Verdict

minor issues: the translation reads naturally overall, but a few word choices are off: "allo scoperto", "cerchio", "Cronologia", "officina", "Apre presto".

## Issues

| key      | current                                                                        | problem                                                                                                                               | suggested text                                                                      |
| -------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| meta     | Areopagus: una rete europea di persone vere. Costruita insieme, allo scoperto. | "Allo scoperto" means exposed or out of cover, as in a military or betting sense. It does not convey "transparently, in public view". | Areopagus: una rete europea di persone vere. Costruita insieme, alla luce del sole. |
| nodes.1  | Documentazione e officina                                                      | "Officina" is a mechanic's workshop or factory floor. A shared digital workspace is "spazio di lavoro".                               | Documentazione e spazio di lavoro                                                   |
| nodes.6  | Cronologia                                                                     | "Cronologia" strongly suggests browser or chat history. "Chronicle" as a feature (a running account of events) is "Cronaca".          | Cronaca                                                                             |
| ways.3.0 | Provare per primi                                                              | The plural "primi" clashes with the singular "tu" used everywhere else. It is also gendered.                                          | Provare in anteprima                                                                |
| ways.3.1 | Entra nel cerchio che riceve le novità prima di tutti.                         | A group of people is a "cerchia". A "cerchio" is a geometric circle.                                                                  | Entra nella cerchia che riceve le novità prima di tutti.                            |
| ways.4.1 | Per un passo del percorso o per tenere viva la rete.                           | On a path or roadmap, a "step" is naturally a "tappa". "Passo" reads like a footstep.                                                 | Per una tappa del percorso o per tenere viva la rete.                               |
| supText  | …quindi il sostegno è un suo reddito d'impresa e non una donazione benefica.   | "È un suo reddito d'impresa" is clumsy.                                                                                               | …quindi il sostegno è reddito della sua attività, non una donazione benefica.       |
| ctaGive  | Apre presto                                                                    | This sounds like a shop sign with no subject. For a button, "In arrivo" or "Presto disponibile" is the idiomatic choice.              | In arrivo                                                                           |
| foot     | Codice aperto con licenza AGPL. Dati in Europa. Mai pubblicità.                | "Mai pubblicità" is clipped and loses the emphatic "ever".                                                                            | Codice aperto con licenza AGPL. Dati in Europa. Niente pubblicità, mai.             |

## Register

Informal "tu" throughout ("puoi costruirla", "Aggiungi", "Il tuo spazio", "Proponi"). This is the right choice for a 15–60 audience and a direct, warm tone in Italian, and it matches current practice for community and tech projects. The infinitive headings in `ways.*.0` combined with imperative descriptions are a normal Italian list convention and fit with "tu". Only "per primi" broke the singular address.
