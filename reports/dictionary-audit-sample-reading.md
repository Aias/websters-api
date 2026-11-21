# Third blind reading of a sample of pages

A third blind reading of 20 printed pages, drawn at random across the 17 page ranges of the [page-reading batches](dictionary-audit-page-reading-2.md), measures what the passes have left behind. Opus read each column of the sample by the batches' own method (the same column pieces and the same reader prompt, blind to the record), and the reading was compared with the record as it stands. The [ledger](dictionary-audit-sample-reading.jsonl) has a row for each difference.

The sample reading has 50,075 words. It differs from the record in 131 places. 0 are corrected and 9 are held. That puts what the passes left behind at 0.18 differences per 1,000 words, counting the corrections and the held places, and 0.00 corrections per 1,000 words.

## The sample

The pages of each range were shuffled with `random.Random(20261121)`, the ranges were taken in a shuffled order, and pages were drawn round-robin across them, leaving out the 145 pages of the 10 November benchmark (`sample-reading-plan.json` in `.context/dictionary-audit/exhaustive/`). Printed pages read: 34, 106, 176, 287, 358, 431, 537, 590, 683, 742, 837, 851, 971, 1046, 1064, 1164, 1262, 1443, 1463, 1575.

## What the differences are

| Where the difference lies      | Differences |
| ------------------------------ | ----------: |
| In a registered later addition |          61 |
| In the text itself             |          30 |
| A genus the print abbreviates  |          23 |
| Text only GCIDE has            |           7 |
| Inside inflected-form brackets |           4 |
| In a pronunciation             |           3 |
| A source mark                  |           1 |
| Inside braces                  |           1 |
| Unreadable in the reading      |           1 |

An open difference is settled only where two certain readings agree against the record: the new blind reading, and a blind reading by Opus of a strip of the 1898 printing that reads as the print. The 1898 strip reads as the new reading in 22 of the 30 open differences. Sense numbers and letters count as structure, as the senses-5 lesson describes, and are not changed here.

| Outcome                                                              | Differences |
| -------------------------------------------------------------------- | ----------: |
| Corrected                                                            |           0 |
| In a registered later addition                                       |          63 |
| A genus the print abbreviates                                        |          23 |
| The 1898 reading does not side with the new reading                  |           8 |
| Text only GCIDE has                                                  |           7 |
| By hand, the alignment is unclear and the place needs a hand reading |           5 |
| Inside inflected-form brackets                                       |           4 |
| The source batch already decided this place                          |           4 |
| The entry has an open hold                                           |           4 |
| In a pronunciation                                                   |           3 |
| A source mark                                                        |           1 |
| By hand, a misprint the record corrects                              |           1 |
| By hand, a registered later addition                                 |           1 |
| Page edge                                                            |           1 |
| By hand, the record adds a word, and page-reading-4 kept it          |           1 |
| By hand, comparison artifact                                         |           1 |
| Structure                                                            |           1 |
| Inside braces                                                        |           1 |
| Unreadable in the reading                                            |           1 |
| By hand, reading artifact                                            |           1 |

## Cost

60 Opus calls read the 60 columns and 8 read the 1898 strips. No Fable calls.

## Limits

- The sample's pages are not contiguous, so an entry that runs onto a page outside the sample is compared only in part. Differences at those page edges are set aside.
- The comparison is by word, as in the batches. It does not compare punctuation, capitals or type styles.
- One blind reading sees a difference where the record and the print agree about 5 times in 1,000 words (the benchmark of 10 November). The 1898 strip and the hand review remove those.
