# Lost-character recovery, 16 November 2026

The dictionary still had 202 lost-character markers (U+FFFD) in 161 entries. They were the residue of the [November restoration](dictionary-audit-glyphs-20261101.md), its second printings and the cleanup rounds, and each was held for a stated reason: a passage no crop pipeline had located, a Greek breathing the scans do not show, a printed sign with no settled representation, or an entry the scanned volumes do not print. This pass takes each group in turn and leaves 35 markers. It also fills the lost vowels of 186 damaged pronunciations. It restores lost characters only, and the entries it touches get no complete-entry review credit.

## Method

The [page readings](dictionary-audit-page-reading-2.md) already hold two blind transcriptions of every column of the main vocabulary. A passage is found by the record's own words around the lost characters, searched inside the lines of its printed entry in each reading. Where the entry pairing has no row for a grouped heading, the printed heading is found by its letters.

Each place is then cut from both printings as a strip of about five lines, enlarged about two times: the 1907 or 1895 scan, and the 1898 printing from the same plates. Three more blind readings follow, by Opus and Fable on the first scan and by Opus on the 1898 printing. A run therefore has up to five blind readings from two printings. The integrator opened no page image except the finished sign crops.

A reading is accepted when at least three of the five agree letter for letter and one of them reads the 1898 printing. The scans do not show a breathing's direction reliably, so every accepted breathing is checked against a reference current in 1913, as the editorial rulings direct. [`dictionary-audit-lsj-breathings.jsonl`](dictionary-audit-lsj-breathings.jsonl) records each check.

The [ledger](dictionary-audit-glyphs-20261116.jsonl) has a row for each of the 185 runs, with every reading, the rule that accepted it, or the reason it stays open.

## Results

| Outcome                                                              | Runs | Markers |
| -------------------------------------------------------------------- | ---: | ------: |
| Greek read from the main-vocabulary printings                        |   43 |      46 |
| Greek read from the 1915 New International                           |   25 |      27 |
| Greek restored from the dictionary's own etymologies                 |   47 |      54 |
| Empty slot removed, where the print sets nothing                     |   18 |      18 |
| Pronunciation restored                                               |   12 |      12 |
| Printed sign set as a font glyph or an inline crop                   |    7 |       9 |
| Icelandic letter restored                                            |    1 |       1 |
| Left to the pronunciation pass, which holds the field in its ledgers |   17 |      17 |
| Open, each in the review queue                                       |   15 |      18 |

One hundred and fifty-three runs are settled and 167 markers are gone.

### Greek in the main vocabulary

Forty-three runs in 36 entries take their Greek from the 1907, 1895 and 1898 printings. Most had been held because no crop showed the passage or because the breathing was unclear. Five readings now agree on the letters of all but a handful, and LSJ, Pape or Bailly settles the breathing: Ἶσις, Ἴκαρος, Ἴλιον, ἕν, ἵππος, ἀγγεῖον, ὀδονταλγία. An inflected form takes its lemma's breathing, so εἴρειν follows εἴρω, ἴσχειν follows ἴσχω, and ἴριδος follows ἶρις. Ἰσραηλίτης and Ἰσράηλος take the breathing of Ἰσραήλ, which Bailly attests.

Four accents come from LSJ where the readings split or the print is wrong. Empyesis prints its accent on the first vowel in the 1907 scan, and LSJ has only ἐμπύησις. Hyoscyamus takes ὗς, Hours takes Ὧραι, and Woe takes οἴ, each the only form LSJ gives for letters every reader agrees on.

Masseter's lost field is a phrase, μῦς μασητήρ, which five readings give. Music regains four words: μουσική, τέχνη, μουσικός and Μοῦσα. The grouped entry "Pan-, Panta-, Panto-" is printed under Pan-, where five readings give πᾶς, πᾶν and παντός.

### Supplement entries

Ninety-one runs were in entries that the scanned main volumes do not print. They are words of the supplements, such as Actinogram, Microseism and Telegraphone. A search of archive.org found their source, the 1913 printing of the Revised Unabridged (`rbanms.webstersrevisedu0000noah`), but that scan can only be borrowed. The free scans are of the New International, whose 1915 printing (`bwb_O8-DDQ-914`) and 1914 London printing reword most of these etymologies with combining forms, as in "actino- + -gram". The 1900 Supplement in HathiTrust matches the record's wording for Aërodrome alone.

The 1915 printing prints the lost text of 30 of the runs, and for 29 of them its bracket matches the record's word for word, which is the condition the sources reference sets for this witness. Each was cut from the page and read blind by Opus and Fable, with an Opus reading of the 1914 printing where that page was found. Fourteen runs take their Greek from it: δονητός and δονεῖν under Aërodonetics, Ὕκσως, μεγαλοκέφαλος, Παναθήναια and Ἀθήνη, περίπτερος, Φλεγέθων and φλεγέθειν, πλάνος, σχίζων and -οντος, σύνεσις, συντονία, and ταχυγράφος. Questionnaire takes its French respelling (-nâr′) and Odal its ð. Odal's first vowel is corrected with it, since both readings give ōðal, as the record's own Udal does.

