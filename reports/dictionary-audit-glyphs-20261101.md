# Lost-character restoration, November 2026

The dictionary still had 3,430 lost-character markers (U+FFFD) in 1,665 entries, almost all Greek words in etymologies. Most sat in the part of the old damaged-character queue that no review had reached, Metallochromy through Sophora. This run restores lost characters only. Entries it touches get no complete-entry review credit, on the same terms as the earlier character-only checkpoint.

## Method

The run reuses the pipeline from PR #24 and PR #25. Each damaged passage is located on its page through the archive.org OCR of the 1907 volume 1 or 1895 volume 2, and cropped from the page image. Two blind readers transcribe each marker independently, and a third reads only the passages where they disagree. A marker is accepted when two certain readings agree exactly after NFC normalization. The October pilot of this design produced no confirmed wrong acceptances on 60 hand-checked passages.

Restored Greek words are written as literal NFC text, each in its own `grk` element, with a suffix hyphen kept inside the wrapper. Other restored characters follow the record's own encoding. The apply step checks each record's raw hash against the inventory, checks that the replaced run is exactly the lost-character markers, and refuses any edit that changes the parsed structure outside the lost characters.

The run covers 1,541 passages in 1,532 entries. It leaves out 67 passages in entries that Codex had claimed, which already have holds from the ascending review.

## Checkpoint 1

The first 1,242 passages finished reading. The checkpoint applies every marker two readers agreed on in entries with no passage still being read.

| Measure                                       | Count |
| --------------------------------------------- | ----: |
| Markers accepted                              | 1,864 |
| Of which Greek                                | 1,789 |
| Entries changed                               | 1,088 |
| Markers in these passages still unresolved    |   180 |
| Lost-character markers left in the dictionary | 1,342 |

The [ledger](dictionary-audit-glyphs-20261101.jsonl) gives each accepted marker with both readings, their statuses, the owner element and the page.

## Remaining

The other 299 passages are still being read. The 180 unresolved markers wait on the third reader, and then on LSJ for Greek words whose two readings agree on every letter and differ only in a breathing or accent. That follows the editorial ruling that breathings and accents come from LSJ when exactly one form is attested. Markers still unresolved after both steps join the open-holds register.
