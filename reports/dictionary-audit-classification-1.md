# Later-addition classification, batch 1

The [later-additions register](dictionary-later-additions.md) was built from a survey of the main alphabet A through W. Every X, Y and Z entry therefore looked like a key only our dictionary has. An entry whose GCIDE paragraphs carried any WordNet or editor tag also took that category, even when its text is the 1913 supplement entry. The expanded survey flagged 497 entries for re-examination. This batch reviews 490 of them. Codex's own-record compound batches cover the other seven: Guttersnipe, Knock off, Knock-off, Lightweight, Snap shot, Year and Yellow.

## Method

Each record's text is compared with the Gutenberg 1913 paragraphs the survey matched to it. X through Z entries use main-text paragraphs, and the others use supplement paragraphs. Headwords, pronunciations and part-of-speech labels are left out on both sides, because their notations differ. A record word counts as matched when one of its word trigrams occurs in the Gutenberg text. For a record under six words, the word itself must occur.

A record is the 1913 entry when at least 60% of its words match and no unmatched run reaches four words, not counting spelled-out grammatical labels. Such an entry printed in the main alphabet loses its entry row. Such an entry printed in the supplement becomes `supplement-1913`. Every other record is deferred.

This is an electronic-witness comparison, the same kind of evidence the register was built from. It changes no dictionary text and grants no complete-entry credit.

## Results

| Outcome                                 | Entries |
| --------------------------------------- | ------: |
| Entry row removed (main text, X–Z)      |     272 |
| Reclassified `supplement-1913`          |      93 |
| Deferred: carries later material        |      74 |
| Deferred: under 60% of the text matches |      51 |

The [ledger](dictionary-audit-classification-1.jsonl) gives each entry's former category, witness paragraphs, both coverage measures, status and unmatched runs.

## Remaining

- The register has no span rows for X through Z, because the original span classification used only the A–W survey. The frozen comparison already holds the X–Z source-only fragments, so the existing span rules can classify them.
- An entry deferred for later material needs span rows for that material before its entry row changes. Yew's taxol sentence and Esperanto's account of Ido are examples.
- An entry deferred for low coverage needs a check of which printed entry it is, as Yang's homograph contamination showed. Some, such as Hormone and Superman, carry later rewrites of printed supplement definitions, which belong to definition restoration rather than classification.
