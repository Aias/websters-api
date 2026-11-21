# Headword pronunciation pass

The print gives a pronunciation in parentheses after most headwords. The record had one for about 23,000 of its 120,705 headwords. This pass adds 61,989 printed pronunciations and replaces 3,528 damaged ones. 36,431 of the additions and 1,499 of the replacements come from the two blind readings that the [page-reading batches](dictionary-audit-page-reading-2.md) already made. The other 25,558 additions and 2,029 replacements needed a closer reading of an enlarged crop. 88,820 headwords now carry a whole pronunciation.

A pronunciation is added from the page readings only where both readers give the same marks and the reading falls outside the cases where readers are known to miss a mark. 486 printed pronunciations stay out for now. Each has a row in its ledger that says why.

| Pages     | Record lacked |  Added | Replaced | After a closer reading | Could hide a missed mark | Readers differ | Other held | Ledger                                           |
| --------- | ------------: | -----: | -------: | ---------------------: | -----------------------: | -------------: | ---------: | ------------------------------------------------ |
| 1–50      |           915 |    598 |        3 |                    308 |                        1 |              1 |          4 | [jsonl](dictionary-audit-pronunciation-2.jsonl)  |
| 51–150    |           323 |    161 |        0 |                    153 |                        1 |              3 |          5 | [jsonl](dictionary-audit-pronunciation-3.jsonl)  |
| 151–250   |         2,400 |  1,340 |        6 |                  1,014 |                        6 |             26 |          8 | [jsonl](dictionary-audit-pronunciation-4.jsonl)  |
| 251–350   |         3,807 |  1,687 |      572 |                  1,523 |                        5 |             14 |          6 | [jsonl](dictionary-audit-pronunciation-5.jsonl)  |
| 351–450   |         4,561 |  2,167 |      249 |                  2,110 |                        3 |             25 |          7 | [jsonl](dictionary-audit-pronunciation-6.jsonl)  |
| 451–550   |         4,806 |  2,613 |       25 |                  2,125 |                        9 |             25 |          9 | [jsonl](dictionary-audit-pronunciation-7.jsonl)  |
| 551–650   |         4,097 |  2,407 |       30 |                  1,623 |                        6 |             20 |         11 | [jsonl](dictionary-audit-pronunciation-8.jsonl)  |
| 651–750   |         4,095 |  2,357 |        9 |                  1,706 |                        5 |             14 |          4 | [jsonl](dictionary-audit-pronunciation-9.jsonl)  |
| 751–850   |         4,209 |  2,488 |       14 |                  1,684 |                        4 |             15 |          4 | [jsonl](dictionary-audit-pronunciation-10.jsonl) |
| 851–960   |         4,903 |  2,737 |       13 |                  2,110 |                        7 |             30 |          6 | [jsonl](dictionary-audit-pronunciation-11.jsonl) |
| 961–1060  |         5,007 |  2,835 |        5 |                  2,128 |                        7 |             28 |          4 | [jsonl](dictionary-audit-pronunciation-12.jsonl) |
| 1061–1160 |         5,262 |  2,742 |       18 |                  2,467 |                       11 |             21 |          3 | [jsonl](dictionary-audit-pronunciation-13.jsonl) |
| 1161–1260 |         3,523 |  1,195 |      505 |                  1,799 |                        8 |             12 |          4 | [jsonl](dictionary-audit-pronunciation-14.jsonl) |
| 1261–1360 |         4,140 |  2,614 |       20 |                  1,489 |                        0 |             10 |          7 | [jsonl](dictionary-audit-pronunciation-15.jsonl) |
| 1361–1460 |         3,758 |  2,299 |       10 |                  1,433 |                        4 |              6 |          6 | [jsonl](dictionary-audit-pronunciation-16.jsonl) |
| 1461–1560 |         4,389 |  2,450 |        2 |                  1,907 |                        4 |             24 |          2 | [jsonl](dictionary-audit-pronunciation-17.jsonl) |
| 1561–1681 |         5,808 |  3,741 |       18 |                  2,008 |                        5 |             23 |         13 | [jsonl](dictionary-audit-pronunciation-18.jsonl) |
| Total     |        66,003 | 36,431 |    1,499 |                 27,587 |                       86 |            297 |        103 |                                                  |

"Record lacked" counts entries that both readers pair with a printed entry, where the print has a pronunciation and the record had none or a damaged one.

## Method

