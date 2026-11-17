# Page-reading batch 15

Two models read printed pages 1261 to 1360 without seeing the record, and their agreed reading is compared with the record word by word. This batch makes 568 corrections in 442 entries, adds 2 entries that the electronic text never had, and gives 12 records their printed spelling. It opens 11 holds, all questions in the review queue. The batch grants no complete-entry review credit.

The method is the one [batch 2](dictionary-audit-page-reading-2.md) describes, with the changes of batches [3](dictionary-audit-page-reading-3.md) to [12](dictionary-audit-page-reading-12.md). Nothing in the method changed for this batch.

## Pages and readers

- **Pages:** leaves n308 to n407 of the 1895 volume 2 scan, Run through Snail, about 255,000 words in 6,578 printed entries.
- **Readers:** Opus and Sonnet. Opus alone found 55 differences the pair had missed, Fable read those strips blind and agreed on 32, and 4 became corrections. A second, taller strip of the 1898 printing settled 15 of 21 differences that the first strip had left unclear.
- **Proofreading:** three reviewers read all 477 rule-drafted corrections and reported 44. Eight of the reports are single words where the 1913 typists' text agrees with the record and both readings make sense. Under the ruling of 10 November 2026 those follow the print, and the ledger lists them. Reports that a correction would mix the printed wording with a later rewrite went to the person.

## Results

The comparison found 1,062 differences, the 32 from the tiebreak reading included.

| Disposition                                                     | Differences |
| --------------------------------------------------------------- | ----------: |
| Corrected (568 edits)                                           |         568 |
| Registered later addition, unchanged                            |         159 |
| Genus spelled out by convention, unchanged                      |          92 |
| GCIDE-only words absent from Gutenberg and the print, unchanged |          29 |
| Inflected forms that are only labels or pronunciations          |           5 |
| Print unreadable in the 1895 scan, unchanged                    |           4 |
| Pronunciations and shared headwords                             |          49 |
| The record follows the 1913 Supplement, unchanged               |           2 |
| The print is wrong, or the 1913 printing revised the passage    |          28 |
| Other differences that keep the record                          |           1 |
| The 1898 printing reads as the record                           |          50 |
| Not a difference in the text, or not settled                    |          61 |
| Held                                                            |          14 |

The [ledger](dictionary-audit-page-reading-15.jsonl) gives every difference with its disposition, and every edit with its exact fragments and readings.

## Corrections

- **535 follow the ruling of 10 November 2026.** The record's reading came from the typists. Examples: Sidereal "measured" for "measuring", Small "guests" for "quests", Sib "born" for "birn", Shin "railroad" for "railbroad", and the authorities "Byron" under Siege and "Barrow" under Singularist. Running regains the phrase "Running fight", Slogan "hence, any rallying cry", Sack the gloss "[i. e., sherry]", and Script its printed specimen line. Seducer regains "specifically, one who prevails over the chastity of a woman by enticements and persuasions".
- **33 undo a later GCIDE change.** Seriema regains its printed definition, Sight "A small piece of metal", Sankhya "Hindoo", Shape "image", and Scanty, Skill-less and Smockless "Wanting" for "Lacking". Selenium regains its printed atomic weight.
- **Inflected forms:** 11 are corrected, among them Scorn "Scorning", Seemly "Seemliest", Seesaw "Seesawed", Sentry "Sentries", Sharpen "Sharpened", Sheathe "Sheathing" and Slide "Sliding".
- **Shuffling** carried the printed entry Shufflingly under its own headword. Shufflingly is now its own record.
- **Small slips fixed by hand:** Sinaitic loses a stray "part" before "Bible", Silverbill's genus reads Munia in all three names, Sentence cites "Dan. viii. 23", Saxhorn names "Antoine Adolphe Joseph Sax", and Scrannel, Shill and Snag regain the marks "[Obs.]", "[Prov. Eng.]" and "[U. S.]".

## New and renamed records

Two printed entries had no record: Saw palmetto, a cross-reference, and Shufflingly. Each is transcribed from two blind readings that agree and a reading of the 1898 printing, in the markup of its neighbours. The ledger gives each record's text.

Twelve records carried a misspelled headword and take their printed name.

| Old name        | Printed name    | Old name   | Printed name |
| --------------- | --------------- | ---------- | ------------ |
| Scratching      | Scratchingly    | Skun       | Skum         |
| Sea-mail        | Sea-mall        | Skunkball  | Skunkbill    |
| Seldshewn       | Seldshown       | Sleightly  | Sleightily   |
| Semicylyndrical | Semicylindrical | Slothhound | Slothound    |
| Shintiism       | Shintoism       | Sludy      | Sludgy       |
| Shredcook       | Shredcock       | Smorsato   | Smorzato     |

## Kept and held

- **The print is wrong (6):** turned or broken letters under Safe-conduct, Sartorial, Scad, Scagliola and Slue, and "Writtten" under Sheeling.
- **Probable 1913 revisions:** Saint, Satsuma ware, Scabious, Schizomycetes, Scotist, Sen, Sequoia, Sheen, Sheik, Short and Short circuit stand as the 1913 typists' text has them. Under Short the older printings exchange sulphur and phosphorus, and under Sen they give the coin an older value.
- **Held for the person (11 questions):** passages that GCIDE rewrote, where restoring the printed wording removes text the later-additions register lists or would blend two wordings: Salty, Saponin, Seminal, Setback, Shady, Shark, Shrug (two), Sinological, Sinologue and Sloakan. Each is in the review queue with crops of both printings.

## Cost

| Step                                     | Tokens       | Model time |
| ---------------------------------------- | ------------ | ---------- |
| Blind readings of 300 columns, two each  | 28.7 million | 5.5 hours  |
| Third readings of 733 strips             | 3.2 million  | 44 minutes |
| Second-chance readings of 21 strips      | 0.2 million  | 3 minutes  |
| Tiebreak readings of 55 strips (Fable)   | 0.2 million  | 6 minutes  |
| Reading of 16 unmatched printed entries  | 0.1 million  | 2 minutes  |
| Drafting, proofreading and review agents | 2.3 million  | 1.5 hours  |

That is about 347,000 tokens a page and 5,300 an entry. The integrating session's own usage was not measured.

## Limits

- Pronunciation marks, punctuation, capitals and italics are not compared here. The [punctuation and capitals pass](dictionary-audit-punctuation.md) covers two of those.
- A single word that the 1913 printing changed cannot be told from a typist's slip without the 1913 page. The ruling of 10 November 2026 treats it as a slip.
- An entry that runs onto page 1361 is compared only as far as this batch's pages.
- The 1913 printing itself was not read. The only scan found is access-restricted.
