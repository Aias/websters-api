# Pronunciations after inflected forms

The print gives a pronunciation after many plurals, verb forms and derived words inside an entry, as in "pl. Abaci (-sī)" and "Adulterated (-ā′tĕd)". The record had many of these as an empty placeholder and lacked many more. This pass adds 1,481 of them and replaces 1,233 placeholders. The [ledger](dictionary-audit-pronunciation-forms.jsonl) has a row for each form that both readers pair with a printed pronunciation, added or not.

## Method

1. **Collect the printed pairs.** In each reader's lines of an entry, a parenthesis that holds a respelling is paired with the word before it. A word broken across two lines is joined first. The first reader has 10,847 such pairs and the second 11,425.
2. **Pair them with the record's forms.** The record marks plurals, verb forms and derived words as elements of their own. Each is paired with the printed form that has the same letters, in order, in both readings.
3. **Require agreement, and set aside what readers miss.** Both readings must give the same marks, and the reading must fall outside the cases where two agreeing readers are known to miss a mark. Those cases go to a closer reading.
4. **Give each accent its weight.** A respelling with no accent needs none. A whole word with a single accent has the heavy one. A derived word that the record sets with its own accents lends its weights. Any other accent has no known weight, and the pronunciation waits.

Before anything was written, the same steps were run on 1,143 forms whose pronunciation the record already had. The result is the record's own in 899. In 232 of the other 244 the record spells out a pronunciation that the print abbreviates, as "ȧ-bĭl′ĭ-tĭz" for the printed "-tĭz" under Ability. A mark differs in four, and the letters or their number in eight.

## What waits

| Reason                                                                               | Forms |
| ------------------------------------------------------------------------------------ | ----: |
| The weight of its accent is not known                                                | 1,561 |
| Both readers agree, but the reading could hide a mark that readers are known to miss | 1,375 |
| The two readers give different marks                                                 |   346 |
| Only one reader has it                                                               |   174 |
| It could not be built                                                                |    17 |

## Limits

- A form is covered only where the record marks it as a form and both readers pair it with a printed pronunciation. A printed form that the record does not mark is not compared.
- Forms whose pronunciation the record already has are not corrected here, though the check above found a few that differ from the print.
- An accent in a part of a word, as in "(-ā′tĕd)", can be heavy or light, and the page readers do not tell. Those pronunciations wait for a reading of the accent's weight. A test of such a reading on headword pronunciations gave the weights right in all 70 cases where the reader called itself certain.
