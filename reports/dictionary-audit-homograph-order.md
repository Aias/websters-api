# Homograph order pass

Same-spelled entries now stand in the order the print sets them in. The pass compares every record that holds several entries with both blind readings of its page. It changes 146 records: 100 take the printed order, and 131 lose a ‖ that the source had left before a native entry. The [ledger](dictionary-audit-homograph-order.jsonl) has one row for each record.

| Records                                          | Count |
| ------------------------------------------------ | ----: |
| Records that hold several entries                | 9,859 |
| Already in the printed order                     | 9,376 |
| Fewer than two of the entries are in the print   |   272 |
| The comparison could not pair entries with print |    59 |
| An entry is headed by another spelling           |     6 |
| Reordered                                        |   100 |
| Reordered, of which a stray ‖ also dropped       |    85 |
| Stray ‖ dropped, order unchanged                 |    46 |

## The stray mark

In the print, ‖ before a headword flags a foreign word. The source writes that mark as the entity `&#x2016;`. It also carries a literal ‖ before one entry in 141 records, almost always the last entry. Most of these are the entry the print sets first, the one with the pronunciation: Welt's noun stood after its two verbs, and Crook's noun after both of its verbs. The site showed the mark as if Welt and Crook were foreign words.

Both readers transcribe a printed ‖, and the Gutenberg text writes it as `||`. A stray mark is dropped where neither reader has one before the printed entry. The Gutenberg text has none before any of them either.

## Method

1. Each record is split into its entries at the headwords that open a line.
2. Each reader's entries with the same heading are collected in page order from the page-reading batches. An entry that a column break splits is counted once.
3. Record entries are paired with printed entries by their first 45 words. A pair counts when it is clearly the best match for both sides.
4. A record is reordered when both readers pair every entry and give one order, and the Gutenberg text does not contradict them. The Gutenberg text has the same order in 141 of the 146 changed records and lacks an entry in the other five.
5. Each change is a permutation of whole entries. No word inside an entry changes. Granulate also gains the line break its two entries lacked.

Three records were settled by hand because the comparison could not pair one entry: Deteriorate, Stout and Fine. Fine's adjective moves to the front, and its adverb and its verb "To become fine" keep their place after the printed entries, because the print lacks them. Absorbent was reordered on one reader's certain pairing and the Gutenberg text, with the other reader giving the same order.

Exchange takes the printed order and loses its stray mark. It also takes three corrections that its holds had carried since the quick-wins pass: "To part with, give, or transfer", "a palace for a cell" and "a dollar exchanges". Both readers of the 1907 scan have all three. The batch that had frozen the entry is no longer running, and page-reading batch 7 had already corrected the entry.

## Holds

The pass closes 46 holds: the 42 differences in homograph order that page-reading batches 5 to 18 recorded, and Exchange's four corrections. Distress and Flake already stood in the printed order. Flake's third noun is the Supplement's and follows the two printed nouns.

Ten stray marks stand before entries that the main vocabulary lacks: Homeless, Intern, Jawbone, Knockabout, Laager, Manicure, Media, Meld, Minuscule and Ping-pong. The page readings do not cover these entries, so each has a question in the review queue and a hold. The Gutenberg text of the Supplement has Knockabout, Laager, Manicure, Meld and Ping-pong without the mark. Genre and Pacifico keep a ‖ that their printed entries have.

## Limits

- The 59 records the comparison could not pair were checked for any witness that orders them differently from the record. Brassy and Punt came up, and in both the difference was a later-added entry paired with the wrong printed one. The rest stand in the printed order as far as the pairing shows.
- Six records hold an entry headed by another spelling, such as Fondu with Fondue. Their order was not compared.
- Entries from the Supplement and later additions have no page reading. Their place among the printed entries follows the record.
- The word comparison of the page-reading batches lined each record up with the print in record order. In a record whose entries stood in another order, part of the text was compared against the wrong entry. Exchange's three corrections went unseen that way. The 100 reordered records were compared again, and the [settle pass](dictionary-audit-settle.md) corrects the ten differences that turned up.