1. **Pair entries.** Each record entry is paired with the printed entry of each reader by its opening words, as in the [homograph order pass](dictionary-audit-homograph-order.md). 105,296 of the record's 111,589 entries are paired by both readers. The print has a pronunciation for 86,760 of them.
2. **Bring both readings to one notation.** The readers write the same printed mark in several ways. A macron with a tick, a dot or an acute above it is one mark, the vowel of "senate" or "event". A y with any mark is the y of "pity", because the notation has no other marked y. An a with a ring or an accent is the dotted a of "ask", which the second reader writes that way about 2,000 times. The long and short oo are each written one way, and every stress mark and apostrophe is compared as one sign.
3. **Require agreement.** The two readings must then be equal, letter for letter and mark for mark.
4. **Set aside what readers miss.** The record's own pronunciations show where two agreeing readers can both be wrong. Those cases are listed below and stay out.
5. **Write the record's markup.** Each mark becomes a combining hex reference after its letter. An unmarked vowel outside "oi", "ou" and "oo" is set in italic, as the print sets its obscure vowels and as the record's existing pronunciations do. The printed form is kept as it is, so a pronunciation that gives only the last syllables stays partial.
6. **Take the stress weights from the headword.** The readers do not tell a heavy stress mark from a light one. The record's headword has both, so each stress in the respelling takes the weight of the same syllable of the headword. A pronunciation whose syllables or stresses do not line up with the headword stays out, and so does one under a headword whose own marks are unsound, such as two heavy marks in one word.

## What the record's own pronunciations show

12,603 entries already had a whole pronunciation and fall in the class that is added. The same steps were run on them as a check.

| Result                                                              | Entries |
| ------------------------------------------------------------------- | ------: |
| The markup built from the readings is the record's own              |  10,897 |
| Same marks, with the record writing italics or a weight differently |     115 |
| The record spells out what the print abbreviates                    |   1,194 |
| A mark differs                                                      |     186 |
| A letter differs                                                    |      96 |
| A stress or a section number differs                                |      72 |
| The lengths differ in another way                                   |      43 |

A mark differs in 1.5% of these entries. Many of the differences are the record's own slips: "clăm" for "klăm" under Clam, "ĭn-kûv′" under Incurve, "pĕr-ĕn′nĭ-yy̆" under Perennity. The 1,194 spelled-out forms are full respellings where the print has only the last syllables, as "ăk-kloi′" under Accloy for the printed "-kloi′".

Of the 1,499 pronunciations that the page readings replace, 241 were bare placeholders. The other 1,258 had lost their vowels but kept their consonants, hyphens and stress marks. The new reading fits that surviving frame in 1,203 of them. The other 55 are mostly slips inside the damaged text.

## Where two readers agree and are both wrong

| Case                                                        | Held back |
| ----------------------------------------------------------- | --------: |
| A plain long vowel in a syllable without stress             |        60 |
| A plain long vowel in a word the print marks as foreign     |        20 |
| "th", which may be the barred th of "then"                  |         8 |
| A vowel with dots below, where one dot and two are confused |        10 |
| An n before k or g, which may carry the line under it       |         0 |

A pronunciation can fall under more than one case. 86 are held back in all.

The first case is the largest. The print sets a small tick on the macron of the vowels of "senate", "event", "idea", "obey" and "unite". Of 4,077 such vowels in the record's pronunciations, both readers saw the tick on 15%, one reader on 44%, and neither on 40%. A tick that either reader saw is almost always real: readers put one on under 1% of the record's 7,621 plain long vowels. A plain long vowel in an unstressed syllable therefore proves nothing, and those pronunciations wait for a closer reading.

## Audit against the 1898 printing

200 pronunciations added from the page readings were drawn at random, 100 from each volume. For each, the entry's first lines were cut from the 1898 printing and enlarged three times, and Opus transcribed the pronunciation without seeing the draft.

| Result                                           | Count |
| ------------------------------------------------ | ----: |
| The reader found the entry in the crop           |   185 |
| Its reading equals the draft                     |   181 |
| The crop showed a neighbouring entry (Downiness) |     1 |
| The draft is wrong                               |     3 |

The three errors were checked by eye on the crops. Déblai has ticked vowels under its stress marks, as French words do. Diesinker has the n with a line under it. Both cases were then added to the list above and are held back throughout, so neither word was added from the page readings. Didine reads "dī′dīn" in print where both readers have "dī′dĭn". That one has no pattern, and it stands in the record as the readers gave it. On this sample about one added pronunciation in 180 has a wrong mark of that kind, and the sample is small enough that the true rate could be as high as 3%.

## Closer reading

The pronunciations held back above need marks that a reader of the whole column misses. For each, the entry's first lines were cut from the 1898 printing, enlarged three times, and read blind by Opus. The closer reading covers printed pages 1 to 1681. With the second closer reading described below, it adds 25,558 pronunciations and replaces 2,029 damaged ones.

