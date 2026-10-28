# Print-source reconciliation

This track restores printed definitions, senses, notes, compounds, and entries wherever the GCIDE-derived source rewrote or lost them. Its progress is measured separately from character repair, pronunciation transcription, and complete-entry review.

Fabulous illustrates the problem. The inherited definition read "Beyond belief" where the print reads "Passing belief", and the import omitted "Fabulous age". Both are restored. The [Gutenberg survey](dictionary-gutenberg-survey.md) records the discovery method. The [editorial decisions](dictionary-audit-decisions.md) explain the accepted treatment of rewritten senses and later additions.

## Scope

- Restore the complete printed unit when later editors rewrote a definition, sense, note, or compound. Include its examples, quotations, labels, and attribution.
- Restore printed sense division, order, numbering, and the placement of compounds and split entries.
- Restore missing printed content and records.
- Preserve entirely additional senses, notes, and entries under the editorial rulings, with classifications in the [later-additions register](dictionary-later-additions.jsonl).

Gutenberg and GCIDE provide comparison text and candidate locations. Accepted corrections require the independent print readings and verification described in the [dictionary-audit skill](../.agents/skills/dictionary-audit/SKILL.md). Pronunciation and glyph repairs made alongside a restoration retain their own counts.

## Recorded progress

Checkpoint: senses-4, based on `1da044a` (Record print-source reconciliation inventory). Source SHA-256 `7c2a9d6dc9b06b64a99cd1252c9edd526cabc9229cad6645c346249f5669a2c0`. The frozen inventory retains its original source hashes. Current workset dispositions are recorded separately in [`dictionary-print-workset-outcomes.jsonl`](dictionary-print-workset-outcomes.jsonl).

| Work                            | Completed                                                                                                                                   | Remaining or measurement limit                                                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus comparison               | A through Z comparison identifies 36,797 difference fragments across six classes.                                                           | Fragments are frozen by exact key and source hash. Complete lexical units and their outcomes still need reconciliation.                                                                 |
| Whole definitions               | Definition batches 1 through 4 restore 158 targets. Fix-1 resolves three additional definition targets, for 161.                            | These count definitions, not complete entries. No corpus-wide denominator is established.                                                                                               |
| Sense structure                 | Senses-1, senses-2, and senses-3 restructure 69 distinct entries: 19, 24, and 26. Corn receives a separate restoration.                     | Senses-4 reviews all 58 remaining candidates: 52 restored sense units and six unchanged rulings. Dolphin retains a parser ownership hold. Broader differences remain outside this pool. |
| Definition-5                    | [58 accepted corrections across 30 entries](dictionary-audit-definition-5.md), resolving 33 held fields.                                    | Its targets have no remaining holds. The total includes 18 pronunciation targets and other accompanying repairs. It adds no complete-entry review credit.                               |
| Missing standalone records      | 68 of 71 missing records identified by the survey are restored.                                                                             | Flatware, Retroussé, and Rossel current require supplement pages. This pool does not establish that every possible omission has been discovered.                                        |
| Original missing-compound pool  | 43 of 44 targets are restored.                                                                                                              | Lizard fish remains held, as described below.                                                                                                                                           |
| Compounds in separate records   | 46 restoration targets return printed compounds to their head entries. Duplicate or wholly merged material accounts for 26 removed records. | The 188-key pool has 64 recorded resolutions and 124 remaining candidates or acceptance-evidence questions. Those counts include overlap with split-record work.                        |
| Original split-record proposals | All 15 proposals have recorded source dispositions.                                                                                         | Proposal and source-disposition records alone do not establish acceptance. Bold eagle's gap also appears in the compound remainder.                                                     |
| Later-addition classification   | [14,184 classifications across 11,416 entries](dictionary-later-additions.md).                                                              | 4,109 classifications are uncertain. Expanded witness coverage identifies 497 entry classifications for priority re-examination.                                                        |

These rows use different units and overlap. A whole-sense restoration can resolve several survey fragments, and a later batch can revisit an entry. Keep batch edits, distinct entries, resolved holds, and survey fragments separate. The older 3,494-entry damaged-character review queue supplies no denominator for this track.

