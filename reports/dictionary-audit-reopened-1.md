# Reopened fields, batch 1

The ruling of 10 November 2026 reopened 36 fields that earlier batches had kept as the electronic text read. This batch reads all of them on two printings. It makes 36 corrections in 31 entries and closes all 36 holds. Thirty-five fields take the printed text, and Hyena needs no change. The batch grants no complete-entry review credit.

## Method

- **Fields:** the 33 `print-word-ruling` rows and the three `print-sentence-ruling` rows of the holds register.
- **Strips:** a phrase from each record is located in the scan's OCR text, and a strip of about ten printed lines is cut around it from the 1895 volume 2 or 1907 volume 1 scan. The same lines are cut from the 1898 printing by registering the two scans. Longer passages take taller strips, up to 30 lines for Horse. Thirty-three strips cover the 36 fields.
- **Readers:** Opus and Fable each transcribe every 1895 or 1907 strip, and Opus transcribes every 1898 strip. All three readings are blind and run at high effort.
- **Acceptance:** a correction is applied when the two readings agree and the 1898 reading agrees with them. All 36 corrections meet that test.

Four strips were cut at the wrong horizontal position because the column rules were misdetected on two pages (Horse, Lay) and one strip clipped the first letter of each line (Hypallage). They were recut and read again. Lay's first strip also covered the wrong passage. The held attribution belongs to the noun's sense 2, "A wager", and a further strip covers it.

## Corrections

| Entry         | Record                                      | Print                                                                              | Kind            |
| ------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- | --------------- |
| Synartesis    | closely jointed                             | closely joined                                                                     | Word            |
| Swoon         | for swoȝnien, fr. swoȝen                    | for swoȝnien, fr. swowen, soghen to sigh or swoon, for swoȝien, fr. swoȝen         | Etymology text  |
| Sweat         | by most powerful sudorifics                 | by the most powerful sudorifics                                                    | Article         |
| Spheroid      | See Oblate, Prolate, and Ellipsoid.         | See Oblate, Prolate, and Ellipsoid of revolution, under Ellipsoid.                 | Cross-reference |
| Epistyle      | now called architrave.                      | now called architrave. Gwilt.                                                      | Attribution     |
| Horse         | species of fossil (Equus)                   | species of fossil horses (Equus)                                                   | Word added      |
| Horse         | in general sense                            | in a general sense                                                                 | Article         |
| Hunger        | Any strong eager desire.                    | Any strong or eager desire.                                                        | Word added      |
| Hunt          | he hunts the woods, or the country          | he hunts the woods, or the county                                                  | Word            |
| Hunt          | A pack of hounds. [Obs.]                    | A pack of hounds. [Obs.] Dryden.                                                   | Attribution     |
| Hyperthetical | superlative . . . expression                | superlative . . . expressions                                                      | Word            |
| Hypo-         | a low state of oxidization                  | a low state of oxidation                                                           | Word            |
| Hypocaust     | first used in bath                          | first used in baths                                                                | Word            |
| Hypogean      | Gr. γῆ earth                                | Gr. γῆ the earth                                                                   | Article         |
| Ibis          | black, without feathers                     | black, and without feathers                                                        | Word added      |
| Ibis          | rarely found in the United States           | rarely found in the Southern United States                                         | Word added      |
| Idiocy        | lack of education                           | want of education                                                                  | Word            |
| Idioticon     | a peculiar dialect                          | a particular dialect                                                               | Word            |
| Idle          | love to ease                                | love of ease                                                                       | Word            |
| Iliad         | a poetical name of Troy                     | a poetical name for Troy                                                           | Word            |
| Isapostolic   | the apostles of their teachings             | the apostles or their teachings                                                    | Word            |
| Lay           | "My fortunes against any lay worth naming." | "My fortunes against any lay worth naming." Shak.                                  | Attribution     |
| Mad           | obs. past participle of Make. Chaucer.      | obs. past participle of Make. Made. Chaucer.                                       | Gloss           |
| Un-           | [OE. un-, on-,                              | [OE. un-, AS. un-, on-,                                                            | Etymology text  |
| Un-           | unbaptized                                  | Unbaptized                                                                         | Capital         |
| Un-           | unbarbered                                  | Unbarbered                                                                         | Capital         |
| Thrum         | manner; to thrum the table                  | manner; as, to thrum the table                                                     | Word added      |
| To            | to lead my life pleasantly.                 | to lead my life pleasantly, i. e., unto the leading my life pleasantly.            | Clause          |
| That          | th'tother                                   | the 'tother                                                                        | Word            |
| Merino        | See Major.                                  | See Mayor.                                                                         | Cross-reference |
| Lancet        | England and 13th century                    | England and the 13th century                                                       | Article         |
| Siren         | vessels in fog                              | vessels in a fog                                                                   | Article         |
| Sepiostare    | shell of cuttlefish                         | shell of a cuttlefish                                                              | Article         |
| Hussy         | prob. fr. hūs house. See House              | prob. fr. hūs house. The word has been confused with the preceding word. See House | Sentence        |
| Hymnology     | as, the hymnology of the eighteenth century | as, the hymnology of Germany; the hymnology of the eighteenth century              | Example         |
| Hypallage     | instead of dare classibus austris           | instead of dare classes austris                                                    | Word            |

The [ledger](dictionary-audit-reopened-1.jsonl) gives each edit's exact fragments, hashes, page and readings.

## Calls made

- **Hypallage** was reopened as a different Latin example. The readings show a one-word difference, "classes" for the record's second "classibus", so the word ruling applies and no review by a person is needed.
- **Un-** prints every word of its list with a capital. The record's two lowercase words came from GCIDE's headwords. Both still link to their entries.
- **Attributions** (Gwilt, Dryden, Shak.) are text the print sets and the record lacks, so they are restored like any other word.
- **Hunt** reads "county" under the verb's sense 5. The noun's sense 5, "A district of country hunted over", already matches the print.
- **Mad** gains its printed gloss, "Made." Its printed pronunciation is not restored, because this batch does not review whole entries.

## No change

Hyena's record differs from the print in two spans that the later-additions register already lists, "doglike nocturnal mammals of Africa and southern Asia," and "Syn. — hyaena.", and in genus names the print abbreviates ("H. brunnea") and the record spells out. Later additions stay, and so does a spelled-out genus.

## Cost

Reading took 0.95 million tokens in 18 headless sessions, about 17 minutes of model time. That is about 26,000 tokens per field for three readings. The integrating session's own usage was not measured.

## Limits

- Each strip covers the lines around one field. The rest of each entry was not compared.
- Pronunciation marks, punctuation and italics were not compared.
- The 1913 printing itself was not read. The only scan found is access-restricted.
