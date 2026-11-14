# Review: Français

Model: claude-opus-5-5

## Verdict

Minor issues: the French reads well overall, but a few calques and a few wrong idioms need fixing, especially "à découvert" and "y ont mis la main".

## Issues

| key        | current                                                          | problem                                                                                                                                                 | suggested text                                                                         |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| meta       | Construit ensemble, à découvert.                                 | "À découvert" suggests a bank overdraft or being exposed, not "in the open".                                                                            | Construit ensemble, au grand jour.                                                     |
| lead       | Sans publicité, avec un code ouvert.                             | "Avec un code ouvert" reads like a translation and is heavier than the English.                                                                         | Sans publicité, code ouvert.                                                           |
| pathText   | Ce qui est en cours clignote. Ce qui est prévu reste en contour. | "Clignote" means blinks, not pulses. "Reste en contour" is unidiomatic.                                                                                 | Ce qui est en cours palpite. Ce qui est prévu n'est qu'un contour.                     |
| state.next | ensuite                                                          | A bare adverb does not work as a status label.                                                                                                          | à suivre                                                                               |
| nodes.2    | Journal à chaîne de hachage                                      | This is a clumsy calque. The usual technical wording is "chaîné par hachage".                                                                           | Journal chaîné par hachage                                                             |
| nodes.13   | Des paiements que nul ne peut refuser                            | "Nul" is literary and too formal for this page.                                                                                                         | Des paiements que personne ne peut refuser                                             |
| joinText   | Chaque version nomme tous ceux qui y ont mis la main             | "Mettre la main sur" means to get hold of something, so "y ont mis la main" is ambiguous. "Nomme" is stiff.                                             | Chaque version cite toutes celles et ceux qui y ont contribué, par ordre alphabétique. |
| ways.1.0   | Soutenir par votre voix                                          | The idiom is "de sa/votre voix", not "par".                                                                                                             | Soutenir de votre voix                                                                 |
| ways.2.1   | test sur votre téléphone, données de votre commune               | "Test" should be plural here. "Données de votre commune" implies data owned by the town hall, not data about the town.                                  | Traduction, tests sur votre téléphone, données sur votre commune, code.                |
| ways.3.0   | Essayer en premier                                               | This is literal. The natural phrase is "en avant-première".                                                                                             | Tester en avant-première                                                               |
| supText    | votre soutien est un revenu professionnel, pas un don caritatif  | The French drops "his".                                                                                                                                 | votre soutien est donc son revenu professionnel, pas un don caritatif.                 |
| engText    | chacun peut l'héberger soi-même                                  | With "chacun", the standard form is "lui-même".                                                                                                         | chacun peut l'héberger lui-même, gratuitement.                                         |
| engDomain  | votre-nom.fr                                                     | Changing .eu to .fr narrows a European network to France and changes the meaning.                                                                       | votre-nom.eu                                                                           |
| (all)      | ' and the space before ":"                                       | French typography uses the typographic apostrophe (’). It also needs a narrow non-breaking space before ":" so the colon does not wrap onto a new line. | n’, qu’, quelqu’un, jusqu’à. Use U+202F before ":".                                    |

## Register

The page uses "vous" consistently throughout, with no slips into "tu". This works for a 15–60 audience in French. It is respectful without being corporate, and the plain wording keeps it warm. "Tu" would also be acceptable for a community project, but switching is not necessary.