The three readings are then fused letter by letter. All three must have the same letters, hyphens and stresses. A mark stands when the closer reading gives it and a page reader agrees, or when the closer reading shows one of the marks page readers miss: the tick, the line under n, the bar through th, or the other count of dots below. A mark that a page reader saw and the closer reading did not is left open.

Before the pass ran, the closer reading was tried on 200 entries whose existing pronunciation has one of those marks. It saw 144 of 147 ticks and added none to 71 plain long vowels. The two page readers had both seen six of those ticks. A second closer reading of the same crops missed different ticks: only one was missed by both. Fused with the page readings, the result equals the record in 129 of 133 entries where the record and the print give the same form.

| Outcome of 28,070 closer readings                                                                                                                          | Entries |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------: |
| Added                                                                                                                                                      |  25,558 |
| Replaced a damaged pronunciation                                                                                                                           |   2,029 |
| A page reader saw a mark that neither closer reading did                                                                                                   |     118 |
| The closer reading has other letters or stresses                                                                                                           |      66 |
| A closer reading saw a mark that the two that agree did not                                                                                                |      47 |
| No closer reading shows the entry                                                                                                                          |      44 |
| No two closer readings agree on every letter and mark                                                                                                      |      33 |
| The pronunciation has fewer syllables than the headword and no hyphen before it                                                                            |      31 |
| No two closer readings give the accents the same weights                                                                                                   |      30 |
| It holds something other than a respelling                                                                                                                 |      29 |
| The entry has several headwords                                                                                                                            |      26 |
| Two closer readings agree, but the markup after the headword has a shape the writer does not take                                                          |      18 |
| Closer readings give the accents different weights                                                                                                         |       9 |
| Closer readings agree in pairs on different readings                                                                                                       |       7 |
| Its syllables or stresses do not line up with the headword                                                                                                 |       6 |
| An entry with the same headword stands beside it, and fewer than two readings that agree were told which to take                                           |       5 |
| The weights read on the page leave a whole word without a heavy accent                                                                                     |       3 |
| It has a mark the notation does not use                                                                                                                    |       3 |
| A page reader saw a mark that the closer reading did not                                                                                                   |       2 |
| The two closer readings have different letters or stresses                                                                                                 |       2 |
| Closer readings agree in pairs on different readings: a blind Fable reading made to sample the written pronunciations sides with the earlier Fable reading |       2 |
| An entry with the same headword stands beside it, and the reader was not told which to take                                                                |       1 |
| The three readings give three marks                                                                                                                        |       1 |

A reading that keeps a plain long vowel in an unstressed syllable rests on one closer reading having seen no tick there. A second closer reading of those entries would catch most of the ticks the first one missed.

## Second closer reading

The first closer reading left 8,293 entries open that another reading could settle. 4,700 had never been found on the 1898 page. 1,862 crops had not shown the entry. In 1,731 the closer reading had other letters or marks than the page readings.

Each entry is now placed in another way. The reader's lines of its column are lined up with the words recognized on the scan, which gives the line the entry starts on. That line is carried to the 1898 page, and the crop is set on the headword where the 1898 page's own recognized words show it. Only 0 entries are still without a crop that shows them.

Where a first closer reading exists, both closer readings are fused with the page readings. Two closer readings that agree stand. A mark of a kind readers miss stands when either closer reading shows it. Otherwise three of the four readings must agree. On the calibration entries that rule equals the record in 137 of 141 entries where the record and the print give the same form. Of the other four, one is a missed tick, one a missed bar through th, one a breve that the 1898 page itself lacks, and one a neighbouring entry with the same headword.

The second pass adds 6,753 pronunciations and replaces 453 damaged ones.

| Settled by                                                                                          | Entries |
| --------------------------------------------------------------------------------------------------- | ------: |
| Both page readings and one closer reading                                                           |   3,594 |
| Two closer readings that agree                                                                      |   3,396 |
| One page reading and one closer reading, where the other page reading has other letters or stresses |     101 |
| Two closer readings, one of which shows a mark the other missed                                     |      66 |
| Two closer readings, and both page readings on the mark where they differ                           |      48 |
| Two closer readings that agree, where the page readings have other hyphens or stresses              |       1 |

### Entries beside a same-spelled entry

The reader is told only the headword. Where two entries with the same headword stand within two lines of each other, it can transcribe the wrong one. Of the pronunciations the first closer reading wrote, 447 have such a neighbour, and twelve of those neighbours have a pronunciation of the same shape with other marks. All twelve were read by eye on the 1898 page. Eleven were right. River, one who rives, had taken the short i of the river, and is corrected to (rīv′ẽr). The second pass holds such entries back until a reading that tells the reader which entry to take.

