# Open dictionary audit holds

[`dictionary-audit-holds.jsonl`](dictionary-audit-holds.jsonl) lists every field the descending audit (batches z10 through z21, Synchysis back to Spermatorrhoea) left unrepaired after its final review. Each row carries the batch, key, parsed field, print pages, and the reviewer's reason. Rows held at the decision stage also carry the exact `old` and `new` fragments with the frozen raw hash.

A row's `needs` value says what would resolve it:

- `evidence`: the print does not settle the reading. These are mostly Greek breathings printed as blobs, glyphs crowded by ink from the line above, and entries with no 1895 printing. A clearer scan or another witness can reopen them, and no ruling applies. There are 63 such rows.
- `ruling`: the print reading is certain, but repairing it would change editorial policy. There are 28 such rows, grouped by `question` below. When the user decides a question, record the rule in the dictionary-audit skill references. Then apply it to every row with that question through a frozen review, with the usual decision validation and final review.

## Questions awaiting a ruling

| `question`                    | Rows | Example                                                    | Decision needed                                                                                                                                                                                      |
| ----------------------------- | ---: | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `coherent-electronic-reading` |   13 | Stink: print "stincan", raw, GCIDE and Gutenberg "stinkan" | Should a clearly printed reading replace a coherent form that both electronic witnesses share? Other rows: Strobile "strobole", Stick "bolt", Spew "Rev. ii. 16", Synartesis "jointed".              |
| `print-only-punctuation`      |    6 | Spit: print "spid, Sw.", every electronic text "spid. Sw." | Should punctuation found only in print be added?                                                                                                                                                     |
| `print-only-text`             |    5 | Step: print "Cf. Stamp, v. t., Staple, n. & a."            | Should words, labels, or cross-references found only in print be added? Other rows: Swoon's etymology span, Spleen's "Skr.", Sty's Stile reference, and Spheroid's "of revolution, under ELLIPSOID". |
| `print-only-diacritic`        |    2 | Spew: print shṭhiv with an underdot                        | Should diacritics found only in print be added?                                                                                                                                                      |
| `space-after-initial`         |    1 | Sycophancy: "A.Philips"                                    | The user approved a dictionary-wide pass. It covers 27 records, most of them in the ascending range.                                                                                                 |
| `greek-letter-y-encoding`     |    1 | Stylohyal: "the Gr. letter Y"                              | The corpus writes this letter three ways. Which form is canonical?                                                                                                                                   |

Repairs were accepted without a ruling when both electronic witnesses are visibly broken. Examples include a comma run into a period (Sphere "fr.", "etc."), a dropped word that leaves the sentence ungrammatical (Spire "a spire of grass"), and a cross-reference to a nonexistent entry (Spew "Pyke" to "Puke").
