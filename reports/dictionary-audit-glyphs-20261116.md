# Lost-character recovery, 16 November 2026

The dictionary still had 202 lost-character markers (U+FFFD) in 161 entries. They were the residue of the [November restoration](dictionary-audit-glyphs-20261101.md), its second printings and the cleanup rounds, and each was held for a stated reason: a passage no crop pipeline had located, a Greek breathing the scans do not show, a printed sign with no settled representation, or an entry the scanned volumes do not print. This pass takes each group in turn. It restores lost characters only, and the entries it touches get no complete-entry review credit.

## Method

The [page readings](dictionary-audit-page-reading-2.md) already hold two blind transcriptions of every column of the main vocabulary. A passage is found by the record's own words around the lost characters, searched inside the lines of its printed entry in each reading. Where the entry pairing has no row for a grouped heading, the printed heading is found by its letters.

Each place is then cut from both printings as a strip of about five lines, enlarged about two times: the 1907 or 1895 scan, and the 1898 printing from the same plates. Three more blind readings follow, by Opus and Fable on the first scan and by Opus on the 1898 printing. A run therefore has up to five blind readings from two printings. The integrator opened no page image except the finished sign crops.

A reading is accepted when at least three of the five agree letter for letter and one of them reads the 1898 printing. The scans do not show a breathing's direction reliably, so every accepted breathing is checked against a reference current in 1913, as the editorial rulings direct. [`dictionary-audit-lsj-breathings.jsonl`](dictionary-audit-lsj-breathings.jsonl) records each check.

The [ledger](dictionary-audit-glyphs-20261116.jsonl) has a row for each of the 185 runs, with every reading, the rule that accepted it, or the reason it stays open.

## Results

| Outcome                                                              | Runs | Markers |
| -------------------------------------------------------------------- | ---: | ------: |
| Greek restored from the print                                        |   40 |      43 |
| Empty slot removed, where the print sets nothing                     |   18 |      18 |
| Pronunciation restored                                               |   11 |      11 |
| Printed sign set as a font glyph or an inline crop                   |    7 |       9 |
| Left to the pronunciation pass, which holds the field in its ledgers |   17 |      17 |
| Open                                                                 |   92 |     104 |

Seventy-six runs are settled and 81 markers are gone. The dictionary has 121 lost characters left.

### Greek

Forty runs in 35 entries take their Greek from the print. Most had been held because no crop showed the passage or because the breathing was unclear. Five readings now agree on the letters of all but a handful, and LSJ, Pape or Bailly settles the breathing: Ἶσις, Ἴκαρος, Ἴλιον, ἕν, ἵππος, ἀγγεῖον, ὀδονταλγία. An inflected form takes its lemma's breathing, so εἴρειν follows εἴρω, ἴσχειν follows ἴσχω, and ἴριδος follows ἶρις. Ἰσραηλίτης and Ἰσράηλος take the breathing of Ἰσραήλ, which Bailly attests.

Four accents come from LSJ where the readings split or the print is wrong. Empyesis prints its accent on the first vowel in the 1907 scan, and LSJ has only ἐμπύησις. Hyoscyamus takes ὗς, Hours takes Ὧραι, and Woe takes οἴ, each the only form LSJ gives for letters every reader agrees on.

Masseter's lost field is a phrase, μῦς μασητήρ, which five readings give. Music regains four words: μουσική, τέχνη, μουσικός and Μοῦσα.

### Empty slots

Eighteen markers stood in lists of verb forms and plurals where the print sets nothing. In sixteen of them the pronunciation pass had since added the form's printed pronunciation beside the marker, as in "Buttressed (-trĕst)(�)". Both page readings and the closer readings of both printings run straight on at each place, so the marker goes. Bedevil's and Chisel's markers stood after a form that the print leaves without a pronunciation. Eulogize and Reserve each lose a stray period with the marker, and Reserve loses the damaged copy "(z�rvd")" of the pronunciation that now stands before it.

### Pronunciations

Eight fields that held only markers take the printed pronunciation: Deva (dā̍′vȧ), Hodmen (-men), Gelt (gĕlt), Sceptred (-tẽrd), Kivikivies (-vĭz), Fetishism (fē′tĭsh-ĭz’m or fĕt′ĭsh-; 277), Nitrobenzole (-bĕn′zōl or -bĕn-zōl′), and Stomacher's second sense (stŭm′ȧ-chẽr or -ak-ẽr). Each rests on three closer readings that agree mark for mark, and the markup comes from the pronunciation pass's own routine. Where an alternative carries a single stress, it is written as the primary accent.

Seventeen more markers sit in pronunciation fields that the [pronunciation pass](dictionary-audit-pronunciation.md) already holds with a ledger row, mostly for an accent's weight or a mark that readers are known to miss. They stay with that pass.

### Printed signs

The user ruled on 16 November that a printed sign goes inline, as a glyph of the dictionary's own font where a Unicode character has the printed form and otherwise as an unchanged crop of the page. A reader's crop of each sign from the 1907 scan was compared with the 1898 printing, and all nine signs are the same in both.

| Entry    | Print                                                 | Now                                                       |
| -------- | ----------------------------------------------------- | --------------------------------------------------------- |
| Breve    | A hollow oblong with heavy bars                       | 𝆸 U+1D1B8, added from Noto Music                          |
| Clavicle | A long s hooked at both ends, with no crossbar        | ʃ U+0283, added from Noto Serif                           |
| L        | An inverted T                                         | ⊥ U+22A5                                                  |
| Legato   | An arch, a bowl, and two long ties hooked at the ends | ⏜, ⏝, ⏠ and ⏡. The last two are added from Noto Sans Math |
| Dash     | A short wedge set high, thick at the top              | `dash-staccato.png`, an inline crop                       |
| Direct   | A heavy zigzag like a slanted W, the custos           | `direct-custos.png`, an inline crop                       |

Clavicle's letter overlaps the comma after it in both printings, so no clean crop exists, and both page readers had written ʃ for it. The staccato wedge has only a combining character in Unicode, and the custos has none. The wedge's crop runs down to the baseline of its line so that the mark sits raised as printed.

## Judgment calls

Six decisions go beyond what the written rules settle. Each is restored as described and waits in the review queue with crops of both printings and every reading.

- **Drake:** five readings give ἀνάτια, the form the etymology reconstructs behind νῆσσα. No dictionary lists it, so its breathing rests on the readings.
- **Jubilee:** four readings give ἰωβηλαῖος. LSJ, Pape and Bailly do not list the word.
- **Myopsis:** every printing sets ὤψις, which is not a Greek word. The gloss is "sight", so the record takes ὄψις.
- **Sauroid:** one letter of σαυροειδής is broken on the plate in every printing. LSJ has only that word with the remaining letters.
- **Hydr-:** the record had two lost Greek words where both printings set one, ὕδωρ. The second slot is dropped. The 1913 printing may have added ὕδατος.
- **Clavier:** the note's pronunciation stays open. The 1907 scan reads (klȧ-vēr′) in three of five readings, and both readings of the 1898 printing have an f.

Jesse's Ἰεσσαί takes the breathing the Greek New Testament prints at Matt. i. 5, looked up in Abbott-Smith.

## What stays open

Ninety-one of the 92 open runs are in entries that the scanned main volumes do not print: words of the 1900 Supplement of New Words and of the enlarged supplement that followed it, such as Actinogram, Microseism and Telegraphone. They need a printing that contains them. The other open run is Clavier's note.
