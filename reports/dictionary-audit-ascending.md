# Ascending dictionary review

## Scope and progress

The repair inventory contains 4,468 entries. The character-only checkpoint repairs 1,692 spans across 974 entries. Those entries do not receive complete-entry review credit from that pass.

The remaining complete-entry queue contains 3,494 entries, ordered by JavaScript `localeCompare` from the frozen `bb2e667` source. Counts below describe this queue, not the whole dictionary.

| Stage                                                                          | Entries |
| ------------------------------------------------------------------------------ | ------: |
| Earlier pilot inspections reconciled with current source and browser output    |      24 |
| Additional entries examined, Atmiatry through Azoturia                         |       8 |
| Source, parser, browser text, and visual review closed                         |      14 |
| Examined entries with unresolved source readings or missing matching witnesses |      18 |
| Entries awaiting initial review                                                |   3,462 |

The closed entries are -ite, -yl, Algometer, Aliphatic, Amylopsin, Anaseismic, Anoetic, Anthracnose, Aplotomy, Apneumatic, Aristotype, Arm, Arnaout, and Auxometer. The pilot's earlier initial inspections are preserved. Reconciliation and post-integration verification are separate from new source review.

## Witnessed corrections

Complete-entry review restores Greek etymons without replacing coherent electronic definitions with wording from a related edition. Independent print inspection supports the pilot's source repairs. Empty tagged pronunciation fields are omitted by the shared parser, while their raw source remains available.

| Entry       | Restored field | Print witness                                                                                        |
| ----------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| Atmiatry    | ἀτμός          | [1915 printing, page 147](https://archive.org/download/bwb_O8-DDQ-914/page/n254.jpg?scale=1)         |
| Aurora      | ἠώς            | [1907 printing, page 102](https://archive.org/download/webstersinternat01webs/page/n207.jpg?scale=1) |
| Auxetophone | αὐξητός        | [1915 printing, page 158](https://archive.org/download/bwb_O8-DDQ-914/page/n267.jpg?scale=1)         |
| Auxometer   | αὔξειν         | [1915 printing, page 158](https://archive.org/download/bwb_O8-DDQ-914/page/n267.jpg?scale=1)         |

These are related print editions. Only matching fields authorize corrections. The 1915 printing's shorter etymologies, additional senses, and different definitions do not authorize replacing the electronic entry.

## Unresolved readings

The pilot retains source holds for Actinogram, Actinophone, Adipolytic, Aërodonetics, Aërodrome, Aerophone, Alalia, Anisometropia, Anisospore, Aplasia, and Appendicectomy. Alalia's Greek is restored, but its historical definition and the word "ataxis" lack a matching print witness.

Atmiatry's healing etymon, Aurora's second Greek form, Auto's Greek field, both Autophagy fields, Autotropism's Greek field, Auxetophone's voice etymon, and Azoturia's urine etymon remain unchanged. A printed suffix reference does not establish the exact missing Greek form. Auto's prefix entry is a different lexical owner from its noun and adjective entries.

## Continuation and verification

The ascending review owns the A-to-C batches. Concurrent descending review owns Wade through Xanthomelanous on `chengdu-v4/full-entry-z`. Exact claims are recorded before review, and each branch has its own index, services, and draft PR. Shared print scans remain read-only.

The next claimed ascending batches are Arthrodesis through Asterope, Bacteriolysis through Brontograph, and Brontometer through Catelectrotonus. Their unfinished work is excluded from the counts above. The next unclaimed key is Cathetometer.

The reconciled pilot has complete current browser-text and native-resolution visual checks. The Atmiatry-to-Azoturia batch has complete raw, decoded, parsed, electronic-witness, browser-text, and visual inspections, with the source gaps listed above. The integrated database contains 100,771 entries with no parse errors. Current runtime text agrees with the exported After text for all eight entries. Character-level comparison checks cover source filtering, keyboard navigation, all display modes, unchanged panes, loaded fonts, and a narrow viewport.

Temporary review storage is bounded per batch. Cleanup removes regenerable SQLite copies from inactive snapshots while preserving frozen source, code, fonts, exported entries, compact review records, and shared witnesses. The cleanup receipt records 7,732,379,648 bytes removed from 55 database copies.
