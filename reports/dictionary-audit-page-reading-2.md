# Page-reading batch 2

Two models read the first fifty pages of the dictionary, A through Amphitropous, without seeing the record. Their agreed reading is compared with the record word by word. This batch makes 241 corrections in 188 entries and adds 11 entries that the electronic text never had. It opens three holds. The batch grants no complete-entry review credit.

## Method

- **Pages:** printed pages 1 to 50, leaves n106 to n155 of the 1907 volume 1 scan. They hold about 120,000 words in 3,671 printed entries.
- **Readers:** each column is cut into four pieces and enlarged twice. Opus and Fable each transcribe every piece at high effort with no access to the record. With printed pronunciations set aside, the two readings differ in 27 places, 0.23 per thousand words.
- **Comparison:** the words both models read identically are aligned with each record. Printed pronunciations, case, punctuation, diacritics and type style are not compared. Headwords joined by a brace share their definition, and a printed entry is matched to a secondary headword inside a record as well as to a record's key.
- **Sorting:** a difference inside a registered later addition, a GCIDE source mark, a genus the print abbreviates, or print both readers mark unreadable is set aside without further reading. A phrase the record has and both the print and the Gutenberg text lack is a GCIDE addition and stays.
- **Third reading:** every remaining difference is located on the 1898 printing by registering the two scans, and a third blind reader transcribes that strip.
- **Gutenberg text:** each difference is also compared with the Project Gutenberg text, which carries the 1913 typists' work without GCIDE's later changes. It shows whether the record's reading came from the typists or from GCIDE.
- **Drafting:** a correction that changes plain words is drafted by rule from the reading. One that touches markup is drafted by hand from the record's own conventions and checked mechanically. Every drafted correction was read before it was applied.

## Results

The comparison found 457 differences in 3,184 records.

| Disposition                                                     | Differences |
| --------------------------------------------------------------- | ----------: |
| Corrected (241 edits)                                           |         243 |
| Registered later addition, unchanged                            |         126 |
| GCIDE source mark, unchanged                                    |          18 |
| GCIDE-only words absent from Gutenberg and the print, unchanged |           8 |
| Genus spelled out by convention, unchanged                      |           6 |
| Print unreadable in the 1907 scan, unchanged                    |           3 |
| Inflected forms and run-in derivatives, not judged              |           3 |
| The print itself is wrong, record kept                          |           7 |
| The 1898 printing reads as the record                           |           8 |
| Not a difference in the text, or not settled                    |          31 |
| Held                                                            |           4 |

The [ledger](dictionary-audit-page-reading-2.jsonl) gives every difference with its disposition, and every edit with its exact fragments and readings.

## Corrections

The 241 edits fall under two rules.

- **157 follow the ruling of 10 November 2026.** The record's reading came from the typists, and two blind readings and the 1898 printing agree on the print. Examples: Abet "villainy" for "villany", Aberuncate's etymon "averruncare" for "aberruncare", Abroad "to be all abroad", Affirmative "Jer. Taylor" for "J. Taylor", Accidental's synonym "incidental", Abdicate's examples "to abdicate the crown, to abdicate one's throne", and the authorities "Chambers.", "Ray.", "Bacon.", "South.", "Hutton." and "Gray." after definitions that had lost them.
- **84 undo a later GCIDE change.** The Gutenberg text reads as the print, so the 1913 wording returns. Examples: Abdest "a Mohammedan rite" for "Muslim", Aeration "carbonic acid" for "carbon dioxide", Ammoniac "Persia" for "Iran", Agouta "Hayti", Abscess "the result of a morbid process" for "caused by infection", and the whole definitions of Aino, Albicore, Aluminium, Amentia and Amblyopy. Albacore and Aluminum return to their printed cross-references, "See Albicore." and "See Aluminium."

Usage marks gain what the print sets in 20 entries, such as "[Obs. or Archaic]" under Abduce and "[R.]" under Absentness.

## New records

Eleven printed entries had no record and no heading inside another record. The Gutenberg text lacks them too, so the typists passed over them. Each is transcribed from two blind readings that agree, confirmed by a reading of the 1898 printing, and written in the markup of its neighbours.

| Record            | Printed entry                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Abducent          | a. Drawing away from a common center, or out of the median line; as, the abducent muscles. |
| Abstemiously      | adv. In an abstemious manner; temperately; sparingly.                                      |
| Accommodative     | a. Tending to accommodate; of the nature of an accommodation.                              |
| Accommodativeness | n. The quality of being accommodative.                                                     |
| Addresser         | n. One who addresses or petitions.                                                         |
| Affirmably        | adv. In an affirmable manner.                                                              |
| Afterbrain        | n. (Anat.) The medulla oblongata.                                                          |
| Alcoometrical     | Alcoömeter, n., Alcoömetrical, a. Same as Alcoholometer, Alcoholometrical.                 |
| Alkaligenous      | a. Generating alkali.                                                                      |
| Alphenic          | n. (Med.) The crystallized juice of the sugarcane; sugar candy.                            |
| Amphibiousness    | n. The quality of being amphibious; ability to live in two elements.                       |

The record All Saints' also gains its second printed headword, All Saints' Day, which it had cut short.

Where the three readings differed on a pronunciation mark, the mark shown in the page crop is written as the neighbouring records write it. The ledger's notes name each such choice.

## Kept and held

- **The print is wrong (7):** About cites "Exod. xxii. 28" for a verse that is Exodus xxxii. 28, Ahorseback spells the author "Smollet", Amorous gives the French as "amoreux", Also gives the Anglo-Saxon form as "alswū", and Algates prints Spenser's "Una" as "Ulna". The record's readings stand. Three other record readings are GCIDE additions, which stay (Aeolic, Aggressive, Air plant).
- **The 1898 printing reads as the record (8):** the 1907 impression has worn or broken type, such as Abalone "liued" for "lined" and About "abverbial". The third reading caught each one.
- **Held (3 questions):** Abaca's cross-reference, where the readings differ on "Manila" or "Manilla". Abelmosk's species name, which the print sets as "(Hibiscus — formerly Abelmoschus — moschatus)". Abrasion's sense 3, which the print gives as one definition and the record splits in two with source marks.

One registered later addition is retired. Adventitious's "Syn. —" label marked a synonym list GCIDE had made from the end of the 1913 definition, and the definition is whole again.

## Cost

| Step                                 | Tokens       | Model time    |
| ------------------------------------ | ------------ | ------------- |
| Two blind readings of 150 columns    | 17.4 million | about 5 hours |
| Third readings of 299 strips         | 1.4 million  | 20 minutes    |
| Hand drafting and the eleven records | 1.0 million  | 40 minutes    |

That is about 400,000 tokens a page and 5,400 an entry. Thirteen columns were read twice, after their crops were widened. The integrating session's own usage was not measured.

## Limits

- Pronunciation marks, punctuation, capitals and italics are not compared. A correction drafted by rule keeps the record's punctuation around the changed words.
- A printed line that falls on a cut between two column pieces can be lost from both readings. Two such lines were found, in Allay and Amend, and the record already had both. The next batch cuts the pieces with an overlap.
- The 55 columns whose first crop clipped a letter at the edge were recut before or after reading. A difference at a line end in the ten pages of batch 1, which used the narrower crop, could have been missed.
- Where the two readers disagree, no difference is raised. There were 27 such places.
- The 1913 printing itself was not read. The only scan found is access-restricted.
