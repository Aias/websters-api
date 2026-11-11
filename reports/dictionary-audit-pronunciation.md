# Headword pronunciation pass

The print gives a pronunciation in parentheses after most headwords. The record had one for about 23,000 of its 120,705 headwords. This pass adds 35,638 printed pronunciations and replaces 1,469 damaged ones, all taken from the two blind readings that the [page-reading batches](dictionary-audit-page-reading-2.md) already made. No page was read again. 60,245 headwords now carry a whole pronunciation.

A pronunciation is added only where both readers give the same marks and the reading falls outside the cases where readers are known to miss a mark. 28,896 printed pronunciations stay out for now. Each has a row in its ledger that says why.

| Pages     | Record lacked |  Added | Replaced | Could hide a missed mark | Readers differ | Other held | Ledger                                           |
| --------- | ------------: | -----: | -------: | -----------------------: | -------------: | ---------: | ------------------------------------------------ |
| 1–50      |           915 |    598 |        3 |                       93 |            207 |         14 | [jsonl](dictionary-audit-pronunciation-2.jsonl)  |
| 51–150    |           323 |    158 |        0 |                       69 |             84 |         12 | [jsonl](dictionary-audit-pronunciation-3.jsonl)  |
| 151–250   |         2,400 |  1,315 |        6 |                      495 |            527 |         57 | [jsonl](dictionary-audit-pronunciation-4.jsonl)  |
| 251–350   |         3,807 |  1,653 |      566 |                      500 |            996 |         92 | [jsonl](dictionary-audit-pronunciation-5.jsonl)  |
| 351–450   |         4,561 |  2,106 |      243 |                      939 |          1,203 |         70 | [jsonl](dictionary-audit-pronunciation-6.jsonl)  |
| 451–550   |         4,806 |  2,570 |       25 |                      920 |          1,174 |        117 | [jsonl](dictionary-audit-pronunciation-7.jsonl)  |
| 551–650   |         4,097 |  2,380 |       29 |                      778 |            782 |        128 | [jsonl](dictionary-audit-pronunciation-8.jsonl)  |
| 651–750   |         4,095 |  2,286 |        8 |                      754 |            970 |         77 | [jsonl](dictionary-audit-pronunciation-9.jsonl)  |
| 751–850   |         4,209 |  2,434 |       14 |                      719 |            956 |         86 | [jsonl](dictionary-audit-pronunciation-10.jsonl) |
| 851–960   |         4,903 |  2,614 |       10 |                      955 |          1,241 |         83 | [jsonl](dictionary-audit-pronunciation-11.jsonl) |
| 961–1060  |         5,007 |  2,765 |        5 |                      945 |          1,125 |        167 | [jsonl](dictionary-audit-pronunciation-12.jsonl) |
| 1061–1160 |         5,262 |  2,660 |       18 |                    1,082 |          1,450 |         52 | [jsonl](dictionary-audit-pronunciation-13.jsonl) |
| 1161–1260 |         3,523 |  1,179 |      492 |                      944 |            868 |         40 | [jsonl](dictionary-audit-pronunciation-14.jsonl) |
| 1261–1360 |         4,140 |  2,583 |       20 |                      738 |            739 |         60 | [jsonl](dictionary-audit-pronunciation-15.jsonl) |
| 1361–1460 |         3,758 |  2,269 |       10 |                      759 |            678 |         42 | [jsonl](dictionary-audit-pronunciation-16.jsonl) |
| 1461–1560 |         4,389 |  2,407 |        2 |                    1,035 |            914 |         31 | [jsonl](dictionary-audit-pronunciation-17.jsonl) |
| 1561–1681 |         5,808 |  3,661 |       18 |                      998 |          1,052 |         79 | [jsonl](dictionary-audit-pronunciation-18.jsonl) |
| Total     |        66,003 | 35,638 |    1,469 |                   12,723 |         14,966 |      1,207 |                                                  |

"Record lacked" counts entries that both readers pair with a printed entry, where the print has a pronunciation and the record has none or a damaged one.

## Method

1. **Pair entries.** Each record entry is paired with the printed entry of each reader by its opening words, as in the [homograph order pass](dictionary-audit-homograph-order.md). 105,296 of the record's 111,589 entries are paired by both readers. The print has a pronunciation for 86,760 of them.
2. **Bring both readings to one notation.** The readers write the same printed mark in several ways. A macron with a tick, a dot or an acute above it is one mark, the vowel of "senate" or "event". A y with any mark is the y of "pity", because the notation has no other marked y. The long and short oo are each written one way, and every stress mark and apostrophe is compared as one sign.
3. **Require agreement.** The two readings must then be equal, letter for letter and mark for mark.
4. **Set aside what readers miss.** The record's own pronunciations show where two agreeing readers can both be wrong. Those cases are listed below and stay out.
5. **Write the record's markup.** Each mark becomes a combining hex reference after its letter. An unmarked vowel outside "oi", "ou" and "oo" is set in italic, as the print sets its obscure vowels and as the record's existing pronunciations do. The printed form is kept as it is, so a pronunciation that gives only the last syllables stays partial.
6. **Take the stress weights from the headword.** The readers do not tell a heavy stress mark from a light one. The record's headword has both, so each stress in the respelling takes the weight of the same syllable of the headword. A pronunciation whose syllables or stresses do not line up with the headword stays out, and so does one under a headword whose own marks are unsound, such as two heavy marks in one word.

