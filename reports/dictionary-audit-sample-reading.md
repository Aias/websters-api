# Third blind reading of a sample of pages

A third blind reading of 30 printed pages, drawn at random across the 17 page ranges of the [page-reading batches](dictionary-audit-page-reading-2.md), measures what the passes have left behind. Opus read each column of the sample by the batches' own method (the same column pieces and the same reader prompt, blind to the record), and the reading was compared with the record as it stands. The [ledger](dictionary-audit-sample-reading.jsonl) has a row for each difference.

The sample reading has 74,796 words. It differs from the record in 213 places. 0 are corrected and 12 are held. That puts what the passes left behind at 0.16 differences per 1,000 words, counting the corrections and the held places, and 0.00 corrections per 1,000 words.

## The sample

The pages of each range were shuffled with `random.Random(20261121)`, the ranges were taken in a shuffled order, and pages were drawn round-robin across them, leaving out the 145 pages of the 10 November benchmark (`sample-reading-plan.json` in `.context/dictionary-audit/exhaustive/`). Printed pages read: 12, 34, 106, 125, 176, 200, 264, 287, 358, 431, 537, 590, 683, 742, 810, 837, 851, 930, 971, 1046, 1064, 1164, 1215, 1262, 1404, 1443, 1463, 1529, 1575, 1649.

## What the differences are

| Where the difference lies      | Differences |
| ------------------------------ | ----------: |
| In a registered later addition |         101 |
| In the text itself             |          55 |
| A genus the print abbreviates  |          29 |
| Inside inflected-form brackets |           9 |
| Text only GCIDE has            |           9 |
| In a pronunciation             |           4 |
| Unreadable in the reading      |           4 |
| A source mark                  |           1 |
| Inside braces                  |           1 |

An open difference is settled only where two certain readings agree against the record: the new blind reading, and a blind reading by Opus of a strip of the 1898 printing that reads as the print. The 1898 strip reads as the new reading in 42 of the 55 open differences. Sense numbers and letters count as structure, as the senses-5 lesson describes, and are not changed here.

| Outcome                                                               | Differences |
| --------------------------------------------------------------------- | ----------: |
| Corrected                                                             |           0 |
| In a registered later addition                                        |         105 |
| A genus the print abbreviates                                         |          29 |
| The 1898 reading does not side with the new reading                   |          12 |
| Inside inflected-form brackets                                        |           9 |
| Text only GCIDE has                                                   |           9 |
| By hand, the alignment is unclear and the place needs a hand reading  |           8 |
| The entry has an open hold                                            |           8 |
| The source batch already decided this place                           |           7 |
| Structure                                                             |           4 |
| In a pronunciation                                                    |           4 |
| Unreadable in the reading                                             |           4 |
| By hand, reading artifact                                             |           3 |
| By hand, a misprint the record corrects                               |           2 |
| Page edge                                                             |           2 |
| By hand, comparison artifact                                          |           2 |
| A source mark                                                         |           1 |
| By hand, a registered later addition                                  |           1 |
| By hand, the record adds a word, and page-reading-4 kept it           |           1 |
| By hand, the record adds text the print lacks, which the batches keep |           1 |
| Inside braces                                                         |           1 |

## Cost

90 Opus calls read the 90 columns and 11 read the 1898 strips. No Fable calls.

## Limits

- The sample's pages are not contiguous, so an entry that runs onto a page outside the sample is compared only in part. Differences at those page edges are set aside.
- The comparison is by word, as in the batches. It does not compare punctuation, capitals or type styles.
- One blind reading sees a difference where the record and the print agree about 5 times in 1,000 words (the benchmark of 10 November). The 1898 strip and the hand review remove those.
