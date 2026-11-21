# Third blind reading of a sample of pages

A third blind reading of 90 printed pages, drawn at random across the 17 page ranges of the [page-reading batches](dictionary-audit-page-reading-2.md), measures what the passes have left behind. Opus read each column of the sample by the batches' own method (the same column pieces and the same reader prompt, blind to the record), and the reading was compared with the record as it stands. The [ledger](dictionary-audit-sample-reading.jsonl) has a row for each difference.

The sample reading has 219,444 words. It differs from the record in 615 places. 3 are corrected and 42 are held. That puts what the passes left behind at 0.21 differences per 1,000 words, counting the corrections and the held places, and 0.01 corrections per 1,000 words.

## The sample

The pages of each range were shuffled with `random.Random(20261121)`, the ranges were taken in a shuffled order, and pages were drawn round-robin across them, leaving out the 145 pages of the 10 November benchmark (`sample-reading-plan.json` in `.context/dictionary-audit/exhaustive/`). Printed pages read: 12, 18, 23, 34, 39, 106, 109, 125, 135, 150, 172, 176, 178, 180, 200, 264, 265, 287, 292, 336, 353, 358, 421, 428, 431, 432, 462, 482, 489, 510, 537, 552, 590, 601, 623, 631, 683, 696, 702, 722, 742, 747, 790, 810, 820, 825, 837, 851, 861, 868, 901, 930, 933, 969, 970, 971, 1008, 1030, 1046, 1062, 1064, 1068, 1071, 1093, 1164, 1168, 1200, 1215, 1238, 1261, 1262, 1292, 1306, 1327, 1381, 1392, 1404, 1437, 1443, 1463, 1510, 1515, 1519, 1524, 1529, 1563, 1575, 1600, 1649, 1666.

## What the differences are

| Where the difference lies      | Differences |
| ------------------------------ | ----------: |
| In a registered later addition |         270 |
| In the text itself             |         187 |
| A genus the print abbreviates  |          58 |
| Inside inflected-form brackets |          25 |
| Unreadable in the reading      |          25 |
| Text only GCIDE has            |          24 |
| Inside braces                  |          14 |
| In a pronunciation             |          11 |
| A source mark                  |           1 |

An open difference is settled only where two certain readings agree against the record: the new blind reading, and a blind reading by Opus of a strip of the 1898 printing that reads as the print. The 1898 strip reads as the new reading in 135 of the 187 open differences. Sense numbers and letters count as structure, as the senses-5 lesson describes, and are not changed here.

| Outcome                                                                                                   | Differences |
| --------------------------------------------------------------------------------------------------------- | ----------: |
| Corrected                                                                                                 |           3 |
| In a registered later addition                                                                            |         276 |
| A genus the print abbreviates                                                                             |          58 |
| The 1898 reading does not side with the new reading                                                       |          40 |
| The entry has an open hold                                                                                |          32 |
| The source batch already decided this place                                                               |          27 |
| Inside inflected-form brackets                                                                            |          25 |
| Unreadable in the reading                                                                                 |          25 |
| Text only GCIDE has                                                                                       |          24 |
| By hand, comparison artifact                                                                              |          16 |
| Inside braces                                                                                             |          14 |
| By hand, the alignment is unclear and the place needs a hand reading                                      |          13 |
| Page edge                                                                                                 |          11 |
| In a pronunciation                                                                                        |          11 |
| Structure                                                                                                 |           8 |
| By hand, reading artifact                                                                                 |           6 |
| By hand, a misprint the record corrects                                                                   |           4 |
| By hand, an abbreviated compound heading in the print, which the record spells out                        |           4 |
| By hand, the record carries a different definition in the printed one's place, a question for the person  |           3 |
| By hand, the record adds text the print lacks, which the batches keep                                     |           2 |
| By hand, the record carries a rewritten definition in the printed one's place, a question for the person  |           2 |
| By hand, the record rewrites the print's wording to add a name, a question for the person                 |           2 |
| By hand, the record's definition follows another wording                                                  |           2 |
| By hand, the record's definition differs from the print as a block and needs a hand draft                 |           2 |
| A source mark                                                                                             |           1 |
| By hand, a registered later addition                                                                      |           1 |
| By hand, the record adds a word, and page-reading-4 kept it                                               |           1 |
| By hand, h and k in a transliteration, and the Gutenberg text has neither reading                         |           1 |
| By hand, the record carries a different description in the printed one's place, a question for the person |           1 |

## Cost

270 Opus calls read the 270 columns and 28 read the 1898 strips. No Fable calls.

## Limits

- The sample's pages are not contiguous, so an entry that runs onto a page outside the sample is compared only in part. Differences at those page edges are set aside.
- The comparison is by word, as in the batches. It does not compare punctuation, capitals or type styles.
- One blind reading sees a difference where the record and the print agree about 5 times in 1,000 words (the benchmark of 10 November). The 1898 strip and the hand review remove those.
