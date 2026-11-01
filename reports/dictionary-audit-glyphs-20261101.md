# Lost-character restoration, November 2026

The dictionary still had 3,430 lost-character markers (U+FFFD) in 1,665 entries, almost all Greek words in etymologies. Most sat in the part of the old damaged-character queue that no review had reached, Metallochromy through Sophora. This run restores lost characters only. Entries it touches get no complete-entry review credit, on the same terms as the earlier character-only checkpoint.

## Method

The run reuses the pipeline from PR #24 and PR #25. Each damaged passage is located on its page through the archive.org OCR of the 1907 volume 1 or 1895 volume 2, and cropped from the page image. Two blind readers transcribe each marker independently, and a third reads only the passages where they disagree. A marker is accepted when two certain readings agree exactly after NFC normalization. The October pilot of this design produced no confirmed wrong acceptances on 60 hand-checked passages.

Restored Greek words are written as literal NFC text, each in its own `grk` element, with a suffix hyphen kept inside the wrapper. Other restored characters follow the record's own encoding. The apply step checks each record's raw hash against the inventory, checks that the replaced run is exactly the lost-character markers, and refuses any edit that changes the parsed structure outside the lost characters.

The run covers 1,541 passages in 1,532 entries. It leaves out 67 passages in entries that Codex had claimed, which already have holds from the ascending review.

## Results

All 1,541 passages were read. Markers that two readers agreed on in the first 1,242 passages were committed as a first checkpoint, and the second checkpoint applies the full result.

| Measure                                                                                                            | Count |
| ------------------------------------------------------------------------------------------------------------------ | ----: |
| Markers accepted                                                                                                   | 2,363 |
| By two blind readers agreeing                                                                                      | 2,184 |
| By two of three readers agreeing, after a tiebreak                                                                 |   174 |
| By LSJ's single attested form, where two readers agreed on every letter and differed only in a breathing or accent |     5 |
| Empty slots removed where the print sets no word (Tautomerism, Tautoousious, Tautozonal)                           |     3 |
| Entries changed                                                                                                    | 1,389 |
| Markers held for a reading                                                                                         |   106 |
| Passages held because no reader found them in the crop                                                             |    92 |
| Lost-character markers left in the dictionary                                                                      |   492 |

The [ledger](dictionary-audit-glyphs-20261101.jsonl) gives each accepted marker with every reading, its status, the owner element, the page and the acceptance path.

## Breathings and earlier holds

The 1895 volume 2 scans don't show a breathing's direction, so every accepted Greek word with a breathing was checked against LSJ. Of 182 such words, 122 match LSJ's single attested form. The 48 words beginning with ρ or υ all carry the rough breathing the editorial rulings require. Inflected forms and compounds match their lemma or first element, and ὁδός takes the rough breathing its gloss "way" calls for.

Two readings stay held because LSJ doesn't settle them: Spleenwort's ἀσπλήνιον, whose prefix LSJ attests with both breathings, and Woe's interjection, which both readers gave with no breathing or accent. Two more keep the holds an earlier review placed: Synallaxine's etymon is ink-filled at the column break, and Thyine wood's accent and diaeresis couldn't be separated from the pixels. Agreement between blind readers doesn't override an earlier finding that the print doesn't show the reading.

Held markers are in the [open-holds register](dictionary-audit-holds.jsonl) under the questions `lost-character-reading` and `lost-character-location`.
