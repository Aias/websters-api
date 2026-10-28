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

Checkpoint: source revision `452e7b9dfcf494483b2cb1b2dae849807c875eea`, SHA-256 `19ec7e5841c63fd98c77956757e68fca490c37784d8fe2366745634f5fc8d7fd`.

| Work                            | Completed                                                                                                                                   | Remaining or measurement limit                                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus comparison               | Initial survey identifies 38,842 difference fragments across six classes.                                                                   | The remaining corpus-wide backlog needs reconciliation against the restored source. Differences include transcription errors, editorial rewrites, and legitimate additions. |
| Whole definitions               | Definition batches 1 through 4 restore 158 targets. Fix-1 resolves three additional definition targets, for 161.                            | These count definitions, not complete entries. No corpus-wide denominator is established.                                                                                   |
| Sense structure                 | Senses-1, senses-2, and senses-3 restructure 69 distinct entries: 19, 24, and 26. Corn receives a separate restoration.                     | The bounded senses-3 pool retains 58 candidates listed below. Broader structural differences remain outside that pool.                                                      |
| Definition-5                    | [58 accepted corrections across 30 entries](dictionary-audit-definition-5.md), resolving 33 held fields.                                    | Its targets have no remaining holds. The total includes 18 pronunciation targets and other accompanying repairs. It adds no complete-entry review credit.                   |
| Missing standalone records      | 68 of 71 missing records identified by the survey are restored.                                                                             | Flatware, Retroussé, and Rossel current require supplement pages. This pool does not establish that every possible omission has been discovered.                            |
| Original missing-compound pool  | 43 of 44 targets are restored.                                                                                                              | Lizard fish remains held, as described below.                                                                                                                               |
| Compounds in separate records   | 46 restoration targets return printed compounds to their head entries. Duplicate or wholly merged material accounts for 26 removed records. | The initial 188-key candidate pool includes compounds already present under their heads. Its remaining work needs reconciliation.                                           |
| Original split-record proposals | All 15 proposals are settled.                                                                                                               | Further split-record defects may emerge during review.                                                                                                                      |
| Later-addition classification   | [14,219 classifications across 11,431 entries](dictionary-later-additions.md).                                                              | 4,119 classifications remain uncertain. These are classification questions, not confirmed source defects.                                                                   |

These rows use different units and overlap. A whole-sense restoration can resolve several survey fragments, and a later batch can revisit an entry. Keep batch edits, distinct entries, resolved holds, and survey fragments separate. The older 3,494-entry damaged-character review queue supplies no denominator for this track.

The whole-definition totals come from the survey's batch results and the fix-1 reruns for Clock, Key, and Kumquat. Sense totals include the senses-3 restoration in `38b54a9`. Definition-5 has an exact [acceptance ledger](dictionary-audit-definition-5.jsonl). The survey contains historical intermediate counts, so use this checkpoint and the corresponding batch records when reporting progress.

The later-addition register has 6,771 located spans and 1,143 unresolved locations. Its ownership reconciliation confirms four moved spans and clears 148 stale pointers for further review. These location counts are separate from the classification categories above.

## Remaining work

### Reconcile the complete candidate inventory

Recompare the current source with the electronic witnesses, retaining the print as the deciding evidence. Associate each difference with its complete lexical unit and recorded outcome: restored, verified unchanged, retained later addition, held, or unreviewed. Record exact keys and source hashes, deduplicate overlapping units, and preserve the relationship to earlier batch decisions. A fixed pool with an outcome for each unit can support a completion percentage.

### Continue sense and definition restoration

The senses-3 preparation contains 84 eligible candidates, of which 26 were accepted in that batch. The other 58 candidates have unique original spans still present at the checkpoint above:

Apocalypse, Barbecue, Brush, Campaign, Clinic, Connection, Diagnosis, Dicky, Dolphin, Double-decker, Driver, Drug, Electricity, Execution, Fin, Fossil, Gammon, Gape, Gown, Grommet, Gross, Handfast, Humble, Implosion, Lachrymal, Limbus, Limn, Litigious, Magnitude, Malignancy, Malignant, Mandate, Map, Metastasis, Mire, Miser, Money, Nick, Oculus, One-sided, Orchestra, Overlay, Override, Overtake, Pace, Palette, Panel, Pap, Pendant, Proteus, Resiliency, Rubber, Screw, Silver, Spindle, Steel, Traverse, Vigil.

These are unreviewed candidates, not 58 confirmed defects. Preparation excluded some from dispatch because of page location or sense-boundary questions. Recheck their complete printed units before selecting the next batch. The local preparation evidence is `exhaustive/senses-3/PREPARATION.md`, `tools/cand3.json`, and `tools/want.json` under `.context/dictionary-audit/`.

### Obtain supplement evidence

Flatware, Retroussé, and Rossel current await matching pages from the 1900 supplement. The handoff identifies HathiTrust item `uiug.30112099825041`, scans 1121 through 1358. Follow the browser-access instructions when obtaining these witnesses.

### Recover the Lizard fish hold

The original `compound-restore` target `cr03-t7` remains unresolved. Current Lizard has Lizard snake and Lizard stone but lacks Lizard fish. The first reader held the botanical ligature and a damaged letter in the vernacular synonym. Fresh independent readings must settle both before restoration.

This hold is absent from the global open and resolved registers at the checkpoint above. Preserve it during inventory reconciliation and add its current target and evidence question to the open register. The original discovery evidence is `.context/dictionary-audit/exhaustive/compound-restore/initial-cr03/holds.json`.

## Updating progress

After each batch, update this report's checkpoint, completed work, remaining candidates, and evidence dependencies. Revalidate later-addition locations against the restored source, confirming lexical context before moving a pointer and clearing unresolved pointers. Keep exact accepted edits in the batch ledger and unresolved readings in the open-holds register. Report the units counted and the pool they belong to. Leave the overall percentage unmeasured until the full candidate inventory has been reconciled.

For project status and handoffs, name this track explicitly as **print-source reconciliation**. Give its results separately from the damaged-character queue, general parser work, pronunciation transcription, and illustrations. A targeted restoration closes its reviewed fields without granting complete-entry review credit.