The whole-definition totals come from the survey's batch results and the fix-1 reruns for Clock, Key, and Kumquat. Sense totals include the senses-3 restoration in `38b54a9`. Definition-5 has an exact [acceptance ledger](dictionary-audit-definition-5.jsonl). The survey contains historical intermediate counts, so use this checkpoint and the corresponding batch records when reporting progress.

The later-addition register has 6,733 located spans and 1,146 unresolved locations. Senses-4 retires 35 replaced spans, relocates two pointers using lexical context, and clears three pointers for further reconciliation. These location counts are separate from the classification categories above.

## Remaining work

### Reconcile complete lexical units

The frozen comparison covers the main alphabet in Gutenberg books 660 through 670. It partitions all 100,803 source records:

| Comparison result                     | Source records |
| ------------------------------------- | -------------: |
| At least one difference fragment      |         19,129 |
| No main-alphabet key match            |          6,265 |
| Matched with no normalized difference |         75,409 |

The 36,797 fragments comprise 5,733 substitutions, 7,670 spelling differences, 9,103 source-only fragments, 2,029 Gutenberg-only fragments, 9,311 notation differences, and 2,951 punctuation differences. A record with no normalized difference still lacks a print-review outcome.

The original A through W dataset has 38,764 fragments. Its refreshed equivalent has 36,304. The expanded survey adds 493 fragments from X through Z and matched source sections. The earlier 38,842 total was a transcription error. The X through Z parser separately identifies the Z letter entry and excludes bare alphabet-divider headings. The supplement starts after the main Zythum entry, at book 670 paragraph 1374.

The supplement index contains 3,960 parsed entries. Of these, 3,780 match a source key and 180 do not. This is a presence index. Supplemental text still needs comparison even when a key matches.

The 457 unmatched main-text entries retain their individual dispositions: 448 link to historical accounting and nine are newly exposed X through Z candidates. The nine have current name or variant leads, but their complete text and ownership remain unreviewed. The supplement's 180 unmatched entries include 133 with raw heading or compound-name matches, 44 without those matches, and the three known missing-record holds. Main and supplement occurrences remain separate unless existing evidence identifies the same held unit.

Associate each difference with its complete definition, sense, note, compound, or entry before assigning an outcome. A restored sentence can cover several fragments, and one fragment can cross unit boundaries. Preserve the exact before/after text and acceptance evidence when resolving overlaps. Corpus-wide completion remains unmeasured until those units and outcomes are established.

### Frozen inventory and review history

The tracked files preserve the candidate accounting independently of workspace scratch files:

- [`dictionary-print-inventory.json`](dictionary-print-inventory.json): source checkpoint, scope counts, input hashes, output hashes, and limits.
- [`dictionary-print-inventory.jsonl`](dictionary-print-inventory.jsonl): 26,031 rows covering 19,129 source records with differences, 6,265 unmatched source records, 457 unmatched main-text entries, and 180 unmatched supplement entries. These scopes overlap by lexical content and are not a completion denominator.
- [`dictionary-print-fragments.jsonl`](dictionary-print-fragments.jsonl): all 36,797 comparison fragments, including text, context, witness locations, and inherited vote provenance. Its numeric IDs belong to this frozen A through Z survey.
- [`dictionary-print-review-history.jsonl`](dictionary-print-review-history.jsonl): 740 historical target attempts across 496 keys, retaining exact edits, acceptance records, application evidence, and explicit predecessor links. Historical survey IDs retain their original A through W namespace.
- [`dictionary-print-worksets.jsonl`](dictionary-print-worksets.jsonl): the 58 remaining sense candidates, all 188 original own-record compound candidates, and 497 classification-review candidates. Each pool retains its own units and statuses.

The historical catalog has 635 recorded accepted targets: 626 applications confirmed through current fragments or exact source-change histories, and nine explicit reversals. Its 678 predecessor groups join only explicit references. They do not remove every semantic overlap. Old held attempts retain their original status even when a later target resolves the field, so they are not the current open-hold register.

