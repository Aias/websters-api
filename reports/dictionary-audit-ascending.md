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

The pilot's closed entries are -ite, -yl, Algometer, Aliphatic, Amylopsin, Anaseismic, Anoetic, Anthracnose, Aplotomy, Apneumatic, Aristotype, Arm, and Arnaout. Additional closed entries are Auxometer, Arthrodesis, Arthrospore, Ascariasis, Bacteriolysis, Baresthesiometer, Barothermograph, Blepharitis, Brontograph, Brontometer, Cachemia, Cacostomia, Capsulotomy, Cataclasm, and Catelectrotonus. The pilot's earlier initial inspections are preserved. Reconciliation and post-integration verification are separate from new source review.

## Witnessed corrections

Complete-entry review restores Greek etymons without replacing coherent electronic definitions with wording from a related edition. Independent print inspection supports the pilot's source repairs. Empty tagged pronunciation fields are omitted by the shared parser, while their raw source remains available.

| Entry       | Restored field | Print witness                                                                                        |
| ----------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| Atmiatry    | ἀτμός          | [1915 printing, page 147](https://archive.org/download/bwb_O8-DDQ-914/page/n254.jpg?scale=1)         |
| Aurora      | ἠώς            | [1907 printing, page 102](https://archive.org/download/webstersinternat01webs/page/n207.jpg?scale=1) |
| Auxetophone | αὐξητός        | [1915 printing, page 158](https://archive.org/download/bwb_O8-DDQ-914/page/n267.jpg?scale=1)         |
| Auxometer   | αὔξειν         | [1915 printing, page 158](https://archive.org/download/bwb_O8-DDQ-914/page/n267.jpg?scale=1)         |

The additional print-backed repairs include:

| Entry                                | Restored fields                                     | Print witness                                                                                                                                                                           |
| ------------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arthrodesis                          | ἄρθρον, δέσις                                       | [Own entry and arthro-](https://archive.org/download/bwb_O8-DDQ-914/page/n237.jpg?scale=1)                                                                                              |
| Arthropathy, Arthrospore, Arthrotome | ἄρθρον                                              | [Arthro-](https://archive.org/download/bwb_O8-DDQ-914/page/n237.jpg?scale=1), [Arthrotome](https://archive.org/download/bwb_O8-DDQ-914/page/n238.jpg?scale=1)                           |
| Ascariasis                           | ἀσκαρίς                                             | [Own entry and Ascaris](https://archive.org/download/bwb_O8-DDQ-914/page/n240.jpg?scale=1)                                                                                              |
| Bacteriolysis                        | λύσις                                               | [Own entry](https://archive.org/download/bwb_O8-DDQ-914/page/n277.jpg?scale=1), [-lysis](https://archive.org/download/bwb_O8-DDQ-914/page/n1410.jpg?scale=1)                            |
| Baresthesiometer                     | βάρος                                               | [Own entry](https://archive.org/download/bwb_O8-DDQ-914/page/n290.jpg?scale=1)                                                                                                          |
| Barothermograph                      | βάρος                                               | [Own entry](https://archive.org/download/bwb_O8-DDQ-914/page/n294.jpg?scale=1), [baro-](https://archive.org/download/bwb_O8-DDQ-914/page/n293.jpg?scale=1)                              |
| Blepharitis                          | βλέφαρον; -ilis to -itis                            | [Own entry and blepharo-](https://archive.org/download/bwb_O8-DDQ-914/page/n346.jpg?scale=1)                                                                                            |
| Bromatology                          | βρῶμα, βρώματος                                     | [Own entry](https://archive.org/download/webstersinternat01webs/page/n289.jpg?scale=1)                                                                                                  |
| Brontograph, Brontometer             | βροντή                                              | [Own entries and bronto-](https://archive.org/download/bwb_O8-DDQ-914/page/n390.jpg?scale=1)                                                                                            |
| Brontozoum                           | βροντή, ζῷον                                        | [Own entry](https://archive.org/download/webstersinternat01webs/page/n289.jpg?scale=1)                                                                                                  |
| Buprestidan                          | βούπρηστις; existing damaged pronunciation restored | [Own entry](https://archive.org/download/webstersinternat01webs/page/n297.jpg?scale=1), [pronunciation guide](https://archive.org/download/webstersinternat01webs/page/n62.jpg?scale=1) |
| Cachemia                             | αἷμα                                                | [Own entry](https://archive.org/download/bwb_O8-DDQ-914/page/n413.jpg?scale=1), [-hæmia](https://archive.org/download/bwb_O8-DDQ-914/page/n138.jpg?scale=1)                             |
| Cacostomia                           | στόμα                                               | [Own entry](https://archive.org/download/bwb_O8-DDQ-914/page/n413.jpg?scale=1), [-stoma and -stome](https://archive.org/download/bwb_O8-DDQ-914/page/n2188.jpg?scale=1)                 |
| Capsulotomy                          | τέμνειν                                             | [Own entry](https://archive.org/download/bwb_O8-DDQ-914/page/n436.jpg?scale=1), [-tomy](https://archive.org/download/bwb_O8-DDQ-914/page/n2307.jpg?scale=1)                             |
| Cataclasm                            | κατάκλασμα, κατά, κλᾶν                              | [Own entry](https://archive.org/download/bwb_O8-DDQ-914/page/n453.jpg?scale=1)                                                                                                          |
| Catelectrotonus                      | ἤλεκτρον                                            | [Own entry](https://archive.org/download/webstersinternat01webs/page/n332.jpg?scale=1)                                                                                                  |

An explicit component reference supports a restoration only when the entry names that component and the inspected component article supplies the exact missing Greek form and gloss. Pronunciation recovery also requires an existing unreadable electronic field and the matching printed owner. Buprestidan's recovered field preserves the u uptack, vowel breves, primary stress, and reduced italic a.

These are related print editions. Only matching fields authorize corrections. The 1915 printing's shorter etymologies, additional senses, and different definitions do not authorize replacing the electronic entry.

## Unresolved readings

The pilot retains source holds for Actinogram, Actinophone, Adipolytic, Aërodonetics, Aërodrome, Aerophone, Alalia, Anisometropia, Anisospore, Aplasia, and Appendicectomy. Alalia's Greek is restored, but its historical definition and the word "ataxis" lack a matching print witness.

Atmiatry's healing etymon, Aurora's second Greek form, Auto's Greek field, both Autophagy fields, Autotropism's Greek field, Auxetophone's voice etymon, and Azoturia's urine etymon remain unchanged. A printed suffix reference does not establish the exact missing Greek form. Auto's prefix entry is a different lexical owner from its noun and adjective entries.

Additional holds remain for Arthropathy, Arthrotome, Ascomycetes, Assets, and Asterope. Assets' exact Greek breathing is unclear. Asterope's related print entry does not supply the original two-sense text. Basidiomycota has no matching native owner. Breve's historical and modern musical graphics remain unresolved. Bromatology's eligible unreadable pronunciation and Brontozoum's pronunciation stress remain open. Brontozoum and Buprestidan have print illustrations absent from both electronic witnesses, with insufficient evidence to classify them as conversion omissions or edition differences.

## Continuation and verification

The ascending review owns the A-to-C batches. Concurrent descending review owns separate T-to-X claims on `chengdu-v4/full-entry-z`. Exact keys are recorded before review, and each branch has its own index and services. The ascending changes are published in draft PR #26 (Restore dictionary characters from print and continue entry reviews). Shared print scans remain read-only.

The next claimed ascending batches are Celiac through Chromophotograph, Chronological through Coolie, and Coprophagous through Crenelate. Their unfinished work is excluded from the counts above. The next unclaimed key is Criterion, derived from the frozen key sequence.

Every counted inspection includes the complete raw entry, decoded text, parsed model, available electronic witnesses, actual browser text, and full native-width rendered images. Printed owners and explicit component references were read individually. Full intervening print columns were not reviewed, so these counts do not establish an exhaustive review of the surrounding alphabetic ranges.

The integrated database contains 100,771 entries with no parse errors. Current runtime text agrees with exported After text for the 32 additional entries. The pilot has separate current browser-text and visual verification. Character-level comparison checks cover source filtering, keyboard navigation, all display modes, unchanged panes where present, loaded fonts, and narrow viewports. Each accepted source change has an original-value hash guard and independent native-witness judgment.

Temporary review storage is bounded per batch. Cleanup removes regenerable SQLite copies from inactive snapshots while preserving frozen source, code, fonts, exported entries, compact review records, and shared witnesses. The cleanup receipt records 7,732,379,648 bytes removed from 55 database copies.
