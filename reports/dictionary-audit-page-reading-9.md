# Page-reading batch 9

Two models read printed pages 651 to 750 without seeing the record, and their agreed reading is compared with the record word by word. This batch makes 868 corrections in 656 entries, adds 14 entries that the electronic text never had, and gives 11 records their printed spelling. It opens 32 holds and closes one: 29 questions in the review queue and 3 entries whose homographs stand in another order than the print's. The batch grants no complete-entry review credit.

The method is the one [batch 2](dictionary-audit-page-reading-2.md) describes, with the changes of batches [3](dictionary-audit-page-reading-3.md) to [7](dictionary-audit-page-reading-7.md). Nothing in the method changed for this batch.

## Pages and readers

- **Pages:** leaves n756 to n855 of the 1907 volume 1 scan, Grig through Independent, about 241,000 words in 7,003 printed entries.
- **Readers:** Opus and Sonnet. Opus alone found 67 differences the pair had missed, Fable read those strips blind and agreed on 34, and 3 became corrections. A second, taller strip of the 1898 printing settled 38 of 59 differences that the first strip had left unclear.
- **Proofreading:** four reviewers read all 664 rule-drafted corrections and reported 55. Twenty-nine of the reports are single words where the 1913 typists' text agrees with the record and both readings make sense. Under the ruling of 10 November 2026 those follow the print, and the ledger lists them.

## Results

The comparison found 1,584 differences, the 34 from the tiebreak reading included.

| Disposition                                                     | Differences |
| --------------------------------------------------------------- | ----------: |
| Corrected (868 edits)                                           |         879 |
| Registered later addition, unchanged                            |         338 |
| Genus spelled out by convention, unchanged                      |         107 |
| GCIDE-only words absent from Gutenberg and the print, unchanged |          26 |
| Inflected forms that are only labels or pronunciations          |           7 |
| Print unreadable in the 1907 scan, unchanged                    |           4 |
| Pronunciations and shared headwords                             |          28 |
| The record follows the 1913 Supplement, unchanged               |           8 |
| The print is wrong, or the 1913 printing revised the passage    |           8 |
| Other differences that keep the record                          |           4 |
| The 1898 printing reads as the record                           |          14 |
| Not a difference in the text, or not settled                    |         114 |
| Held                                                            |          47 |

The [ledger](dictionary-audit-page-reading-9.jsonl) gives every difference with its disposition, and every edit with its exact fragments and readings.

## Corrections

- **707 follow the ruling of 10 November 2026.** The record's reading came from the typists. Examples: Humorsomely "Petulantly" for "Pleasantly", Hurtle "'neath" for "'death", Hydriodate "(Chem.)" for "(Zoöl.)", Ignivomous "to vomit" for "8vomit", Indefeasible "an indefeasible estate or title", and the authorities "Tillotson", "Sir H. Wotton" and "H. Spencer". Imply regains "expressed in words; to contain by implication", Import "purport; meaning; signification", Haematoplastic "blood corpuscles before the formation of", and Hypocrite the line from Dryden. Hackney's two Old French forms change places, as printed.
- **161 undo a later GCIDE change.** Most restore "Want of" where GCIDE wrote "Lack of", in entries from Illiterature to Incultivation. Others: Hadji "A Mohammedan pilgrim to Mecca", Haytian "Hayti", Heuristic "Serving to discover or find out", Hen-peck's printed definition, Hydrophobia "The disease caused by a bite", and Impalla "The pallah deer of South Africa."
- **Guy, Ice and Hawse** regain a printed homograph or phrase the record lacked: the verb Guy, "Ice table" and "Hawse hole". Idiom's sense 2 is whole again, with its quotations in printed order.
- **Inflected forms:** 20 are corrected, among them Hobnob "Hobnobbed, Hobnobbing", Imbrue "Imbrued, Imbruing", Grumble "Grumbled" and Guilty "Guiltier".
- **Imperially** carried the printed entry Imperialty under its own headword. Imperialty is now its own record.

## New and renamed records

Fourteen printed entries had no record: Groundsill, Grunsel, Heavy-hearted, Hectically, Hemadynamic, Hematoglobulin, Hemiencephalon, Hewed, Hexaplar, Hoi, Imperfectly, Imperialty, Impoverishly and Indefeasibly. Each is transcribed from two blind readings that agree and a reading of the 1898 printing, in the markup of its neighbours. The ledger gives each record's text.

Eleven records carried a misspelled headword and take their printed name.

| Old name       | Printed name    | Old name        | Printed name    |
| -------------- | --------------- | --------------- | --------------- |
| Heavy-haded    | Heavy-handed    | Hutchunsonian   | Hutchinsonian   |
| Heyten         | Heythen         | Hydrencephsloid | Hydrencephaloid |
| Homoeomery     | Homoeometry     | Hydroxanthane   | Hydroxanthate   |
| Horaly         | Horally         | Incesttuous     | Incestuous      |
| Horror-sticken | Horror-stricken | Inclinnometer   | Inclinometer    |
| Huron-Iroquous | Huron-Iroquois  |                 |                 |

The rename of Heyten closes the hold `a28-Heyten-0`, which had waited for evidence of the printed heading. One later-addition pointer moved with restored text, in Ice.

## Kept and held

- **The print is wrong:** Gum "Eucalpytus" and Hobble's authority "Jeffreys".
- **Probable 1913 revisions:** Gulf Stream's definition, Grow's phrase list, Heliogravure, Hydrogenium, and two phrases under Hypocycloid and Iatrochemistry stand as the 1913 typists' text has them.
- **Held for the person (29 questions):** Hematophilia and Hemophilia, whose entries the record has exchanged. Twenty-seven passages that GCIDE rewrote, where restoring the printed wording removes text the later-additions register lists or would blend two wordings (Groschen, Grounding, Guenon, Gun, Gunner, Gymnastical, Gymnastics, Hagiographa, Haitian, Halfbeak, Hall-mark, Hallucinatory, Heading, Headlight, Hello, Homoiothermic, Honor, Horsechestnut, Horsehair, Hydrolytic, Hypermetropy, Iced, Idiot, Ill-natured, Incandescent, Incoherent and Inconsistent). Each is in the review queue with crops of both printings.
- **Held for a later pass (3):** Groan, Hackle and Handicap hold their homographs in another order than the print's.

## Cost

| Step                                     | Tokens       | Model time |
| ---------------------------------------- | ------------ | ---------- |
| Blind readings of 300 columns, two each  | 28.9 million | 5.7 hours  |
| Third readings of 1,085 strips           | 4.7 million  | 61 minutes |
| Second-chance readings of 59 strips      | 0.5 million  | 8 minutes  |
| Tiebreak readings of 67 strips (Fable)   | 0.3 million  | 7 minutes  |
| Reading of 33 unmatched printed entries  | 0.2 million  | 3 minutes  |
| Drafting, proofreading and review agents | 3.2 million  | 2.1 hours  |

That is about 380,000 tokens a page and 5,400 an entry. The integrating session's own usage was not measured.

## Limits

- Pronunciation marks, punctuation, capitals and italics are not compared.
- A single word that the 1913 printing changed cannot be told from a typist's slip without the 1913 page. The ruling of 10 November 2026 treats it as a slip.
- An entry that runs over from page 650 or onto page 751 is compared only as far as this batch's pages.
- The 1913 printing itself was not read. The only scan found is access-restricted.
