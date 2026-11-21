# Later-addition classification, batch 2

[Classification batch 1](dictionary-audit-classification-1.md) deferred 125 of the entries the [later-additions register](dictionary-later-additions.md) had misjudged. Seventy-four carried runs of words that their Gutenberg 1913 paragraph lacks, and 51 matched it too poorly to classify before establishing which printed entry they are. This batch settles all 125.

## Method

Each record is compared word by word with Gutenberg's 1913 text: its main paragraphs for a main-vocabulary entry, and its Supplement paragraphs, book 670 from paragraph 1374, for a Supplement entry. A main entry is also compared with both blind page readings of its printed column, and a record-only run in a main entry is checked against the key's Supplement paragraphs. Every difference was read by hand. Pronunciations, spelled-out labels, sense numbers, genera the print abbreviates, and Greek that Gutenberg lost are set aside.

A record that is a printed main entry loses its entry row. A record that is a Supplement entry becomes `supplement-1913`. Words that no 1913 witness has become span rows, categorized from the tags of the GCIDE paragraph that holds them, and 1913 Supplement text inside a main entry becomes a `supplement-1913` span row. Where GCIDE replaced or dropped 1913 wording, the 1913 wording returns when two blind readings of a printing confirm it, and otherwise a hold records it. The owner check in `scripts/dictionary-later-additions.test.ts` now joins subscripts to their element, so a span containing a chemical formula such as Zircon's "Zr₂SiO₄" can be located.

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

## Restorations and holds

Forty-one entries carried 1913 wording that GCIDE replaced or dropped. The 1913 Supplement's own printing lends only, but the 1915 New International (archive.org `bwb_O8-DDQ-914`) sets many of its new words in the same wording. Its OCR shows Gutenberg's whole unit unchanged for 22 of the 41. Each of those entries was cut from the 1915 page and read blind by two Opus readers, and both readings contain Gutenberg's unit word for word. Those 22 take back the 1913 definition as a unit, as the editorial rulings require, with 25 exact edits in the [restorations ledger](dictionary-audit-classification-2-restorations.jsonl):

- Acetonuria, Antibacterial (a), Antibody, Autotrophic, Clockwise, Decolletage, Filariasis, Hormone, Mercurialism, Padre (sense 1), Pedicure (sense 1), Pom-pom, Spectrometry, Telephoto and Xanthin's run-on Xanthine regain their printed definitions.
- Cafeteria regains "small tables", Dope "sometimes", Oscillograph "usually consisting of", Hydroplane's sense 2 "a gliding boat", and Esperanto "a Russian" for "a Pole".
- Garage regains its sense 1, "A place for housing automobiles.", and the note "Garage is recent in English, and has as yet acquired no settled pronunciation." Pedicure's second sense is again numbered 2, and Gam's noun is again one definition with (a) and (b), without the copy of (b) that GCIDE numbered as sense 3.

Separate later notes and labels stay registered, such as Antibody's note on autoimmune disease and Filariasis's "(Zoöl.)". Where the 1915 printing reads "looped belt" in Pom-pom, the record already does, and Gutenberg's "lopped" is a typing error. Photosynthesis stays held, because the 1915 printing adds a cross-reference inside the 1913 text, and so do Automobile, Artifact, Guimpe, Karakul, Oddment, Pipe line, Tryout and Tuxedo coat, which it words differently.

Twenty-six span rows that marked the replaced wording retire, four are cut to the words that remain, and 21 holds close. Twenty stay in the [holds register](dictionary-audit-holds.md), each with the 1913 wording from Gutenberg: 16 Supplement entries that wait on a reading of a printed 1913 Supplement, Hydroplane's verb, Yen's 1913 revision, which waits on the 1913 printing or the person because the 1895 page gives the older gold and silver yen, Yawl's Supplement sense, rewritten by RH, and Knockdown's merged entries.

## X–Z span rows

The register's span rows came from an A–W survey, so entries under X, Y and Z had none. The full-alphabet survey (`.context/dictionary-audit/print-reconciliation-inventory/fresh-survey/full-alphabet/hunks.jsonl`) has 105 X–Z fragments where the record has words Gutenberg lacks, outside the 125 entries above and outside entries the register lists whole. Both page readings print 77 of them, which Gutenberg dropped. Four are no longer in the record. The other 24, in 11 entries, become span rows: Yttrium's and Zinc's atomic numbers, PJC clauses in Xylophone, Xylopyrography and Zebra, Xeriff's "(ca. 1900)", Zirconia's formula, and the rewritten phrase heading of Yield. Yield and Zebra already wait on the person's ruling from page-reading-18.

## Unresolved locations

Of the register's 1,068 span rows with no owner, 643 now have one, each confirmed against the current record. Fifty-nine match the words on one or both sides of their survey hunk, and four spans of four or more words occur once in the record. A whole-section row held the headword the survey wrote in front of the section, as in "Adenoid, (Med.) A swelling…", which no record contains, so 337 such rows now hold the section's own words and point at it, 49 of them also without the survey's inflection bracket, as in "Arc, [Arcked; Arcking.]". A row naming a heading only the record has held the survey's unsyllabified spelling, so 213 now hold the record's form, such as "Ai′blins", and point at that headword. Thirty rows that ran across several run-in compounds become 75 rows, one at each compound, because a parsed compound repeats its heading and no single node holds the run. Thirty-two more retire, because PR #33 removed their text from the record when it restored the printed wording, and [their ledger](dictionary-audit-classification-2-retired.jsonl) keeps each row whole. The rest stay unresolved: spans across synonym lines, run-in derivatives and sense references, text a later correction changed, formulas and Greek the survey wrote differently, and short spans whose context is gone.