## Later readings

**Readings made for the headwords.** The [headword pass](dictionary-audit-headword.md) read the first lines of about 2,900 entries again, to check a headword or because a pronunciation waited on one, and each reading also wrote out the pronunciation. Fused with the earlier readings, and with the headwords corrected, they settle 1,029 more pronunciations.

**A second closer reading for what rested on one.** A pronunciation that keeps a plain long vowel without stress, a plain th, an n before k or g, or dots below stood on one closer reading having seen nothing more there. 9,824 of them have now been read a second time. The second reading confirms 9,538 and corrects 166, most of them by adding the tick on a long vowel that the first reading missed. In 120 the two closer readings differ in a way the page readings do not settle, and the record stays as it is. Entries that stand beside a same-spelled entry were read with the reader told which entry to take, which adds 27 pronunciations that had been held back for that reason.

**Accent weights read from the page.** Where a pronunciation's accents do not line up with the headword's, their weights cannot come from the headword. Two closer readings then give them: the reading that wrote out the pronunciation, and one that is asked only how thick each accent in the parentheses is, beside a reference image. Tried on pronunciations whose weights the record has, the second was right in all 70 where it called itself certain. Where the two agree, the pronunciation is built with those weights: 697 so far.

**Held pronunciations read again.** A held-back pronunciation is written where two closer readings give it letter for letter and mark for mark, the rules above take it against the page readings, and it builds against the headword as it now stands, with its accent weights read from the page where they do not line up with the headword's. 172 already had the readings they needed and had been held only by the pipeline of their day: a headword corrected since, an earlier reading written with accent weights, a mark the markup now takes, or a row that no later fuse took up. 651 more are settled by a further closer reading by Fable, made blind on an enlarged crop of the 1898 printing, that agrees with an earlier closer reading. 264 are settled by a further Opus reading, of the first lines of the entry or of the thickness of the accents alone, that agrees with an earlier one. 549 of these take their accent weights from two readings of the page.

**A blind check of what rests on Opus readings alone.** 438 of the headword pronunciations written on 2026-11-21 on Opus readings alone, from the held rows and from the corrections of the check below, were read again blind by Fable on an enlarged crop of the 1898 printing. 420 match letter for letter and mark for mark. Where Fable differed, an extra Opus reading of a taller crop was made, and 9 rows where it sided with Fable returned to held, a correction giving back the pronunciation it had replaced. A mismatch alone changed nothing. The check did not reach 320 of these rows: in the ledgers, the applied rows without a `fableCheck` field that are either a correction of the check below (a `corrects` field and no `verifiedBy`) or a held row written today with no Fable reading among `settledBy` and `weightsFrom` (pages 651–750: 5; pages 751–850: 35; pages 851–960: 45; pages 961–1060: 38; pages 1061–1160: 48; pages 1161–1260: 23; pages 1261–1360: 36; pages 1361–1460: 27; pages 1461–1560: 31; pages 1561–1681: 32).

## A closer reading of what the page readings wrote

The pronunciations written from the two page readings alone had no closer reading, and the audit above put their error at about one wrong mark in 180. Each is now read again on an enlarged crop of the 1898 printing. 37,908 have been read so far. The closer reading confirms 37,540. Where it differs, a second closer reading is made, and the pronunciation changes only where the two closer readings agree with each other: 337 corrections so far. 31 still differ after two closer readings and stay as they are, and 0 wait for their second reading.

## Limits and remaining work

- 486 printed pronunciations are not yet in the record: 189 that could hide a missed mark or do not line up with the headword, and 297 where the readers differ. Most wait on something other than a reading: the headword's own accents, a form the markup does not yet take, or readings that still differ after two closer readings.
- The pronunciations added from the page readings rest on two readings of one scan until the closer reading described above has reached them.
- The pass covers the pronunciation after a headword. Pronunciations after inflected forms and plurals have a [pass of their own](dictionary-audit-pronunciation-forms.md). 167 headword pronunciations still hold a lost character.
- 0 pronunciations are held back under a headword whose own accents cannot be right. The [headword pass](dictionary-audit-headword.md) corrected most such headwords, and these are the ones whose accent weights two readings did not settle.
- The pronunciations the record already had are the subject of a [separate audit](dictionary-audit-pronunciation-existing.md), which read again those that both page readings question.
- The stress weights come from the record's headword wherever the accents line up with it. 0 pronunciations whose accents do not line up are still held back. Their weights have to be read from the page.
