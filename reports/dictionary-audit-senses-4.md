# Senses-4 print-source reconciliation

All 58 candidates remaining from the senses-3 pool have source-review outcomes. The batch restores 52 complete sense units and confirms six unchanged units. It also accepts 38 pronunciation targets and 21 accompanying repairs. Dolphin retains a parser ownership hold. No complete-entry review credit is claimed.

The source starts at `1da044a` (Record print-source reconciliation inventory), SHA-256 `19ec7e5841c63fd98c77956757e68fca490c37784d8fe2366745634f5fc8d7fd`. The final source SHA-256 is `7c2a9d6dc9b06b64a99cd1252c9edd526cabc9229cad6645c346249f5669a2c0`. All 100,803 keys remain, with changes confined to the 58 selected keys.

## Decisions

The [exact ledger](dictionary-audit-senses-4.jsonl) contains 111 accepted printed edits, six unchanged rulings, and two separate lookup metadata annotations. The [checkpoint](dictionary-audit-senses-4-checkpoint.json) preserves counts, input hashes, checks, and the final source identity.

| Decision                                                | Targets |
| ------------------------------------------------------- | ------: |
| Independent agreement                                   |      93 |
| Source adjudication with fresh independent confirmation |      18 |
| Unchanged after print review                            |       6 |
| Lookup metadata, without native-reading credit          |       2 |

Primary review covers 92 targets in 20 packets of at most three keys. Of these, 86 are accepted: 74 independent agreements and 12 adjudications. Final review adds 25 accepted supplemental targets: 19 independent agreements and six adjudications. There are no remaining transcription holds or post-integration reversals in this batch. Preliminary disagreements and superseded candidates remain in the acceptance evidence.

Malignant, Fin, Magnitude, Pace, Spindle, and Vigil retain their original targeted sense units after comparison with the print. Their accompanying fields can still contain accepted repairs. The [workset outcomes](dictionary-print-workset-outcomes.jsonl) preserve this distinction and link each key to its target IDs. The original inventory and its source hashes remain frozen.

The 21 accompanying repairs comprise 11 etymology targets, three compound targets, and one each for punctuation, typography, a scientific name, a sense-reference dependency, a quotation, structural scope, and attribution. Accepted structural scope places Humble's synonym paragraph at homograph level. Gape's corresponding scope correction forms part of its adjudicated complete-sense restoration.

Electricity preserves the printed shared heading "Frictional, or Common, electricity". Two existing `data-headword` annotations retain the full compound names for lookup. They have separate metadata records and add no print-reading credit. The visible text is unchanged by those annotations.

## Remaining issue

Dolphin's note about _Delphinus delphis_ follows sense 1(b) in the print and refers to the dolphin in 1(a). Its lexical restoration and printed order pass. The current parser attaches it to 1(b), and its existing scope annotations cannot select an earlier nested sense. The separate later synonyms correctly belong to 1(b).

The [open-holds register](dictionary-audit-holds.jsonl) and [structural issue register](dictionary-structural-issues.jsonl) preserve the exact note, parsed owner, intended owner, source hash, and annotation question. The open register has 155 fields: 88 evidence, 65 reading, and two structure holds.

## Verification

- Independent final native-page and rendered-output reviews cover all 58 keys, with separate checks for supplemental changes.
- Full-corpus replay reproduces the final serialized source from the frozen source, 111 accepted edits, and two metadata annotations. No other keys change.
- Semantic checks conserve 2,754 ordered lexical parts and 390 sense labels, with Dolphin's ownership exception recorded explicitly.
- Canonical lookup destinations remain unchanged. No new ambiguous aliases remain. The two removed aliases are the corrected typo "apidose fin" and the later "dickie" spelling removed with its rewritten printed unit. "Adipose fin" still resolves to Adipose.
- The later-additions register retires 35 replaced spans, retains 32 unchanged rows, relocates two pointers, and clears three unresolved pointers. All 6,733 non-null pointers pass the canonical registry check. The register contains 14,184 rows across 11,416 keys.
- All 355 repository tests, `bun check`, and the production build pass. The database builds all 100,803 records without parsing errors.
- All 58 rebuilt database entries match the final parsed candidates. All 58 lookup responses match their expected keys and slugs. Browser checks cover Clinic, Dolphin, Electricity, and both restored Electricity aliases.
- The comparison passes text, typography, dimming, and glyph-position checks across all 116 panes at desktop and 390px widths. Selection, filtering, hash navigation, keyboard controls, Text, and JSON modes pass.

The comparison viewer uses inline neutral spans and expands rendered highlights to word boundaries where character cuts would reshape a glyph. Text and JSON differences remain character exact. This corrects a scratch-viewer layout defect without changing application code or dictionary text.

Local evidence remains under `.context/dictionary-audit/`. The comparison is served at [localhost:56522](http://127.0.0.1:56522/). Final screenshots include `senses-4-runtime/comparison-final-word-desktop.png`, `senses-4-runtime/comparison-final-word-narrow.png`, and `senses-4-runtime/entry-dolphin.png`. Native reviews are under `exhaustive/senses-4/after-ss01` through `after-ss20` and `final-supplement-a` through `final-supplement-c`. Final semantic, lookup, registry, and runtime receipts are bound in the tracked checkpoint.

## Continuation

The bounded 58-key sense pool has no unreviewed candidates. Dolphin's parser issue remains open. The next independent source pool is the 124 unresolved own-record compound dispositions, including Bold eagle's acceptance-evidence question. Three missing supplement records and Lizard fish retain their existing evidence holds. The 497 priority classification reviews and broader complete-unit reconciliation remain separate worksets.

This batch uses 20 primary packets with at most three keys and rolling independent review, adjudication, and validation. Definition-5 used five larger primary packets for 48 targets across 30 keys and required nine primary adjudications. Senses-4 has 92 primary targets across 58 keys and 12 primary adjudications. Those populations differ, and reader token telemetry is unavailable, so no cost or throughput advantage is claimed. Weekly allowance moved from 41% used at admission to 94% during final validation. New packet admission stopped at the configured 90% threshold to reserve capacity for validation, reporting, and the committed checkpoint.
