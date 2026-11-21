# Later-addition classification, batch 2

[Classification batch 1](dictionary-audit-classification-1.md) deferred 125 of the entries the [later-additions register](dictionary-later-additions.md) had misjudged. Seventy-four carried runs of words that their Gutenberg 1913 paragraph lacks, and 51 matched it too poorly to classify before establishing which printed entry they are. This batch settles all 125.

## Method

Each record is compared word by word with Gutenberg's 1913 text: its main paragraphs for a main-vocabulary entry, and its Supplement paragraphs, book 670 from paragraph 1374, for a Supplement entry. A main entry is also compared with both blind page readings of its printed column, and a record-only run in a main entry is checked against the key's Supplement paragraphs. Every difference was read by hand. Pronunciations, spelled-out labels, sense numbers, genera the print abbreviates, and Greek that Gutenberg lost are set aside.

A record that is a printed main entry loses its entry row. A record that is a Supplement entry becomes `supplement-1913`. Words that no 1913 witness has become span rows, categorized from the tags of the GCIDE paragraph that holds them, and 1913 Supplement text inside a main entry becomes a `supplement-1913` span row. Where GCIDE replaced or dropped 1913 wording, the record keeps it and a hold records the 1913 text, because the Supplement has no scanned page at hand and the main pages show the wording of 1895 and 1898.

No dictionary text changes. The owner check in `scripts/dictionary-later-additions.test.ts` now joins subscripts to their element, so a span containing a chemical formula such as Zircon's "Zr₂SiO₄" can be located.

## Results

| Outcome                           | Entries |
| --------------------------------- | ------: |
| Entry row removed, main entry X–Z |      47 |
| Entry row removed, main entry A–W |       3 |
| Reclassified `supplement-1913`    |      75 |
| total                             |     125 |

| Content                                             | Entries |
| --------------------------------------------------- | ------: |
| Matches its 1913 text                               |      48 |
| Carries later material or Supplement text, as spans |      75 |
| Lacks 1913 text but carries nothing later           |       2 |
| total                                               |     125 |
| Holding 1913 wording that GCIDE replaced or dropped |      41 |

| Span rows added      | Rows |
| -------------------- | ---: |
| `supplement-1913`    |   23 |
| `gcide-editor`       |   55 |
| `later-unattributed` |   56 |
| `wordnet`            |    9 |
| total                |  143 |

The [ledger](dictionary-audit-classification-2.jsonl) gives each entry's identity, spans and hold. Forty-seven main entries rest on both page readings and Gutenberg, and Yachtman, Zumometer and Take-off on Gutenberg alone.

## Findings

- **Most deferrals for later material were pronunciations and labels.** Thirty-three of the 74 carry no later text: their unmatched runs were pronunciations the pipeline has since added, spelled-out labels, and words Gutenberg dropped that both page readings show, such as Yoke's "(Naut.)" and Yeast's "liquor".
- **Every low-agreement record is the printed entry.** Fifteen match once notation is set aside or once compared with the right paragraph, 11 carry later additions, and 25 carry GCIDE rewrites, such as Hormone, Telephoto and Spectrometry.
- **Main entries carry 1913 Supplement senses.** Yam, Yard, Yoke, Zone and Take-off append their Supplement senses, Xanthin runs on the Supplement entry Xanthine, and Yeomanry replaces its printed sense 3 with the Supplement's. Knockdown merges its main and Supplement entries, which a hold records.
- **Upwind repeats Yang's defect.** Its record is the printed verb "To wind up. Spenser.", and its editor category came from GCIDE's separate adverb and adjective. Zany and several Supplement entries have such separate GCIDE entries too, none of them in the record.
- **Classification-1 compared three records with a neighbouring paragraph:** Pipe line with the verb Pipe-line, Stream line with Streamline, and Psychoanalysis, whose 1913 entry only refers to Psychanalysis. GCIDE moved Psychanalysis's 1913 definition into the Psychoanalysis record, which a hold records.

## Holds

Forty-one entries join the [holds register](dictionary-audit-holds.md). Each gives the 1913 wording from Gutenberg. The 37 Supplement entries wait on a reading of a printed 1913 Supplement, which on archive.org lends only. Yen's 1913 revision waits on the 1913 printing or the person, because the 1895 page gives the older gold and silver yen. Yawl's Supplement sense was rewritten by RH, Xanthin's run-on Supplement definition by GCIDE, and Gam repeats a Supplement sense.

## X–Z span rows

The register's span rows came from an A–W survey, so entries under X, Y and Z had none. The full-alphabet survey (`.context/dictionary-audit/print-reconciliation-inventory/fresh-survey/full-alphabet/hunks.jsonl`) has 105 X–Z fragments where the record has words Gutenberg lacks, outside the 125 entries above and outside entries the register lists whole. Both page readings print 77 of them, which Gutenberg dropped. Four are no longer in the record. The other 24, in 11 entries, become span rows: Yttrium's and Zinc's atomic numbers, PJC clauses in Xylophone, Xylopyrography and Zebra, Xeriff's "(ca. 1900)", Zirconia's formula, and the rewritten phrase heading of Yield. Yield and Zebra already wait on the person's ruling from page-reading-18.

## Unresolved locations

Of the register's 1,068 span rows with no owner, 564 now have one, each confirmed against the current record. Fifty-nine match the words on one or both sides of their survey hunk, and four spans of four or more words occur once in the record. A whole-section row held the headword the survey wrote in front of the section, as in "Adenoid, (Med.) A swelling…", which no record contains, so 288 such rows now hold the section's own words and point at it. A row naming a heading only the record has held the survey's unsyllabified spelling, so 213 now hold the record's form, such as "Ai′blins", and point at that headword. The other 504 stay unresolved: spans that cross several run-in compounds, text a later correction changed, formulas and Greek the survey wrote differently, and short spans whose context is gone.
