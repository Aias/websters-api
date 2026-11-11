# Page-reading batch 6

Two models read printed pages 351 to 450 without seeing the record, and their agreed reading is compared with the record word by word. This batch makes 590 corrections in 469 entries, adds 10 entries that the electronic text never had, and gives 9 records their printed spelling. It also restores the 1913 Supplement's wording in 9 entries where batches 3 and 4 had replaced it, and corrects 12 inflected forms on pages 1 to 250 that the earlier batches had set aside. It opens 21 holds: 15 questions in the review queue and 6 entries whose homographs stand in another order than the print's. The batch grants no complete-entry review credit.

The method is the one [batch 2](dictionary-audit-page-reading-2.md) describes, with the changes of batches [3](dictionary-audit-page-reading-3.md), [4](dictionary-audit-page-reading-4.md) and [5](dictionary-audit-page-reading-5.md). This report gives what differs.

## Method changes

- **Pages:** leaves n456 to n555 of the 1907 volume 1 scan, Cruelty through Dragonlike, about 242,000 words in 6,670 printed entries.
- **Readers:** Opus and Sonnet. Opus alone found 39 differences the pair had missed, Fable read those strips blind and agreed on 15, and 6 became corrections. A second, taller strip of the 1898 printing settled 26 of 34 differences that the first strip had left unclear.
- **Supplement text:** the 1913 edition prints a Supplement that revises some main-vocabulary definitions, and the record carries the Supplement's wording for those. The main page then differs from the record, and the difference is not an error. The comparison now sets aside every difference that lies in text GCIDE sources to the Supplement ([`dictionary-print-fragments.jsonl`](dictionary-print-fragments.jsonl) carries the source of each differing passage). It set aside 17 here, in Culex, Cutin, Dig, Doffer, Dolerite and Dolman.
- **Special letters:** a printed word that touches a letter outside the plain alphabet is drafted by hand. The rule had dropped the thorn from two Icelandic words.

## Results

The comparison found 1,028 differences, the 15 from the tiebreak reading included.

| Disposition                                                     | Differences |
| --------------------------------------------------------------- | ----------: |
| Corrected (590 edits)                                           |         594 |
| Registered later addition, unchanged                            |         206 |
| Genus spelled out by convention, unchanged                      |          43 |
| GCIDE-only words absent from Gutenberg and the print, unchanged |          26 |
| Inflected forms that are only labels or pronunciations          |           5 |
| Print unreadable in the 1907 scan, unchanged                    |           4 |
| Pronunciations and shared headwords                             |          22 |
| The record follows the 1913 Supplement, unchanged               |          17 |
| The print is wrong, record kept                                 |           2 |
| The 1898 printing reads as the record                           |          11 |
| Not a difference in the text, or not settled                    |          73 |
| Held                                                            |          25 |

The [ledger](dictionary-audit-page-reading-6.jsonl) gives every difference with its disposition, and every edit with its exact fragments and readings.

## Corrections

- **549 follow the ruling of 10 November 2026.** The record's reading came from the typists. Examples: Cucumber "pickled" for "picked", Cyrtostyle "portico" for "portion", Descendible "descendible" for "descendant", Diurnal "(Astron.)" for "(Anat.)", Downhill's authority "Congreve" for "Congrewe", Dimensive "Having" for "Without", and Dodecatemory "twelfth" for "twelve". Dally and Doit regain the thorn of "þylja" and "þveit", which the record had as "p". Discommode regains "molest", Disembarrass regains "impediment", and Double regains "to make twice as great; to duplicate; to repeat".
- **41 undo a later GCIDE change.** Examples: Crusade "Mohammedans" for "Muslims", Denominator "vulgar" for "common", Diastase "ferment" for "enzyme", Dibutyl "marsh-gas" for "alkane", Distrust "want" for "lack", and Dinghy "a kind of boat". Deprecate, Deprecation, Diamagnetism and Downstairs regain their printed definitions.
- **Whole lines return:** Dame regains the quotation from Isaiah, Dangerous the one from Southern, and Demand the one from Tennyson. Dock regains the phrase "Screw dock".
- **Daphnia, Disconsolate, Discoursive, Distressing and Dogtrick** each carried part of a neighbouring printed entry. Those entries are now the records Daphnid, Disconsolance, Discoursiveness, Distressingly and Dogtrot, and the five read as printed.
- **Inflected forms:** eight are corrected, such as Dijudicate "Dijudicating" for "Dijucating" and Dismortgage "Dismortgaged" for "Dismortaged".

Usage marks gain what the print sets in 3 entries, and 7 definitions regain the authority printed after them.

## New and renamed records

Ten printed entries had no record. Each is transcribed from two blind readings that agree and a reading of the 1898 printing, in the markup of its neighbours.