Fifty-eight runs were first restored from the dictionary's own etymologies. A lost word is restored this way when other entries built on the same element set one Greek word before the same gloss: φωνή for the seven words in -phone, τρέπειν for the three in -tropism, ἀκτίς and ἀκτῖνος for Actinogram and Actinophone. The 1915 printing prints eleven of these, and it confirms all eleven: μανός, κόνις, σεισμός and σείειν under Microseism, τάξις, φῶς and φωτός, σκιά, φυτόν, βιοῦν, τέχνη, and σεισμός under Teleseism. Those eleven count above as read from the print. The other 47 rest on the parallels alone. They are marked in the ledger, share one row in the holds register, and wait as one item in the review queue until the 1913 printing can be read.

### Empty slots

Eighteen markers stood in lists of verb forms and plurals where the print sets nothing. In sixteen of them the pronunciation pass had since added the form's printed pronunciation beside the marker, as in "Buttressed (-trĕst)(�)". Both page readings and the closer readings of both printings run straight on at each place, so the marker goes. Bedevil's and Chisel's markers stood after a form that the print leaves without a pronunciation. Eulogize and Reserve each lose a stray period with the marker, and Reserve loses the damaged copy "(z�rvd")" of the pronunciation that now stands before it.

### Pronunciations in marker-only fields

Nine fields that held only markers take the printed pronunciation: Deva (dā̍′vȧ), Hodmen (-men), Gelt (gĕlt), Sceptred (-tẽrd), Kivikivies (-vĭz), Fetishism (fē′tĭsh-ĭz’m or fĕt′ĭsh-; 277), Nitrobenzole (-bĕn′zōl or -bĕn-zōl′), Stomacher's second sense (stŭm′ȧ-chẽr or -ak-ẽr), and Questionnaire's plural. Each rests on three closer readings that agree mark for mark, and the markup comes from the pronunciation pass's own routine. Where an alternative carries a single stress, it is written as the primary accent.

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

## Damaged pronunciations

Apart from the markers, 229 pronunciation fields in 150 entries still had question marks where vowels were lost, with no row in the pronunciation ledgers. Most are second headwords of grouped entries in Co to Cy and in Re, such as Coronated's "(-n?ˊt?ed)". The user asked that these be fixed and never blanked.

Each field was found in the page readings by its own frame of surviving consonants, hyphens and stress marks, cut from both printings, and read blind three more times. A field is filled when the reading fits the frame exactly and three of the five readings agree mark for mark, among them the 1898 closer reading and a second closer reading. Where the pronunciation pass's own risk check flags the reading, for a plain long vowel without stress or another mark that readers miss, all three closer readings must agree. Only the lost vowels change. The consonants, hyphens, stress weights and guide numbers stay the record's own.

| Outcome                                  | Fields |
| ---------------------------------------- | -----: |
| Filled on five agreeing readings         |    110 |
| Filled on four                           |     21 |
| Filled on three                          |     55 |
| Held                                     |     42 |
| Entry not printed in the scanned volumes |      1 |

Fifty of the fields filled on three readings are cases where the three closer readings agree on a tick that both page readers missed. Three fills replace a lone question mark that stood for a whole respelling beside a note, as in Scaleboard's "(skāl′bōrdˊ; commonly skăb′ẽrd)".

Twenty of the held fields have fewer than three agreeing readings. In seven the record's frame itself contradicts the print, so more than vowels are damaged: Corvette's "(k?r-v?r′)" stands against the printed "kŏr-vĕt′". Three have a capital letter where the print has a marked vowel, as in Crinet. The [ledger](dictionary-audit-glyphs-20261116-pronunciations.jsonl) gives every reading and reason.

## Judgment calls

Each of these is in the review queue with its evidence, and with crops of the printings where a printing shows it.

- **Drake:** five readings give ἀνάτια, the form the etymology reconstructs behind νῆσσα. No dictionary lists it, so its breathing rests on the readings.
- **Jubilee:** four readings give ἰωβηλαῖος. LSJ, Pape and Bailly do not list the word.
- **Myopsis:** every printing sets ὤψις, which is not a Greek word. The gloss is "sight", so the record takes ὄψις.
- **Sauroid:** one letter of σαυροειδής is broken on the plate in every printing. LSJ has only that word with the remaining letters.
- **Hydr-:** the record had two lost Greek words where both printings set one, ὕδωρ. The second slot is dropped. The 1913 printing may have added ὕδατος.
- **The 47 words restored from the dictionary's own etymologies**, as one item.

Jesse's Ἰεσσαί takes the breathing the Greek New Testament prints at Matt. i. 5, looked up in Abbott-Smith. Hyksos's Ὕκσως is in no dictionary consulted, and its rough breathing is the one a word-initial υ always takes.

## What stays open

Fifteen runs stay open, each as a question in the review queue.

- **Printings that disagree:** Clavier's note reads (klȧ-vēr′) in the 1907 scan and has an f in the 1898 printing. Pina's respelling reads pī′nȧ in the 1915 printing and pi′nä in the 1914 one.
- **A print whose wording differs:** the 1915 printing gives Asterope as Ἀστερόπη in another bracket, and gives Telharmony's respelling in its own key, with a mark this dictionary's key lacks.
- **No printing at hand:** Aplasia's second word, Appendicectomy, Arthropathy, Melanoma, Mycetozoa, Pyrazine, Thermochroic, Thermophore and Wen. Six carry a proposal. Arthropathy and Melanoma have parallels that differ in the order or form of the two words.
