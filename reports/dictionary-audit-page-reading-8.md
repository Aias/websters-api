# Page-reading batch 8

Two models read printed pages 551 to 650 without seeing the record, and their agreed reading is compared with the record word by word. This batch makes 777 corrections in 589 entries, adds 2 entries that the electronic text never had, and gives 17 records their printed spelling. It opens 31 holds: 26 questions in the review queue and 5 entries whose homographs stand in another order than the print's. The batch grants no complete-entry review credit.

The method is the one [batch 2](dictionary-audit-page-reading-2.md) describes, with the changes of batches [3](dictionary-audit-page-reading-3.md) to [7](dictionary-audit-page-reading-7.md). Nothing in the method changed for this batch.

## Pages and readers

- **Pages:** leaves n656 to n755 of the 1907 volume 1 scan, Fellowship through Griffon, about 252,000 words in 6,366 printed entries.
- **Readers:** Opus and Sonnet. Opus alone found 30 differences the pair had missed, Fable read those strips blind and agreed on 7, and 4 became corrections. A second, taller strip of the 1898 printing settled 29 of 50 differences that the first strip had left unclear.
- **Proofreading:** four reviewers read all 595 rule-drafted corrections and reported 49. Twenty-six would have blended a rewritten sentence, three carried over a misprint, three lay in Supplement text, and the rest were misaligned or damaged punctuation.

## Results

The comparison found 1,460 differences, the 7 from the tiebreak reading included.

| Disposition                                                     | Differences |
| --------------------------------------------------------------- | ----------: |
| Corrected (777 edits)                                           |         781 |
| Registered later addition, unchanged                            |         368 |
| GCIDE-only words absent from Gutenberg and the print, unchanged |          53 |
| Genus spelled out by convention, unchanged                      |          24 |
| Inflected forms that are only labels or pronunciations          |           7 |
| Print unreadable in the 1907 scan, unchanged                    |           5 |
| Pronunciations and shared headwords                             |          21 |
| The record follows the 1913 Supplement, unchanged               |          20 |
| The print is wrong, record kept                                 |           3 |
| Wording that goes with a registered later addition, unchanged   |          10 |
| The 1898 printing reads as the record                           |          11 |
| Not a difference in the text, or not settled                    |         112 |
| Held                                                            |          45 |

The [ledger](dictionary-audit-page-reading-8.jsonl) gives every difference with its disposition, and every edit with its exact fragments and readings.

## Corrections

- **714 follow the ruling of 10 November 2026.** The record's reading came from the typists. Examples: Fritter and Frit "Fry" for "Far", Furlough "Lief" for "Life", Fungiform "Fungus" for "Eungus", Footrope "(Naut.)" for "(Aut.)", Foreground "In a painting" for "On a painting", Gargarize "L." for "F.", Gelt "Geld", Gives "Gyve", and the authorities "Gaskell", "Grew", "I. Taylor" and "Thomson". Fool regains "to trifle; to toy; to spend time in idle sport or mirth", Forgo "to let slip; to give up; to cease; to omit", Gentile its whole note on the Hebrew and Latin words, Gauge the phrase "Sliding gauge", Foot the phrase "Foot lathe", and Fricassee, Friday, Galena and Gambit parts of their etymologies. Forcible and For regain quotations from Milton and Whittier.
- **63 undo a later GCIDE change.** Examples: Fermentation "aldehyde" for "acetaldehyde" and "ferment" for "enzyme", File "men" for "people", Firecracker "See Cracker, n., 3.", Fire water "ardent spirits", Gonoph "[Perh. fr. Heb. ...]", Green-eyed "seeing everything through a medium which discolors or distorts", and Gold and Germanium the atomic weights of the print.
- **Inflected forms:** 14 are corrected, among them Fidget "Fidgeting", Fire "Firing", Gargle "Gargled", Gaudy "Gaudiest", Grasp "Grasped, Grasping" and Gratulate "Gratulated".
- **Feoffer and Furmity** have their first headwords corrected to "Feoffor" and "Furmenty".

## New and renamed records

Two printed entries had no record: Furor ("Fury; rage.") and Glareous ("Glairy. John Gregory (1766)."). Each is transcribed from two blind readings that agree and a reading of the 1898 printing.

Seventeen records carried a misspelled headword and take their printed name.

| Old name     | Printed name  | Old name    | Printed name |
| ------------ | ------------- | ----------- | ------------ |
| Clycerole    | Glycerole     | Gauntletted | Gauntleted   |
| Feuilltonist | Feuilletonist | Genesiolgy  | Genesiology  |
| Flunlyism    | Flunkyism     | Gepound     | Gepoun       |
| Forhall      | Forhail       | Gerlind     | Gerling      |
| Forthputing  | Forthputting  | Gibbostity  | Gibbosity    |
| Frambaesia   | Framboesia    | Godlenly    | Goldenly     |
| Frampoid     | Frampold      | Gracillent  | Gracilent    |
| Friabiiity   | Friability    | Gretto      | Grette       |
| Fructiferuos | Fructiferous  |             |              |

The later-additions register listed two of the old names (Godlenly and Gracillent), and its rows now carry the printed names. Two of its pointers moved with restored text, in Foot and Garrote.

## Kept and held

- **The print is wrong:** Flat "Euclydian", Fraction "pretroleum" and Great "Britian".
- **Probable 1913 revision:** the examples under -graph, "telegraph, photograph", stand where the older printings have "phonograph, chronograph", because the 1913 typists' text has them too.
- **Held for the person (26 questions):** Gendarmerie, which the print sets as Gendarmery. Germicidal and Germicide, whose definitions the record has exchanged. Twenty-three passages that GCIDE rewrote, where restoring the printed wording removes text the later-additions register lists or would blend two wordings (Flatly, Fluorescence, Flying machine, Flying squirrel, Football, Force, Forego, Foreslow, Fourteenth, Fusel oil, Gabble, Gadolinium, Gasify, Gasket, Gavotte, Gift, Girth, Glutaeus, Go-between, Goitre, Graduate, Granary and Graphical). Each is in the review queue with crops of both printings.
- **Held for a later pass (5):** Fine, Fizz, Flake, Generalize and Granulate hold their homographs in another order than the print's.

## Cost

| Step                                     | Tokens       | Model time |
| ---------------------------------------- | ------------ | ---------- |
| Blind readings of 300 columns, two each  | 28.6 million | 5.6 hours  |
| Third readings of 992 strips             | 4.4 million  | 56 minutes |
| Second-chance readings of 50 strips      | 0.4 million  | 6 minutes  |
| Tiebreak readings of 30 strips (Fable)   | 0.1 million  | 3 minutes  |
| Reading of 25 unmatched printed entries  | 0.2 million  | 2 minutes  |
| Drafting, proofreading and review agents | 2.8 million  | 1.9 hours  |

That is about 365,000 tokens a page and 5,700 an entry. The integrating session's own usage was not measured.

## Limits

- Pronunciation marks, punctuation, capitals and italics are not compared.
- A single word that the 1913 printing changed cannot be told from a typist's slip without the 1913 page. The ruling of 10 November 2026 treats it as a slip. The proofreaders marked ten such words here where the typists' text agrees with the record and both readings make sense, among them Galvanize "zink" and Goose "specially". They are corrected to the print and listed in the ledger.
- An entry that runs over from page 550 or onto page 651 is compared only as far as this batch's pages.
- The 1913 printing itself was not read. The only scan found is access-restricted.
