# Sense structure against the page readings, batch 5

This batch measures whether the record's numbered senses and lettered subsenses match the print across the main vocabulary, and restores the first verified sub-batch. It grants no complete-entry credit.

## What the page-reading batches compared

The page-reading comparison reduces the record and both readings to runs of letters and digits. A printed "2." is compared as the word `2`, and "(a)" as the word `a`. Sense order is compared only as word order, and markup, line breaks and parsed ownership are not compared. Its difference finder also drops any printed word that touches a pronunciation or a part-of-speech label in the record, so a "1." printed right after the label was never seen. Of the 148 differences that were digits alone, 87 were applied.

## The measured pool

A second comparison reads both page readings again and marks each printed sense number and letter. It then pairs them, through the aligned words, with the record's `sn` and `sd` elements and with numbers the record writes as plain text. A difference counts only when both readings give it. It compares 94,806 record and printed-entry pairs holding 74,925 record sense markers. 1,164 entries stay unmeasured because less than half their words align, mostly where a record carries long later text or the pairing took a neighbouring entry.

| Kind                                                                                 | Differences | Entries |
| ------------------------------------------------------------------------------------ | ----------: | ------: |
| A printed "1." missing after the label, while the record numbers the next sense "2." |          33 |      33 |
| Another missing number (Even's sense 5)                                              |           1 |       1 |
| A printed letter missing at the start of a sense                                     |           2 |       2 |
| A letter the print lacks                                                             |           4 |       4 |
| A number the print lacks, on a later sense numbered on                               |           3 |       3 |
| A moved block                                                                        |           1 |       1 |
| A number or letter written as plain text where the print has the same                |         165 |      77 |

No printed sense is split in two, and no compound sits out of its printed place, once registered later additions are set aside. The moved block is Yodle's later noun. The plain-text numbers and letters are lists inside notes and lettered parts of compounds, which the print sets the same way.

Set aside: 1,507 differences inside registered later additions, 12 that a registered numbered later sense explains, and 10 in entries with open structure holds. 806 more are printed numbers whose surrounding words also differ. Most come from a printed entry paired with the wrong record, or from a later sense the register does not list yet.

A scan of the record alone adds 64 homographs whose senses start at "2." that the readings did not confirm, 42 that skip or repeat a number, and 4 that start at "3." or "4.". [`dictionary-sense-structure-pool.jsonl`](dictionary-sense-structure-pool.jsonl) lists every candidate with its kind, page and status.

## Sub-batch 1

Twenty-five entries regain the printed "1." before their first sense: Castled, Check (v. i.), Confirmatory, Cooler, Fateful, Flooding, Flooring, Forbearance, Forecast, Forwardness, Latinize, Malign, Nestle, Performance, Physically, Physicist, Plater, Saddler, Shaggy, Showroom, Shut, Staging, Stream, Subtly and Uplandish. Each record already numbered the next sense "2.". Two blind readers of enlarged crops of two printings transcribed the start of each definition, and both certainly read "1." there. Each edit inserts `<div class="sn">1. </div>` before the first definition. The [ledger](dictionary-audit-senses-5.jsonl) records the readings. Two first crops showed a neighbouring entry, and a second crop was read for each.

Ten blind reader calls settled the sub-batch. The later-addition pointers still name their spans, and the rendered entries show the new number.

## Sub-batch 2

Sixteen more entries regain a printed number. Comparative, Running, Sheet, Solvent, Strike, Triton, Flap, Football, Pay and Unpicked lacked "1." altogether. Cornered, Scambler, Jura and Grafting wrote it as plain text inside the definition, so it becomes a sense number. Frill's number goes before its label, and Tantalus's moves there from after it, as the print sets them. Ovist takes back its printed definition, "(Biol.) Same as Ovulist.", in place of GCIDE's "(Zoöl.) A believer in ovism." Two blind readers certainly read each. Alderman's printed "2." loses a missing space inside its element, which changes no printed character.

The 110 record homographs that start at "2.", skip or repeat a number, or start later were settled against the page readings. 69 number later-added senses on from a printed sense the print leaves unnumbered, and 8 more have later or rewritten senses among the printed ones (Body, Escape, Even, Nebula, Nebulosity, Phosphorescence, Tail and Virus). These go to the [holds register](dictionary-audit-holds.jsonl) with three whose letters, and three whose numbers, run on into later senses: 82 hold rows. 19 homographs have no printed entry in the readings, 7 match the print as they stand, and Nice already has a structure hold.

The 1,164 entries the comparison could not measure fall into these causes:

| Cause                                                                                               | Entries |
| --------------------------------------------------------------------------------------------------- | ------: |
| Registered later additions cover most of the unmatched words                                        |     555 |
| Only one reading paired with the record, or the pairing or the entry's length defeats the alignment |     495 |
| The record carries later text the register does not list                                            |      93 |
| The 1913 printing or the Supplement revised the definition, which the record follows                |       8 |
| The printed entry is filed under another record (Exsert, Hydr-, Mon-, Panto-, -wards)               |       5 |
| Rewrite or loss inside the entry                                                                    |       8 |

Of the eight rewrites, Ovist is restored, Carcinoma, Gadolinium and Nominalize already have holds, Nebula's rewrite surrounds a registered later addition and is held, and Gable, Miscalculate and Short circuit remain word-recovery candidates. The pool file gives every entry its cause and status.

Eight blind reader calls settled sub-batch 2.

## What remains

Saxon and Sea nettle, whose printed letter at the start of a sense needs a reading. The three word-recovery candidates and the five entries filed under another record. The 93 entries with unregistered later text belong to the later-additions register rather than to this pool. The 82 holds wait on the person.
