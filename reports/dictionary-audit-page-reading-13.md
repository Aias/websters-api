# Page-reading batch 13

Two models read printed pages 1061 to 1160 without seeing the record, and their agreed reading is compared with the record word by word. This batch makes 788 corrections in 628 entries, adds 7 entries that the electronic text never had, and gives 13 records their printed spelling. It opens 20 holds: 19 questions in the review queue and 1 entry whose homographs stand in another order than the print's. The batch grants no complete-entry review credit.

The method is the one [batch 2](dictionary-audit-page-reading-2.md) describes, with the changes of batches [3](dictionary-audit-page-reading-3.md) to [12](dictionary-audit-page-reading-12.md). Nothing in the method changed for this batch.

## Pages and readers

- **Pages:** leaves n108 to n207 of the 1895 volume 2 scan, Penman through Pull, about 243,000 words in 7,170 printed entries.
- **Readers:** Opus and Sonnet. Opus alone found 67 differences the pair had missed, Fable read those strips blind and agreed on 39, and 8 became corrections. A second, taller strip of the 1898 printing settled 29 of 40 differences that the first strip had left unclear.
- **Proofreading:** four reviewers read all 589 rule-drafted corrections and reported 89. Thirty-three of the reports are single words where the 1913 typists' text agrees with the record and both readings make sense. Under the ruling of 10 November 2026 those follow the print, and the ledger lists them. Reports that a correction would mix the printed wording with a later rewrite went to the person.

## Results

The comparison found 1,384 differences, the 39 from the tiebreak reading included.

| Disposition                                                     | Differences |
| --------------------------------------------------------------- | ----------: |
| Corrected (788 edits)                                           |         792 |
| Registered later addition, unchanged                            |         251 |
| Genus spelled out by convention, unchanged                      |          68 |
| GCIDE-only words absent from Gutenberg and the print, unchanged |          37 |
| Inflected forms that are only labels or pronunciations          |           5 |
| Print unreadable in the 1895 scan, unchanged                    |           3 |
| Pronunciations and shared headwords                             |          24 |
| The record follows the 1913 Supplement, unchanged               |          14 |
| The print is wrong, or the 1913 printing revised the passage    |          54 |
| The 1898 printing reads as the record                           |          27 |
| Not a difference in the text, or not settled                    |          80 |
| Held                                                            |          29 |

The [ledger](dictionary-audit-page-reading-13.jsonl) gives every difference with its disposition, and every edit with its exact fragments and readings.

## Corrections

- **717 follow the ruling of 10 November 2026.** The record's reading came from the typists. Examples: Print "expect" for "except", Predominant "subornation" for "subordination", Porpoise "hog" for "hag", Probation "prove" for "probe", and the authorities "Granger" under Pit and "Fuller" under Placard. Presentation regains a quotation from Dryden, Plaint two lines of Milton, Pretty a sentence of Johnson, and Praise a verse of Psalm 40. Prickly regains the phrase "Prickly ash".
- **71 undo a later GCIDE change.** Phthalein and Perofskite regain the printed text that GCIDE had replaced with "Same as phenolphthalein" and "Same as Perovskite". Others: Phonograph "It consists", Pepsinogen "ferment", Pervert "designedly" and Petalite "lithia".
- **Phosphine** had lost its main entry, the gas PH3, and held only the dyeing sense from the 1913 Supplement. The printed entry stands before that sense again.
- **Plagiarize** regains its intransitive entry, "To commit plagiarism.", which stood under the headword Plagiary.
- **Inflected forms:** 20 are corrected, among them Periwig "Periwigged, Periwigging", Physic "Physicked", Pikeman "Pikemen", Pounce "Pounced" and Plumula "Plumulæ".
- **Provokement** had run into the next printed entry, Provoker. It reads "The act of provoking; that which provokes; provocation." again, and Provoker is its own record. Physiognomist, Pley and Prepollent likewise carried the entries Physiognomics, Pleyn and Prepollex.

## New and renamed records

Seven printed entries had no record: Persecutive, Physiognomics, Pleyn, Postiller, Prepollex, Proterogyny and Provoker. Each is transcribed from two blind readings that agree and a reading of the 1898 printing, in the markup of its neighbours. The ledger gives each record's text.

Thirteen records carried a misspelled headword and take their printed name.

| Old name         | Printed name     | Old name          | Printed name       |
| ---------------- | ---------------- | ----------------- | ------------------ |
| Penumbrala       | Penumbral        | Pottassic         | Potassic           |
| Pharmacodymanics | Pharmacodynamics | Preantenultimate  | Preantepenultimate |
| Physiognommonic  | Physiognomonic   | Prosylogism       | Prosyllogism       |
| Plesimorphism    | Plesiomorphism   | Proventriulus     | Proventriculus     |
| Plougland        | Ploughland       | Pseudepigraphic   | Pseudepigraphical  |
| Pneumatogarm     | Pneumatogram     | Psitta-co-fulvine | Psittaco-fulvine   |
| Postliminiar     | Postliminious    |                   |                    |

One later-addition row follows its renamed record, Pharmacodynamics.

## Kept and held

- **The print is wrong (10):** broken or misprinted letters under Philologer, Pickery, Predacean, Privileged, Photophobia, Pledgor, Porcupine and Potential, "peso puro" for "peso duro" under Piaster, and "Tattler" for "Tatler" under Province.
- **Probable 1913 revisions:** Petalody, Pharaon, Phelloderm, Pigmy, Plastidule, Polar body, Port arms, Praseodymium, Precession, Protosomite, Pseudopod, Pseudopodium, Pseudosphere, Pseudospore and Pseudostella stand as the 1913 typists' text has them.
- **Held for the person (19 questions):** passages that GCIDE rewrote, where restoring the printed wording removes text the later-additions register lists or would blend two wordings: Penny (two), Pepper, Perquisite, Petition, Phosphorescence, Phthalide, Phthisis, Physician, Pigeon, Pika, Pinocle, Pituitary, Placebo, Plastide, Plate, Platinum, Postal and Preemption. Each is in the review queue with crops of both printings.
- **Held for a later pass (1):** Pet holds its homographs in another order than the print's.

## Cost

| Step                                     | Tokens       | Model time |
| ---------------------------------------- | ------------ | ---------- |
| Blind readings of 300 columns, two each  | 28.5 million | 5.9 hours  |
| Third readings of 1,004 strips           | 4.1 million  | 56 minutes |
| Second-chance readings of 40 strips      | 0.3 million  | 6 minutes  |
| Tiebreak readings of 67 strips (Fable)   | 0.3 million  | 6 minutes  |
| Reading of 30 unmatched printed entries  | 0.3 million  | 2 minutes  |
| Drafting, proofreading and review agents | 4.1 million  | 2.9 hours  |

That is about 376,000 tokens a page and 5,200 an entry. The integrating session's own usage was not measured.

## Limits

- Pronunciation marks, punctuation, capitals and italics are not compared.
- A single word that the 1913 printing changed cannot be told from a typist's slip without the 1913 page. The ruling of 10 November 2026 treats it as a slip.
- An entry that runs onto page 1161 is compared only as far as this batch's pages.
- The 1913 printing itself was not read. The only scan found is access-restricted.
