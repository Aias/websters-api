# Headword pass

The print sets each headword in bold, with a hyphen between its syllables and an accent after each stressed one. A heavy accent marks the main stress and a light accent a lesser one. This pass compares the record's headwords with the print in their letters, syllable breaks, hyphens, spaces and accents, and corrects 1,584 of them. The [ledger](dictionary-audit-headword.jsonl) has a row for each headword that was questioned, with the three readings and the reason it changed or stayed. In the examples below ″ stands for a heavy accent and ′ for a light one.

## Finding the headwords to question

Both blind page readings give each headword as the page shows it. 105,088 record entries are paired with a printed entry by both readers, as in the [pronunciation pass](dictionary-audit-pronunciation.md). The page readers do not tell a heavy accent from a light one, so the comparison counts either accent as one sign. 1,734 headwords were questioned: those where both readers give another form than the record, those where each reader gives a form of its own, and those whose accents cannot be right as the record has them.

| What the readings question                                                | Headwords | Changed |
| ------------------------------------------------------------------------- | --------: | ------: |
| The record's accents cannot be right: no heavy accent, or two in one word |       758 |     664 |
| The print has more accents                                                |       350 |     339 |
| Syllable breaks and accents both differ                                   |       181 |     177 |
| Syllable breaks, hyphens or spaces                                        |       154 |     143 |
| An accent stands on another syllable                                      |       121 |     117 |
| A capital letter                                                          |        63 |      62 |
| Letters, ligatures or marks over letters                                  |        59 |      50 |
| The print has fewer accents                                               |        35 |      32 |
| The readers differ from each other and from the record                    |        13 |       0 |

## Reading each one on the 1898 printing

For each questioned headword the entry's first lines were cut from the 1898 printing, enlarged three times, and read blind by Opus, which wrote out the headword and the pronunciation. On 170 headwords that were not in question, that reading gave the letters, the syllable breaks and the place of every accent exactly in all 170. Where two same-spelled entries stand together, the crop was cut taller and the reader was told which entry to take.

A headword changes only when both page readings and the reading of the 1898 printing give the same form. Where the 1898 reading has the headword as the record does, the record stays.

## The weight of each accent

| Where the weights come from                     | Headwords |
| ----------------------------------------------- | --------: |
| Two closer readings give each accent its weight |       858 |
| The weights of the accents are the record's own |       393 |
| A word with one accent has the heavy one        |       324 |
| A word of one syllable has no accent            |         9 |

The record's own weights are kept wherever the number of accents is unchanged and the weights can be right. A word with a single accent has the heavy one. Every other weight needs two readings that agree: the reading of the entry's first lines, and a second reading that is asked only how thick each accent is, on a crop of the headword's line enlarged six times, beside a reference image whose weights are stated.

Both readings were tried first on headwords whose weights the record has. The first-lines reading gave both weights right in 127 of 130 words with a heavy and a light accent. The thickness reading gave them right in 107 of 110, and in all 101 where it called itself certain. Fourteen of the decisions that rest on the two readings were then checked by eye on the page, and all fourteen were right.

Two other ways to weigh an accent were tried and dropped. Measuring the ink of each accent on the page agreed with the record in 326 of 340 words it could measure, but it could not separate an accent from a letter it touches, and it measured fewer than half the words. The characters that the page recognizer writes for accents carry no signal.

## What changed

- **Accents the record lacked or had wrong.** "Ad″der fly" to "Ad″der fly′", "Aft″er-glow" to "Aft″er-glow′", "Ale″stake" to "Ale″stake′"; "Ac-cli″ma-ti-za″tion" to "Ac-cli′ma-ti-za″tion", "A-chro″ma-top″sy" to "A-chro″ma-top′sy", "Ac″i-na″ceous" to "Ac′i-na″ceous".
- **Syllable breaks, hyphens and spaces.** "Aard″vark′" to "Aard″-vark′", "Ac-com″mo-dable-ness" to "Ac-com″mo-da-ble-ness", "All′fours″" to "All′ fours″", "An″ti" to "An″ti-".
- **Accents on another syllable.** "Air″ engine′" to "Air″ en′gine", "Al′i-men″tal-ly" to "A′li-men″tal-ly", "Am′y-lo-ly″tic" to "Am′y-lo-lyt″ic", "A-noa″" to "A-no″a"; "Ab-de″rite" to "Ab″de-rite", "Ac-com-bi-na″tion" to "Ac-com′bi-na″tion", "Ac″e-tal" to "A-ce″tal".
- **Capitals, ligatures and marks over letters.** "æg″i-lops" to "Æg″i-lops", "æ-ol″ic" to "Æ-ol″ic", "æ′ti-ol″o-gy" to "Æ′ti-ol″o-gy"; "ae″gis" to "Æ″gis", "an′aes-the″sis" to "An′æs-the″sis", "Beau′se′ant″" to "Beau′sé′ant″", "cae-su″ra" to "Cæ-su″ra".
- **Accents the print does not have.** "Black″guard′" to "Black″guard", "Bow″sprit′" to "Bow″sprit", "Cel″lu-loid′" to "Cel″lu-loid", "Chank″" to "Chank".

51 of the changes touch the spelling itself: a hyphen, a space or a letter, as "Aard″-vark′" under the key Aardvark and "All′ fours″" under Allfours. The keys are unchanged. Whether a key should follow its headword is a question in the review queue.

## The comma after the headword

The print sets a comma after the headword, or after its pronunciation, before the part of speech. 232 entries lacked it or had it damaged, and both blind readings of the page show a plain comma. The [comma ledger](dictionary-audit-headword-comma.jsonl) lists them.

| What the record had             | Entries |
| ------------------------------- | ------: |
| No mark                         |     201 |
| A space before the comma        |      21 |
| Two commas                      |       8 |
| A space where the comma belongs |       2 |

## What stayed

| Reason                                                                       | Headwords |
| ---------------------------------------------------------------------------- | --------: |
| The weight of an accent is hard to judge on the page                         |        51 |
| The readings give accents that cannot be right                               |        47 |
| The closer reading of the 1898 printing has the headword as the record does  |        14 |
| The closer reading has a third form                                          |        12 |
| One page reading and the closer reading agree against the other page reading |         9 |
| Two readings give an accent different weights                                |         7 |
| The print shows no accent on a word of several syllables                     |         5 |
| The entry has several headwords or has changed since it was read             |         4 |
| The accents and their weights do not line up                                 |         1 |

## Limits

- The pass covers entries that both readers pair with a printed entry. A headword that neither reader questions was not read again, so a slip that both page readers make in the same way would stand.
- The page readers do not tell a heavy accent from a light one. A headword whose accents are in the right places with the wrong weights is found only when the weights cannot be right together. A word with one heavy and one light accent exchanged would not be found.
- Where the two weight readings differ, or the thickness reading was not certain and differs, the headword stays as it is.
- Run-on headwords inside an entry, such as derived words after a dash, are not covered.