| Record           | Printed entry                                                                 |
| ---------------- | ----------------------------------------------------------------------------- |
| Cycler           | n. One who rides a bicycle, tricycle, or other form of cycle.                 |
| Daguerreotypical | Daguerreotypic, -ical, a. Of or pertaining to the daguerreotype.              |
| Daphnid          | a. (Zoöl.) Like, or pertaining to, the genus Daphnia.                         |
| Disconsolance    | n. Disconsolateness. [Obs.] Barrow.                                           |
| Discoursiveness  | n. The state or quality of being discoursive or able to reason. [R.] Feltham. |
| Distressingly    | adv. In a distressing manner.                                                 |
| Divulgement      | n. The act of divulging; revelation. [R.]                                     |
| Divulger         | n. One who divulges.                                                          |
| Divulsion        | n. The act of pulling or plucking away; a rending asunder.                    |
| Dogtrot          | n. A gentle trot, like that of a dog.                                         |

Nine records carried a misspelled headword and take their printed name.

| Old name         | Printed name    |
| ---------------- | --------------- |
| Curtes           | Curteis         |
| Dephlogisticcate | Dephlogisticate |
| Diaglyphtic      | Diaglyptic      |
| Dictionalrian    | Dictionarian    |
| Disembossom      | Disembosom      |
| Disquiettude     | Disquietude     |
| Distasteive      | Distastive      |
| Divisionor       | Divisioner      |
| Domicillary      | Domiciliary     |

No other record referred to the old names, and the later-additions register listed none of them.

## Supplement wording restored

Fourteen corrections that batches 3 and 4 made in nine entries had replaced the 1913 Supplement's wording with the main vocabulary page's. The Supplement's wording is back in Angioma, Anti-trade, Autodynamic, Bandeau, Banshie, Barracouta, Boswellian, Caber and Cacochymy. Anti-trade, for example, again reads "A westerly wind which blows nearly continuously between 30° and 50° of latitude in both the northern and the southern hemisphere." No correction of batches 2 or 5 lay in Supplement text. The ledger lists each restoration.

The main page's older wording of these entries is 1913 text as well, and the record now lacks it. Whether such entries should carry both wordings is a question for the person.

## Inflected forms on pages 1 to 250

Batches 2 to 4 set 33 differences inside inflected-form brackets aside. Read on the 1898 printing and drafted by hand, 12 are corrections: Aguish gains "Aguishly", Allicient "That which attracts", Benefit "Benefiting", Brachium "Brachia", Cadaverous the authority "Young.", Caecum the label "E.", Catalysis "Catalyses" and "NL.", Catena "Catenæ", Chapeau "Chapeaux", Char-a-bancs "Chars-a-bancs", Chateau "Chateaux" and Cherish "Cherishing". Their [ledger](dictionary-audit-page-reading-forms-1.jsonl) lists all 33.

## Kept and held

- **The print is wrong:** Diminutival misspells "diminutive", and Discipline doubles "control;".
- **The 1898 printing reads as the record (11):** worn or broken type in the 1907 impression.
- **Held for the person (15 questions):** Cruiser, whose naval sentence may be Supplement text. Deflour and Deflower, which the record has swapped, so that Deflower carries the main entry. Twelve passages that GCIDE rewrote, where restoring the printed wording removes text the later-additions register lists or would blend two wordings (Cryptography, Ctenophora, Dammara, Degree, Deltoid, Demography, Digitalin, Disinfectant, Divide, Doll, Double and Douroucouli). Each is in the review queue with crops of both printings.
- **Held for a later pass (6):** Despond, Disregard, Dissipate, Distress, Do and Document hold their homographs in another order than the print's.

## Cost

| Step                                     | Tokens       | Model time |
| ---------------------------------------- | ------------ | ---------- |
| Blind readings of 300 columns, two each  | 29.0 million | 5.9 hours  |
| Third readings of 729 strips             | 3.1 million  | 41 minutes |
| Second-chance readings of 34 strips      | 0.3 million  | 4 minutes  |
| Tiebreak readings of 39 strips (Fable)   | 0.2 million  | 4 minutes  |
| Reading of 21 unmatched printed entries  | 0.1 million  | 2 minutes  |
| Drafting, proofreading and review agents | 2.0 million  | 1.2 hours  |

That is about 350,000 tokens a page and 5,200 an entry. The forms catch-up cost a further 0.1 million tokens. The integrating session's own usage was not measured.

## Limits

- Pronunciation marks, punctuation, capitals and italics are not compared.
- The Supplement check depends on GCIDE's source tags, which are not always right. Cruiser's naval sentence is tagged as main-vocabulary text and reads like the Supplement's.
- An entry that runs over from page 350 or onto page 451 is compared only as far as this batch's pages.
- The 1913 printing itself was not read. The only scan found is access-restricted.
