# Third reading of unsettled word differences

The [page-reading batches](dictionary-audit-page-reading-2.md) left 167 word differences open where both readers agreed against the record and two strips of the 1898 printing settled nothing. A taller crop of the 1898 page settles 69 of them. Together with a fresh comparison of the reordered records and the slips a proofreader noticed, this pass makes 61 corrections in 50 records. The [ledger](dictionary-audit-settle.jsonl) has a row for each.

| Source of the correction                                         | Corrections |
| ---------------------------------------------------------------- | ----------: |
| The taller 1898 crop reads as the print                          |          40 |
| A reordered record, compared again                               |          10 |
| Noticed by the proofreader beside another correction             |           9 |
| Noticed by hand (Castrate's "p. p.", Pimaric's "Pinus Pinaster") |           2 |

## The taller crop

The first two strips showed about four lines each, and the reader could not find the place in them. This time each crop shows about thirty lines around the place where the first reader found the word. Opus read each crop without seeing either text.

| Verdict of the taller crop | Differences |
| -------------------------- | ----------: |
| Reads as the print         |          55 |
| Reads as the record        |          14 |
| Still unclear              |          98 |

Of the 55, 40 became corrections. Among them are "dilatation" under Augmentation, "charged" under Brokerage, "Narthecium" under Marsh, "Larus marinus" under Gull, the missing authority Cowell under Aver, and the formula of carbonic acid, which a later editor had rewritten. The other 15 stay as they are: three are misprints in the print ("eaudate" under Acaudate, "restcration" under Refusion, "coai" under Underclay), and twelve are not differences in the words, such as a table, a figure's description, or a comparison that had lined a word up against the wrong place.

## Reordered records

The [homograph order pass](dictionary-audit-homograph-order.md) put the entries of 100 records in the printed order. The earlier word comparison had lined those records up against the print in record order, so part of each was compared with the wrong entry. Comparing them again found 33 fresh differences. Ten are corrections, each given by both readers and read by eye on a crop of the 1898 page: "Old politicians chew on wisdom past" and "a quid; a cud. [Low]" under Chew, "to countenance" under Favor, "fierce" under Mankind, "sparkling" under Exchange, "adaptation" under Specific, and others. One is a question for the person: the last sentence of Malignant's note on malignant pustule, which a later editor rewrote. The rest are later additions and phrase headings that keep the record's form.

## Proofreading

A second agent read both readers' lines and the page crop for all 59 corrections drafted to that point and found each one right. It reported nine more slips beside them, which are corrected too: the missing "walls" in Castle's figure key, the words "little loaf, a lozenge, dim. of" lost from Pastille's etymology, "three-masted" under Barkentine, a damaged form pronunciation under Crook, a missing space under Exchange, and four marks of punctuation.

## Cost

| Step                                          | Tokens      | Model time |
| --------------------------------------------- | ----------- | ---------- |
| Readings of 167 taller crops (Opus, 61 calls) | 2.8 million | 43 minutes |
| Proofreading of 59 corrections (one agent)    | 0.6 million | 18 minutes |

## Limits

- 98 differences are still unclear after three crops of the 1898 printing. Their rows in the page-reading ledgers say so.
- The fresh comparison covered only the 100 reordered records.
- The proofreader's nine finds were slips beside places it was already reading. Other entries have had no such second look at their surroundings.
