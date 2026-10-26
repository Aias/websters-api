# Adjudicated dictionary edit review

## Scope and result

The review covers the forty adjudicated edits in descending batches z01 through z07. The frozen inventory matches the applied source at revision `75a417e`. It includes eleven edits without a retained original blind-reader response. Fresh native-image readings supply the recheck evidence.

| Result                                                                       | Edits |
| ---------------------------------------------------------------------------- | ----: |
| Retained through independent exact-fragment agreement                        |    19 |
| Retained through source adjudication with fresh independent confirmations    |     3 |
| Reversed and held for unresolved Greek diacritics                            |     9 |
| Reversed and held for unsupported edition-based expansions or casing changes |     8 |
| Reversed and held for unsupported quotation punctuation                      |     1 |
| Total                                                                        |    40 |

The eighteen reversals affect sixteen entries. All other source records remain byte-identical. Other accepted repairs within those sixteen entries remain intact. This targeted recheck grants no complete-entry coverage and does not advance the ascending or descending audit cursor.

The [per-edit record](dictionary-audit-exception-recheck.jsonl) preserves stable IDs, exact original and applied fragments, source guards, decisions, native page URLs, crop coordinates, image digests, and confirming-reader identities. Local frozen inputs, original readings, source eligibility decisions, application proof, and runtime receipts are under `.context/dictionary-audit/exception-recheck/`.

## Source decisions

### Unresolved Greek marks

Worm, Uraniscorrhaphy, Urrhodin, Triadelphous, Trioecious, Thyine wood, Thysanura, Tichorrhine, and Tarsorrhaphy retain their original unreadable fields. The available pixels do not establish two certain independent readings of every restored diacritic. Letter recognition and conventional Greek spelling cannot resolve that source uncertainty.

Triadelphous and Thysanura each have a source-certain reading from one fresh reader, with uncertainty from the other readers. Temple has two fresh source-certain readings from the correct noun etymology and retains its restoration. Thereon retains the independently confirmed eth and macron-bearing ae ligature. To retains `strandes` after native reinspection resolves the final letters. Original incomplete observations remain preserved beside the subsequent exact-fragment judgments.

### Related-edition differences

The following applied edits return to their frozen electronic wording:

| Entry | Returned source                                                                      |
| ----- | ------------------------------------------------------------------------------------ |
| With  | The quotation without the added `sell with you` clause                               |
| Withy | The original damaged Icelandic field, without the expanded list of forms and gloss   |
| Un-   | The shorter etymological list and the lowercase `unbaptized`/`unbarbered` references |
| Thrum | The example without the inserted `as,`                                               |
| To    | The example without the additional explanatory clause                                |
| That  | The inherited `th'tother` contraction                                                |
| Undo  | The inherited comma before the quotation attribution                                 |

The related 1895 print supplies legible alternatives. Matching GCIDE passages preserve coherent electronic wording, without enough evidence to establish those differences as conversion damage. Withy's damaged token also does not authorize importing a broader list of forms. These fields remain held for stronger matching evidence.

### Retained repairs

The retained edits repair damaged characters, demonstrable transcription defects, or source ownership. They include Wanty's damaged letter, Which's macron-bearing vowel, Winter's transitive grammatical label, Tyrannicalness's missing noun label, and the separation of Shakespeare's and Dryden's quotations under To. Tarragon preserves the electronic full species name while repairing its genus spelling against the explicit native genus and matching taxon identity.

To- retains its restored pronunciation alternatives because GCIDE already contains that owner's composite unreadable pronunciation/reference field. It is distinct from an absent pronunciation or bare unknown placeholder.

## Process and executable checks

The [audit skill](../.agents/skills/dictionary-audit/SKILL.md) and [process checks](../.agents/skills/dictionary-audit/references/process-checks.md) describe packet preparation, acceptance, integration, resumable state, and bounded admissions.

The [structural issue queue](dictionary-structural-issues.jsonl) preserves the separately reported Ugsome, Un-, and Systematical findings. These retain their own source-verification obligations and receive no coverage from the exception recheck.

- `packet.ts` checks frozen file proofs, exact assignments, native JPEG/PNG dimensions, prepared PNG crop coverage, entry-identity receipts, and separate delivery/inspection obligations. Progress derives from hash-bound per-entry records. Missing witnesses remain entry-specific holds.
- `conservation.ts` and `snapshot.ts` retain exact decoded text, block ownership, and lookup destinations. Raw-to-preprocessed changes remain separate from parsed-content changes. Lookup-only comparisons support source integration with explicit source-change reporting.
- `decisions.ts` checks the entire frozen decision partition, unique fragments, eligibility evidence, exact replacement hashes, distinct certain native readers, and separate adjudication outcomes.
- The quick-wins validator uses the ownership signature while retaining its existing span and container checks.

These helpers verify mechanical evidence and record consistency. Printed identity, crop-pixel correspondence, source correctness, and honest inspection still require the recorded preparation and reviewer judgments.

## Verification

The decision validator partitions all forty edits into nineteen independent agreements, three source adjudications, and eighteen reversals. Every reversal passes its current whole-entry hash and unique-fragment guards before the canonical source writer runs.

Complete canonical, alias, and runtime-route comparisons show no lookup destination changes or new competing exact alias claims. Source entry count remains 100,771. The existing Tropical year ambiguity remains outside this recheck.

Actual browser article text agrees with the current parser and EntryView output for all thirty-five distinct entries in the exception inventory, with fonts loaded. The targeted visual check preserves unresolved fields explicitly. This verifies the affected source through the rebuilt runtime without claiming another exhaustive visual review of the entries.

`bun test` passes all 327 tests. `bun check`, `bun run build`, and the skill validator pass. The helpers also pass a full-corpus snapshot self-comparison and bounded forward tests covering absent witnesses, stale review hashes, disputed accents, and real native JPEG/PNG evidence.

Source digests:

```text
Before: 4790b6c6e1a01e84d1b3e3258f0181cd43c1a4f318c6e48b6f25318fa5544381
After:  6224e6fdb56843fcae4f1f5ccbc923dd63c22ce7cf05285bc781ca84607c3cd4
```
