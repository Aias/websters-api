# Page-reading batch 16

Two models read printed pages 1361 to 1460 without seeing the record, and their agreed reading is compared with the record word by word. This batch makes 738 corrections in 526 entries, adds 2 entries that had no record of their own, and gives 8 records their printed spelling. It opens 16 holds: 15 questions in the review queue and one difference in the order of same-spelled entries. The batch grants no complete-entry review credit.

The method is the one [batch 2](dictionary-audit-page-reading-2.md) describes, with the changes of batches [3](dictionary-audit-page-reading-3.md) to [12](dictionary-audit-page-reading-12.md). Nothing in the method changed for this batch.

## Pages and readers

- **Pages:** leaves n408 to n507 of the 1895 volume 2 scan, Snail-like through Sycoceryl, about 255,000 words in 6,337 printed entries.
- **Readers:** Opus and Sonnet. Opus alone found 68 differences the pair had missed, Fable read those strips blind and agreed on 43, and 8 became corrections. A second, taller strip of the 1898 printing settled 28 of 36 differences that the first strip had left unclear.
- **Proofreading:** four reviewers read all 585 rule-drafted corrections and reported 44. Eleven of the reports are single words where the 1913 typists' text agrees with the record and both readings make sense. Under the ruling of 10 November 2026 those follow the print, and the ledger lists them. Reports that a correction would mix the printed wording with a later rewrite went to the person.

## Results

The comparison found 1,162 differences, the 43 from the tiebreak reading included.

| Disposition                                                     | Differences |
| --------------------------------------------------------------- | ----------: |
| Corrected (738 edits)                                           |         727 |
| Registered later addition, unchanged                            |         176 |
| Genus spelled out by convention, unchanged                      |          71 |
| GCIDE-only words absent from Gutenberg and the print, unchanged |          21 |
| Inflected forms that are only labels or pronunciations          |           1 |
| Print unreadable in the 1895 scan, unchanged                    |          10 |
| Pronunciations and shared headwords                             |          11 |
| The record follows the 1913 Supplement, unchanged               |           2 |
| The print is wrong, or the 1913 printing revised the passage    |          18 |
| The 1898 printing reads as the record                           |          30 |
| Not a difference in the text, or not settled                    |          69 |
| Held                                                            |          26 |

The [ledger](dictionary-audit-page-reading-16.jsonl) gives every difference with its disposition, and every edit with its exact fragments and readings.

## Corrections

- **713 follow the ruling of 10 November 2026.** The record's reading came from the typists. Examples: Superior "quality" for "quantity", Stiff "hardly" for "hardy", Souse "serie" for "aerie", Storehouse "estimable" for "inestimable", Sun "animalcute" for "animalcule", and the authorities "Ferguson" under Swink and "Totten" under Studding sail. Swamp regains the phrase "Swamp partridge", Stuff its Franklin quotation "Time is the stuff which life is made of", Spite the two sentences that tell malice from spite, Strike "a man's head with a sword; to strike off", and Suspend "to suspend the body by a cord".
- **25 undo a later GCIDE change.** Snapper, Snowbird, Sparterie, Squash, Sweet and Swift regain the printed form of a name with two genera, such as "Cypselus, or Micropus, apus". Soda regains the phrase "Soda water", Sodium "so readily oxidized" for "so highly reactive", Sultry "moist" for "humid", and Strychnos "order" for "family".
- **Inflected forms:** 13 are corrected, among them Sod "Sodded", Space "Spacing", Speciosity "Speciosities", Straighten "Straightened", Strike "Strook", Stroke "Stroking", Strokesman "Strokesmen" and Surfman "Surfmen".
- **Sordidly and Southeaster** each carried a neighbouring printed entry under their own headword. Sordidity and Southeasterly are now records of their own.
- **Small slips fixed by hand:** Spleenwort regains the Greek word "ἀσπλήνιον" where four replacement characters stood, Spindle's genus reads Euonymus both times, Straddling's cross-reference regains its sense number, Strong reads "are called weak; other consonant stems", Stop regains "to stop a vent", Sonometer is labelled "(Physics)", and Stock and Swipper regain the marks "[Obs.]" and "[Obs. or Prov. Eng. & Scot.]".

## New and renamed records

Two printed entries had no record of their own: Sordidity, which stood under the headword Sordidly, and Southeasterly, which stood under Southeaster. Each is transcribed from two blind readings that agree and a reading of the 1898 printing, in the markup of its neighbours. The ledger gives each record's text.

Eight records carried a misspelled headword and take their printed name.

| Old name     | Printed name | Old name        | Printed name   |
| ------------ | ------------ | --------------- | -------------- |
| Sterrink     | Sterrinck    | Supraglotic     | Supraglottic   |
| Stonebrearer | Stonebreaker | Suprascalpulary | Suprascapulary |
| Struntian    | Struntain    | Surrebuter      | Surrebutter    |
| Supposeer    | Supposer     | Swelve          | Swelwe         |

## Kept and held

- **The print is wrong (8):** broken letters give "Tc" under Suck and "thiok" under Sugar, Stampede has "panio", Squint "harelid" and Swinglebar "De Quincy". Soak cites "Isa. xxiv. 7" for chapter xxxiv, Solar dates a return of Halley's comet 1885.9, and Sterling points to the wrong sense of Starling.
- **Probable 1913 revisions:** Solar, Strobile and Strontia stand as the 1913 typists' text has them. Under Solar the older printings count the satellites and asteroids known in 1890. Strawberry keeps "Euonymus Americanus". Stink keeps the Gothic "stigqan", which the readers took for "stiggan".
- **Held for the person (15 questions):** passages that GCIDE rewrote, where restoring the printed wording removes text the later-additions register lists or would blend two wordings: Spirillum, Split, Squelch, Stamina, Stanno-, Stannoso-, Star, Statistics, Stop, Stout, Sucker, Sugar, Supplant, Suricate and Swamp. Each is in the review queue with crops of both printings.
- **Held for a later pass (1):** Stare, whose same-spelled entries stand in a different order from the print.

## Cost

| Step                                     | Tokens       | Model time |
| ---------------------------------------- | ------------ | ---------- |
| Blind readings of 300 columns, two each  | 28.4 million | 5.4 hours  |
| Third readings of 883 strips             | 3.6 million  | 48 minutes |
| Second-chance readings of 36 strips      | 0.3 million  | 5 minutes  |
| Tiebreak readings of 68 strips (Fable)   | 0.3 million  | 6 minutes  |
| Reading of 21 unmatched printed entries  | 0.1 million  | 2 minutes  |
| Drafting, proofreading and review agents | 3.1 million  | 1.1 hours  |

That is about 358,000 tokens a page and 5,600 an entry. The integrating session's own usage was not measured.

## Limits

- Pronunciation marks, punctuation, capitals and italics are not compared here. The [punctuation and capitals pass](dictionary-audit-punctuation.md) covers two of those.
- A single word that the 1913 printing changed cannot be told from a typist's slip without the 1913 page. The ruling of 10 November 2026 treats it as a slip.
- An entry that runs onto page 1461 is compared only as far as this batch's pages.
- The 1913 printing itself was not read. The only scan found is access-restricted.
