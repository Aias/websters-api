# Pronunciations after inflected forms

The print gives a pronunciation after many plurals, verb forms and derived words inside an entry, as in "pl. Abaci (-sī)" and "Adulterated (-ā′tĕd)". The record had many of these as an empty placeholder and lacked many more. This pass adds 4,541 of them and replaces 2,150 placeholders. 3,509 of them needed a closer reading of an enlarged crop of the 1898 printing, cut around the line the form stands on and fused with the page readings as in the [headword pronunciation pass](dictionary-audit-pronunciation.md). The [ledger](dictionary-audit-pronunciation-forms.jsonl) has a row for each form that both readers pair with a printed pronunciation, added or not.

## Method

1. **Collect the printed pairs.** In each reader's lines of an entry, a parenthesis that holds a respelling is paired with the word before it. A word broken across two lines is joined first. The first reader has 10,847 such pairs and the second 11,425.
2. **Pair them with the record's forms.** The record marks plurals, verb forms and derived words as elements of their own. Each is paired with the printed form that has the same letters, in order, in both readings.
3. **Require agreement, and set aside what readers miss.** Both readings must give the same marks, and the reading must fall outside the cases where two agreeing readers are known to miss a mark. Those cases go to a closer reading.
4. **Give each accent its weight.** A respelling with no accent needs none. A whole word with a single accent has the heavy one. A derived word that the record sets with its own accents lends its weights. Any other accent has no known weight, and the pronunciation waits.

Before anything was written, the same steps were run on 1,143 forms whose pronunciation the record already had. The result is the record's own in 899. In 232 of the other 244 the record spells out a pronunciation that the print abbreviates, as "ȧ-bĭl′ĭ-tĭz" for the printed "-tĭz" under Ability. A mark differs in four, and the letters or their number in eight.

## A closer reading of what the page readings wrote

The form pronunciations written from the two page readings alone are read again on an enlarged crop of the 1898 printing, cut around the form's own line. 3,163 have been read so far, and 19 wait. The closer reading confirms 3,144. Where it differs, a second closer reading is made, and the pronunciation changes only where the two closer readings agree with each other: 17 corrections so far. 2 still differ after two closer readings and stay as they are, and 0 wait for their second reading.

## Printed forms the record did not mark

Both readers print 175 forms with a pronunciation that the record's entry does not carry as a form element. They are taken by kind, clearest first. 9 plurals that stood in their own plural group as bare text or with the cross-reference class are marked with the class that group uses everywhere else, and given their pronunciations. 24 compound headings are given the pronunciation the print sets after them, by the rules above; where the page readings leave the marks or the weight of an accent open, two closer readings settle them, one of the marks and weights and one of the weights alone.

| Held                                                 | Forms |
| ---------------------------------------------------- | ----: |
| The weight of an accent is hard to judge on the page |     1 |
| The three readings give three marks                  |     1 |
| It could not be built                                |     1 |

| Not yet taken                                                    | Forms |
| ---------------------------------------------------------------- | ----: |
| The record gives it with a pronunciation, in other markup        |    59 |
| Not a form: an etymology or another parenthesis                  |    34 |
| The record has the word in other markup, without a pronunciation |    22 |
| The record has the word only inside other text                   |    14 |
| The record lacks the word                                        |     9 |
| Bare text in its form group, without a pronunciation             |     1 |

## What waits

| Reason                                                                               | Forms |
| ------------------------------------------------------------------------------------ | ----: |
| The closer readings give other letters or marks                                      |    28 |
| The closer reading has other letters or stresses                                     |    24 |
| Two readings give an accent different weights                                        |    21 |
| It could not be built                                                                |    17 |
| A page reader saw a mark that the closer reading did not                             |    14 |
| The three readings give three marks                                                  |    14 |
| The crop did not show the form                                                       |    12 |
| A closer reading gives the marks, but the weight of an accent is not known           |    10 |
| Only one reader has it                                                               |     5 |
| The closer reading found no pronunciation                                            |     4 |
| The second closer reading did not show the form                                      |     3 |
| The two closer readings differ                                                       |     2 |
| Both readers agree, but the reading could hide a mark that readers are known to miss |     1 |
| The readings give different marks                                                    |     1 |
| It holds something other than a respelling                                           |     1 |
| No two of three readings give the accents the same weights                           |     1 |
| The closer reading did not show the form                                             |     1 |

## Limits

- A form is covered only where the record marks it as a form and both readers pair it with a printed pronunciation. A printed form that the record does not mark is not compared.
- Forms whose pronunciation the record already has are not corrected here, though the check above found a few that differ from the print.
- An accent in a part of a word, as in "(-ā′tĕd)", can be heavy or light, and the page readers do not tell. Two closer readings give the weight: one that writes out the pronunciation with its weights, and one that is asked only how thick each accent is, beside a reference image. Tried on headword pronunciations, the second was right in all 70 cases where it called itself certain. 1,313 form pronunciations were built where the two agree. 271 more were built where the two differed: a third closer reading of the form's line, by Fable, agrees with the first on every letter and mark, and two of the three give each accent the same weight. On 40 lone accents in partial forms whose weight the record has, the Fable and the Opus readings of the line were each right in all 40 and the thickness reading in 39. 59 forms whose pronunciation no crop could isolate were built where an Opus and a Fable reading of the form's line and the lines below it agree on every letter, mark and weight. 168 forms that only one page reader paired were added where an Opus and a Fable reading of the form's line agree with each other letter for letter and mark for mark and the settle rules take them against that page reading. Every other form of that class waits: the two readings give an accent different weights, the weight is hard to judge on the page, or, for 0, no crop could be cut because the pronunciation is not on the form's line or the line has no certain place.

## The record's own form pronunciations

The record already had a pronunciation after 8,412 forms. 160 of them are questioned by both page readings in a letter, a stress or a mark that readers do not miss, as in the [audit of existing headword pronunciations](dictionary-audit-pronunciation-existing.md). Each was read again by Opus on an enlarged crop of the form's line in the 1898 printing, and by Fable where the Opus reading differs from the record. 33 are corrected where the two closer readings agree letter for letter and mark for mark, under the same rules as that audit: a mark of a kind readers miss stays where the record has it, a stressed vowel keeps its mark, and a pronunciation the record spells out is not shortened. The record's accent weights are kept where the stresses stand as they did. The [ledger](dictionary-audit-pronunciation-forms-existing.jsonl) has a row for each form read.

| Why the record stays                                                   | Forms |
| ---------------------------------------------------------------------- | ----: |
| The closer reading confirms the record                                 |    88 |
| The record spells out what the print abbreviates                       |    29 |
| The two closer readings differ                                         |     5 |
| The closer reading did not show the form                               |     1 |
| The readings show no mark on a stressed vowel that the record marks    |     1 |
| The weights read on the page leave a whole word without a heavy accent |     1 |
| It holds something other than a respelling                             |     1 |
| The weight of an accent is not known                                   |     1 |
