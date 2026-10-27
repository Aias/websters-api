# Survey of our text against Gutenberg's 1913 transcription

Our source descends from GCIDE, which began as the same volunteer transcription of the 1913 _Webster's Revised Unabridged_ that Project Gutenberg distributes (etexts 660–669). GCIDE's editors later reworded definitions, added senses, and fixed transcription typos. Our macOS-bundle import then dropped some of the added material and, with it, some 1913 text that sat next to it. Fabulous shows both kinds of drift: sense 2 reads "Beyond belief" where the print and Gutenberg read "Passing belief", and the compound "Fabulous age" is missing.

The survey compares every entry three ways: our text, Gutenberg's, and the OCR of the scanned print (vol. 1 of the 1907 printing and vol. 2 of the 1895 printing). It normalizes notation, Greek, and markup, diffs the words, and classifies each changed hunk. For each hunk, it scores which reading the OCR supports. The data and tools are in `.context/dictionary-audit/survey-gutenberg/`, which is local to a workspace.

| Class                            | Print supports Gutenberg | Print supports ours | Both | Unclear | Total |
| -------------------------------- | -----------------------: | ------------------: | ---: | ------: | ----: |
| Substitution (different words)   |                    2,920 |               1,058 |  138 |   1,848 | 5,964 |
| Spelling (one-token edits, case) |                      790 |               4,430 |  400 |   3,528 | 9,148 |
| Text only ours has               |                    4,185 |               1,168 |      |   4,070 | 9,423 |
| Text only Gutenberg has          |                    1,294 |                 343 |      |     575 | 2,212 |
| Notation (Greek, Latin-1 losses) |                          |                     |      |         | 9,135 |
| Punctuation only                 |                          |                     |      |         | 2,882 |

There are also 7,019 keys that only our text has, mostly later GCIDE additions, and 515 Gutenberg entries with no key in ours.

## How far the vote can be trusted

A stratified sample of 60 hunks was checked against the page images.

- **The vote matched the page on 54 of 60.** An "ours" vote whose Gutenberg side scored zero is not evidence, because it usually means the OCR window was garbled.
- **Neither source wins outright.** Where the page decides, it showed Gutenberg on 37 and ours on 21.
- **Gutenberg was right** on most substitutions. Those are editorial rewrites in ours: "Lack" for "Want", "Rumania" for "Roumania", "cannot" for "can not", and senses that were rewritten or added.
- **Ours was right** on most spelling hunks. Those are Gutenberg typos, dropped ligatures, and doubled words.
- **Text only ours has splits evenly.** Half is text Gutenberg dropped, and half was added after 1913.
- **Every sampled compound that ours lacks is in the print.**

A vote alone would make roughly one wrong edit in ten, so every hunk goes through the usual two blind print readings before it changes the source. Two checks hold up well enough to prioritize the work: a "gutenberg" vote, and a compound that ours lacks.

## Results so far

- **Compounds.** Of the 113 compounds the print supports, 63 already sit elsewhere in our corpus, often split into their own entry. Six are parsing artifacts. Of the 44 targets built from the rest, 33 are restored after two blind readings. The other 11 wait on markup conventions or on printed punctuation the readers read differently.
- **Pilot wording.** Seven pilot corrections restore the print's wording, including Fabulous, Vise, Viable, Hospodar and Pathogene.
- **Headwords.** 1,662 lowercase headwords whose 1913 headword is capitalized now take the capital.
- **Short rewordings.** A batch took 48 short substitutions with a strong print vote. Of these, 36 sat in sentences that GCIDE had also rewritten elsewhere, so changing the hunk alone would leave a sentence that matches neither text. Those stay held. The 12 whose sentences otherwise match the print are restored: "want" for "lack", "Mohammedans" for "Muslims", "occluding" for "absorbing", "albumen" for "protein" and similar.

## Open decisions

- **Text only ours has, where the print lacks it.** This covers 4,185 hunks with a Gutenberg vote, and about half of the sample was post-1913 additions. The options are to keep it, mark it as a later addition, or remove it.
- **The 7,019 entries only ours has.** These are later GCIDE additions with no 1913 print. The same question applies.
- **Substitutions with a Gutenberg vote.** There are 2,920, and most are parts of definitions GCIDE rewrote whole, Keratin and Malaria among them. Reconciling these means restoring the 1913 definition or sense as a unit, read twice from the print, rather than word by word. Deciding whether to do that also decides what happens to the modern wording it replaces.
- **Entry-splitting defects.** The compound triage found several. A stray key "Bold eagle" holds Bold's compounds and synonym paragraph. Cretaceous compounds sit in Cretacic, a Chateaubriand record carries Chateau en Espagne, and others are similar. They need structural repair, not text edits.