## What the record's own pronunciations show

12,737 entries already had a whole pronunciation and fall in the class that is added. The same steps were run on them as a check.

| Result                                                              | Entries |
| ------------------------------------------------------------------- | ------: |
| The markup built from the readings is the record's own              |  11,011 |
| Same marks, with the record writing italics or a weight differently |     116 |
| The record spells out what the print abbreviates                    |   1,189 |
| A mark differs                                                      |     208 |
| A letter differs                                                    |      96 |
| A stress or a section number differs                                |      72 |
| The lengths differ in another way                                   |      45 |

A mark differs in 1.6% of these entries. Many of the differences are the record's own slips: "clăm" for "klăm" under Clam, "ĭn-kûv′" under Incurve, "pĕr-ĕn′nĭ-yy̆" under Perennity. The 1,189 spelled-out forms are full respellings where the print has only the last syllables, as "ăk-kloi′" under Accloy for the printed "-kloi′".

The 1,238 damaged pronunciations that the pass replaces had lost their vowels but kept their consonants, hyphens and stress marks. The new reading fits that surviving frame in 1,183 of them. The other 55 are mostly slips inside the damaged text. Another 231 of the replaced pronunciations were bare placeholders.

## Where two readers agree and are both wrong

| Case                                                        | Held back |
| ----------------------------------------------------------- | --------: |
| A plain long vowel in a syllable without stress             |    10,082 |
| A plain long vowel in a word the print marks as foreign     |     1,684 |
| "th", which may be the barred th of "then"                  |     1,296 |
| A vowel with dots below, where one dot and two are confused |       761 |
| An n before k or g, which may carry the line under it       |       172 |

A pronunciation can fall under more than one case. 12,723 are held back in all.

The first case is the largest. The print sets a small tick on the macron of the vowels of "senate", "event", "idea", "obey" and "unite". Of 4,077 such vowels in the record's pronunciations, both readers saw the tick on 15%, one reader on 44%, and neither on 40%. A tick that either reader saw is almost always real: readers put one on under 1% of the record's plain long vowels. A plain long vowel in an unstressed syllable therefore proves nothing, and those pronunciations wait for a closer reading.

## Audit against the 1898 printing

200 added pronunciations were drawn at random, 100 from each volume. For each, the entry's first lines were cut from the 1898 printing and enlarged three times, and Opus transcribed the pronunciation without seeing the draft.

| Result                                   | Count |
| ---------------------------------------- | ----: |
| The crop shows the entry and it was read |   185 |
| The reading equals the draft             |   181 |
| The crop shows another entry (Downiness) |     1 |
| The draft is wrong                       |     3 |

The three errors were checked by eye on the crops. Déblai has ticked vowels under its stress marks, as French words do. Diesinker has the n with a line under it. Both cases were then added to the list above and are held back throughout. Didine reads "dī′dīn" in print where both readers have "dī′dĭn". That one has no pattern, and it stands in the record as the readers gave it. On this sample about one added pronunciation in 180 has a wrong mark of that kind, and the sample is small enough that the true rate could be as high as 3%.

## Limits and remaining work

- 28,896 printed pronunciations are not yet in the record: 13,930 that could hide a missed mark or do not line up with the headword, and 14,966 where the readers differ. An enlarged crop makes the tick and the line under n legible, as the audit crops show. Reading each of these once more from an enlarged crop would settle most of them. The audit readings cost about 4,000 tokens for each pronunciation.
- The added pronunciations rest on two readings of one scan. A third reading of each from an enlarged crop would find the remaining wrong marks.
- The pass covers the pronunciation after a headword. Pronunciations after inflected forms and plurals, and the 2,389 headword pronunciations that still hold a lost character, are not covered.
- 403 headwords have stress marks that cannot be right, such as Eventration with no heavy mark. Their pronunciations are held back, and the headwords need a pass of their own.
- Where the record already has a pronunciation that differs from both readers, nothing changes. Those 421 differences in the checked class are candidates for a correction once a third reading confirms them.
- The stress weights come from the record's headword, which earlier work took from the electronic text. Where the headword lacks a light mark that the print has, the stresses do not line up and the pronunciation is held back: 543 entries.
