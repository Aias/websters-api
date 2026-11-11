# Page-reading batch 3

Two models read printed pages 51 to 150 without seeing the record, and their agreed reading is compared with the record word by word. This batch makes 281 corrections in 225 entries, adds 8 entries that the electronic text never had, and gives 3 records their printed spelling. It opens five holds. The batch grants no complete-entry review credit.

The method is the one [batch 2](dictionary-audit-page-reading-2.md) describes. This report gives what differs.

## Method changes

- **Pages:** leaves n156 to n255 of the 1907 volume 1 scan, about 242,000 words in 7,016 printed entries.
- **Overlapping pieces:** consecutive column pieces share one printed line, so a line that falls on a cut is whole in one of them. No line was lost in this batch.
- **Second reader:** Fable read 241 of the 300 columns. Its weekly allowance then ran out, and Sonnet read the other 59. On twelve columns all three models read, Opus and Fable differed in 1 place in 9,800 words and Sonnet differed from each in 8 or 9. A correction still needs both readers to agree, so a weaker second reader costs coverage where it misreads and does not produce wrong corrections. Across the batch the two readings differ in 134 places, 0.55 per thousand words.
- **Sorting:** a genus the print abbreviates is now recognised inside scientific-name markup at any length ("Ph. vulgaris"). A correction that touches an etymology or a number is drafted by hand.

## Results

The comparison found 745 differences.

| Disposition                                                     | Differences |
| --------------------------------------------------------------- | ----------: |
| Corrected (281 edits)                                           |         285 |
| Registered later addition, unchanged                            |         216 |
| Genus spelled out by convention, unchanged                      |          74 |
| GCIDE-only words absent from Gutenberg and the print, unchanged |          19 |
| Inflected forms and run-in derivatives, not judged              |          12 |
| Print unreadable in the 1907 scan, unchanged                    |           8 |
| Source marks, pronunciations and shared headwords               |           9 |
| The print is wrong or the record follows the Supplement, kept   |           7 |
| The 1898 printing reads as the record                           |          16 |
| Not a difference in the text, or not settled                    |          92 |
| Held                                                            |           7 |

The [ledger](dictionary-audit-page-reading-3.jsonl) gives every difference with its disposition, and every edit with its exact fragments and readings.

## Corrections

- **165 follow the ruling of 10 November 2026.** The record's reading came from the typists. Examples: Antimonarchical "monarchical" for "monarchial", Bin "manger" for "manager", Birdlime's authority "Goodwin" for "Coodwin", Antiseptic's list regains "salt", Attend regains the verse line "His companion, youthful Valentine,", and Bar regains the etymology clause "of unknown origin; cf. Arm. bar branch, barren bar".
- **116 undo a later GCIDE change.** Examples: Anaesthetic "rendering insensible" for "causing anesthesia", Arabic "Mohammedans" for "Moslems", Aricine "Peru" for "Chile", Berlin "Prussia" for "Germany", and Bison, which again "is now restricted" and "is rapidly decreasing in numbers". Whole definitions return under Anasarca, Angina pectoris, Antapoplectic, Anthelmintic, Balloonry, Barracouta and Beast.
- **Analyze** regains the two printed examples GCIDE dropped, "to analyze a fossil substance; to analyze a sentence or a word". The examples GCIDE added stay.
- **Axis** prints its heading as the page does, "Axis of a telescope or microscope", with the second complete name kept as an annotation.
- **Bismuthyl** had the definition of the next printed entry. It now reads "A radical, BiO, regarded as existing in some of the basic salts of bismuth."

## New and renamed records

Eight printed entries had no record. Each is transcribed from two blind readings that agree and a reading of the 1898 printing, in the markup of its neighbours.

| Record         | Printed entry                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| Antitoxic      | a. Counteracting poison.                                                                                        |
| Aortal         | a. Aortic; resembling the aorta. [R.]                                                                           |
| Asymptotical   | Asymptotic, Asymptotical, a. Pertaining to, or partaking of the nature of, an asymptote. — Asymptotically, adv. |
| Authentication | n. The act of authenticating; the giving of authority or credit by the necessary formalities; confirmation.     |
| Awoke          | imp. of Awake.                                                                                                  |
| Bareboned      | a. So lean that the bones show their forms. Shak.                                                               |
| Bequeather     | n. One who bequeaths.                                                                                           |
| Bismutite      | n. (Min.) Hydrous carbonate of bismuth. [Written also bismuthite.]                                              |

Three records carried a misspelled headword and take their printed name: Appromt becomes Apprompt, Angurize becomes Augurize, and Banquetter becomes Banqueter. No other record referred to the old names.

## Kept and held

- **The print is wrong:** Betray names the author of two quotations "T. Watts". He is Isaac Watts, as the record has it. Backwater's "-ward" is a slip for "-water".
- **The record follows the 1913 Supplement:** Ariel, Argon and Bairam carry Supplement text that the main vocabulary page does not print.
- **The 1898 printing reads as the record (16):** worn or broken type in the 1907 impression.
- **Held (5 questions):** Betulin and Battalion, whose definitions GCIDE rewrote around pieces that are registered later additions. Asphaltite and Aristarchy, which the record carries twice. The block "Arm's end, Arm's length, Arm's reach. See under Arm.", which the print sets as its own entry and the record keeps inside Arms.

## Cost

| Step                                    | Tokens       | Model time |
| --------------------------------------- | ------------ | ---------- |
| Blind readings of 300 columns, two each | 32.5 million | 9.4 hours  |
| Third readings of 418 strips            | 1.9 million  | 27 minutes |
| Hand drafting and the new records       | 1.0 million  | 55 minutes |

That is about 355,000 tokens a page and 5,000 an entry. The integrating session's own usage was not measured.

## Limits

- Pronunciation marks, punctuation, capitals and italics are not compared.
- In the 59 columns Sonnet read, about 8 words in 10,000 go uncompared where it misreads.
- An entry that runs over from page 50 or onto page 151 is compared only as far as this batch's pages.
- The 1913 printing itself was not read. The only scan found is access-restricted.