Eighteen historical decisions copy one convention reader into both derived reading slots. Their original distinct readers, disagreements, and convention resolutions are preserved separately. Those copies do not establish independent agreement on the final serialized fragment. Application proofs establish source history, while their recorded acceptance limitations remain. In particular, Immolator's final stress adjustment uses Gutenberg notation, and Invagination's later-sense deletion uses an auditor ruling. This inventory adds no new source readings, repairs, or complete-entry review credit.

### Re-examine later-addition classifications

The original survey omitted X through Z and the supplement. Expanded coverage finds main-text headword matches for 321 existing entry classifications and supplement matches for 2,449, with six in both groups. The priority pool contains all 321 main matches plus 176 supplement matches carrying a category other than `supplement-1913`, for 497 entries. Matching names establish candidate locations, not the origin of every sense or paragraph.

Yang demonstrates an additional classification defect. The classifier combined the historical goose noun and verb with GCIDE's separate lowercase Chinese-philosophy entry, then assigned the latter's editor tag to the current record. The current Yang record contains only the historical goose senses. Preserve this provenance finding when reviewing the classification. Registry categories and source text remain unchanged by the inventory.

### Continue sense and definition restoration

[Senses-4](dictionary-audit-senses-4.md) reviews all 58 remaining candidates in the senses-3 pool. It restores 52 complete sense units and leaves six units unchanged after matching them to the print: Malignant, Fin, Magnitude, Pace, Spindle, and Vigil. Accompanying work accepts 38 pronunciation targets and 21 other repairs. The exact ledger separates 93 independent agreements, 18 source adjudications, six unchanged rulings, and two lookup metadata annotations.

Dolphin's note is restored in printed order after sense 1(b), but its content refers to 1(a). The parser cannot express that earlier nested owner. Its tracked structural hold preserves the note, actual owner, intended owner, and missing annotation capability. This batch grants zero complete-entry review credit.

The 58 worksets remain in the frozen inventory with their original spans and blockers. Read their [current outcomes](dictionary-print-workset-outcomes.jsonl) before selecting new work. No unreviewed candidates remain in this bounded pool. Broader sense and definition differences still require complete-unit reconciliation.

### Finish the own-record compound pool

The 188-key pool has 47 keys covered by 46 accepted restoration targets, 16 explicit duplicate removals, and Hostilities resolved through split-record work. The remaining 124 comprise 123 unreviewed candidates and Bold eagle's acceptance-evidence question. Seventy-three of those 124 were historically marked as already having a compound under the head entry. They require disposition review rather than automatic insertion.

### Obtain supplement evidence

Flatware, Retroussé, and Rossel current await matching pages from the 1900 supplement. The handoff identifies HathiTrust item `uiug.30112099825041`, scans 1121 through 1358. Follow the browser-access instructions when obtaining these witnesses.

### Resolve the Lizard fish hold

The original `compound-restore` target `cr03-t7` remains unresolved. Current Lizard has Lizard snake and Lizard stone but lacks Lizard fish. The first reader held the botanical ligature and a damaged letter in the vernacular synonym. Fresh independent readings must settle both before restoration.

The open register includes this recovered hold and the three missing supplement records. It contains 155 unresolved fields: 88 evidence holds, 65 reading holds, and two structure holds, including Dolphin. The original discovery evidence is `.context/dictionary-audit/exhaustive/compound-restore/initial-cr03/holds.json`.

## Updating progress

After each batch, update this report's checkpoint, completed work, remaining candidates, and evidence dependencies. Revalidate later-addition locations against the restored source, confirming lexical context before moving a pointer and clearing unresolved pointers. Keep exact accepted edits in the batch ledger and unresolved readings in the open-holds register. Report the units counted and the pool they belong to. Leave the overall percentage unmeasured until the full candidate inventory has been reconciled.

For project status and handoffs, name this track explicitly as **print-source reconciliation**. Give its results separately from the damaged-character queue, general parser work, pronunciation transcription, and illustrations. A targeted restoration closes its reviewed fields without granting complete-entry review credit.
