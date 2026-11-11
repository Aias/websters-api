# Page-reading batch 14

Two models read printed pages 1161 to 1260 without seeing the record, and their agreed reading is compared with the record word by word. This batch makes 654 corrections in 482 entries, adds 9 entries that the electronic text never had, and gives 11 records their printed spelling. It opens 9 holds: 8 questions in the review queue and 1 entry whose homographs stand in another order than the print's. The batch grants no complete-entry review credit.

The method is the one [batch 2](dictionary-audit-page-reading-2.md) describes, with the changes of batches [3](dictionary-audit-page-reading-3.md) to [12](dictionary-audit-page-reading-12.md). Nothing in the method changed for this batch.

## Pages and readers

- **Pages:** leaves n208 to n307 of the 1895 volume 2 scan, Pull through Run, about 253,000 words in 6,476 printed entries.
- **Readers:** Opus and Sonnet. Opus alone found 50 differences the pair had missed, Fable read those strips blind and agreed on 34, and 14 became corrections. A second, taller strip of the 1898 printing settled 26 of 38 differences that the first strip had left unclear.
- **Proofreading:** three reviewers read all 504 rule-drafted corrections and reported 50. Sixteen of the reports are single words where the 1913 typists' text agrees with the record and both readings make sense. Under the ruling of 10 November 2026 those follow the print, and the ledger lists them. Reports that a correction would mix the printed wording with a later rewrite went to the person.

## Results

The comparison found 1,074 differences, the 34 from the tiebreak reading included.

| Disposition                                                     | Differences |
| --------------------------------------------------------------- | ----------: |
| Corrected (654 edits)                                           |         647 |
| Registered later addition, unchanged                            |         153 |
| Genus spelled out by convention, unchanged                      |          48 |
| GCIDE-only words absent from Gutenberg and the print, unchanged |          27 |
| Inflected forms that are only labels or pronunciations          |           7 |
| Print unreadable in the 1895 scan, unchanged                    |           5 |
| Pronunciations and shared headwords                             |          15 |
| The record follows the 1913 Supplement, unchanged               |           3 |
| The print is wrong, or the 1913 printing revised the passage    |          30 |
| The 1898 printing reads as the record                           |          45 |
| Not a difference in the text, or not settled                    |          72 |
| Held                                                            |          22 |

The [ledger](dictionary-audit-page-reading-14.jsonl) gives every difference with its disposition, and every edit with its exact fragments and readings.

## Corrections

- **624 follow the ruling of 10 November 2026.** The record's reading came from the typists. Examples: Remember "truth" for "trith", Rose "pliable" for "pliade", Reef "fasten" for "basten", Reproachful "These" for "The", and the authorities "Cotgrave" under Rhetorize, "Johnson" under Rhymist and "Tomlinson" under Riveting. Put regains a lost subsense, Run a line from Shakespeare, Pungent and Rueful a quotation from Dryden each, and Quarto "made by twice folding a sheet, which then makes four". Round regains the definition of "To round in" and the heading "To round up", which the record had run together.
- **30 undo a later GCIDE change.** Rubella regains "An acute specific disease" and "catarrhal symptoms", Researcher "One who researches.", Ricochet "ball along", Rapport "mesmerism", and Quillaia bark "Chili" and "Chilians".
- **Inflected forms:** 17 are corrected, among them Quack "Quacked", Quail "Quailed, Quailing", Register "Registered", Renew "Renewed", Review "Reviewing" and Rifleman "Riflemen".
- **Pultise** held the text of the next printed entry, Pultrie. It reads "See Poultice. [Obs.] Holland." again, and Pultrie is its own record. Quarrel, Repudiation, Rotation and Rubbish likewise carried the entries Quarreler, Repudiationist, Rotational and Rubbishy.
- **Small slips fixed by hand:** Recarbonize regains its "[R.]", Rope "at will or unchecked", and the citations "Jer. Taylor" under Refractory and "2 Cor. vii. 10" under Repentance are set right. A stray "; 115)" after the headword Ross is removed.

## New and renamed records

Nine printed entries had no record: Pultrie, Pusillanimousness, Quarreler, Quese, Regrettable, Repudiationist, Rotational, Rubbishy and Ruffianism. Each is transcribed from two blind readings that agree and a reading of the 1898 printing, in the markup of its neighbours. The ledger gives each record's text.

Eleven records carried a misspelled headword and take their printed name.

| Old name       | Printed name   | Old name     | Printed name |
| -------------- | -------------- | ------------ | ------------ |
| Pythocenic     | Pythogenic     | Repartotion  | Repartition  |
| Quinquelobared | Quinquelobated | Reproachablr | Reproachable |
| Quintilllion   | Quintillion    | Revestture   | Revesture    |
| Reflueus       | Refluous       | Rigarion     | Rigation     |
| Reichsstand    | Reichsstadt    | Romanticaly  | Romantically |
| Reincit        | Reincite       |              |              |

One later-addition row follows a corrected heading: Road's second heading read "Uponthe road" and now reads "Upon the road".

## Kept and held

- **The print is wrong (6):** broken or misprinted letters under Purple, Raphany, Realist and Rudder, a doubled "a" under Pyramidal, and "Epinephulus" for Epinephelus under Rockfish.
- **Probable 1913 revisions:** Pycnidium, Quadrifoliate, Quaking aspen, Quarrelet, Questuary, Racemose, Radial, Rate, Recidivous, Rhinoplasty, Ripple mark and Rootcap stand as the 1913 typists' text has them.
- **Held for the person (8 questions):**
  - **Quandang,** which both printings set as the headword of the record Quandong.
  - **Seven passages that GCIDE rewrote,** where restoring the printed wording removes text the later-additions register lists or would blend two wordings: Pyemia, Welsh rabbit under Rabbit, Rat, Reduce, Reduction, Reichstag and Ridicule. Reduction's question notes that the printed example has the chemistry backwards in every printing.
  - Each is in the review queue with crops of both printings.
- **Held for a later pass (1):** Puzzle holds its homographs in another order than the print's.

## Cost

| Step                                     | Tokens       | Model time |
| ---------------------------------------- | ------------ | ---------- |
| Blind readings of 300 columns, two each  | 28.1 million | 5.3 hours  |
| Third readings of 831 strips             | 3.4 million  | 46 minutes |
| Second-chance readings of 38 strips      | 0.3 million  | 6 minutes  |
| Tiebreak readings of 50 strips (Fable)   | 0.2 million  | 4 minutes  |
| Reading of 29 unmatched printed entries  | 0.2 million  | 2 minutes  |
| Drafting, proofreading and review agents | 2.6 million  | 1.5 hours  |

That is about 348,000 tokens a page and 5,400 an entry. The integrating session's own usage was not measured.

## Limits

- Pronunciation marks, punctuation, capitals and italics are not compared.
- A single word that the 1913 printing changed cannot be told from a typist's slip without the 1913 page. The ruling of 10 November 2026 treats it as a slip.
- An entry that runs onto page 1261 is compared only as far as this batch's pages.
- The 1913 printing itself was not read. The only scan found is access-restricted.
