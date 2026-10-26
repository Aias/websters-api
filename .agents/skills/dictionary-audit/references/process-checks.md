# Process checks

Use the helpers in `scripts/dictionary-audit/` to check immutable inputs, retain semantic differences, and derive progress. Their results identify mechanical failures and review candidates. They do not establish a printed reading or replace entry-specific judgment.

## Packet preparation

Validate a packet before dispatch:

```sh
bun scripts/dictionary-audit/packet.ts <packet.json>
bun scripts/dictionary-audit/packet.ts <packet.json> --review
```

The exported types in `packet.ts` describe the packet JSON. Record exact ordered assigned keys, one dossier per key, and a file proof containing path, byte length, and SHA-256 for each input. Bind the applicable parsing guide and skill references through a frozen rules bundle containing their full applicable text, original paths, digests, and settled decisions. Preserve and deliver that bundle with the packet. Its file hash binds the actual supplied rules without depending on mutable live reference files.

Preparation checks the stored inputs and prepared image coverage without requiring future reviewer delivery or inspection. Review mode checks actual text delivery and image inspection receipts. Each result names its phase. A preparation-ready row has usable inputs, not completed review. The default dossier checks describe a complete-entry packet. A targeted recheck can remain held for unrelated absent dimensions while its named fields are reviewed, without receiving complete-entry credit.

For text delivery, record zero-based, end-exclusive byte windows and their hashes from actual successful results. Check gap-free coverage of complete raw, decoded, parsed, browser-text, and witness text. A prepared file does not prove delivery, and delivery does not prove inspection. Store reviewer and trace references separately for actual inspection. An electronic witness absent from an edition remains a named field hold.

For image evidence, retain the native page ID, source URL, edition, printed page, original dimensions, and source hash. The original may be JPEG or PNG. Define required native rectangles and lossless, unscaled PNG pieces with coordinates relative to that image. Verify crop pixels against the native source while preparing them and retain the generation receipt. Print evidence supplies `source: {url, edition}` and `generationReceipt: FileProof`; the helper checks the receipt's bytes, not its truth. Image dimensions and file hashes alone cannot establish pixel correspondence or identify the printed entry. Record an actual identity inspection with reviewer, trace, key, page ID, printed page, running head, and matching entry text. Use separate receipts for image delivery and inspection. Enlargements can support judgment while the native crop remains the pixel reference.

Missing entry-specific evidence produces a hold on that entry or field. A duplicate identity, stale hash, altered file, invalid crop, or inconsistent assignment stops dispatch until the input defect is resolved. A neighboring entry on the correct page is not matching evidence. Preserve defective frozen packets and issue targeted supplements instead of silently replacing inputs.

## Semantic comparison

Capture each implementation against the same frozen raw source:

```sh
bun scripts/dictionary-audit/snapshot.ts <before.jsonl> <frozen-source.jsonl>
bun scripts/dictionary-audit/snapshot.ts <after.jsonl> <frozen-source.jsonl>
bun scripts/dictionary-audit/snapshot.ts --compare <before.jsonl> <after.jsonl>
bun scripts/dictionary-audit/snapshot.ts --lookup-only <before.jsonl> <after.jsonl>
```

Run each capture from its matching source-code checkout. Preserve implementation, renderer, stylesheet, and font digests beside the snapshot. A source digest mismatch prevents a code-only attribution. The lookup-only comparison permits different source digests, reports that difference, and suppresses lexical code attribution. For source integration, compare complete lookup maps through that command or `snapshotLookup` and `compareLookup`, recording intended changed keys separately. Both comparison modes verify the actual entry counts before reporting completion.

Inspect these dimensions independently:

| Dimension                   | Review                                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Raw to preprocessed text    | Exact decoded/NFC text differences, classified against intended omissions, whitespace rules, or notation conversions |
| Preprocessed to parsed text | Ordered lexical text, word boundaries, punctuation, stress marks, and combining marks                                |
| Ownership                   | Homographs, header roles, block kinds, sense numbers, note owners, compound identities, quotation authors            |
| Lookup                      | Canonical names, aliases, runtime routes, changed destinations, and new competing claims                             |

Whitespace and placeholder labels are candidate classifications, not automatic acceptance. Bind each accepted difference to its rule, affected population, and negative cases. Retain unclassified candidates for judgment. A comparison against already-preprocessed text cannot establish that preprocessing preserved the raw content. A text-only equality cannot establish ownership. Rebuild and check the actual runtime after accepted stored changes.

Use `ownershipSignature` when a narrow text repair must leave parsed structure unchanged. Preserve structural string values such as block kinds and sense labels. Keep exact lexical text comparison separate so a legitimate spelling edit does not erase structural evidence.

## Acceptance and exceptions

Retain one acceptance record per exact edit:

- Stable edit ID, original key, frozen raw hash, exact old/new fragments, and lexical owner path.
- Source eligibility, edition/page/entry identity, native crop coordinates and hashes, and actual inspection traces.
- Original proposal and independent reading, each bound to reviewer identity, exact replacement, and certainty.
- Acceptance path, decision, and reason, including the disputed characters and evidence used to resolve them.
- Applied fragment and resulting raw hash, or the unchanged held fragment.

Validate the complete decision partition before applying it:

```sh
bun scripts/dictionary-audit/decisions.ts <frozen-edits.json> <decisions.json>
```

The exported `FrozenEdit` and `Decision` types describe these files. Each frozen edit binds the full original raw HTML file for its key and a unique old fragment. Accepted decisions require supported source eligibility, verified evidence files, and two distinct certain native readings tied to the exact proposed fragment hash. The validator keeps independent agreement, source adjudication, holds, and reversals separate. For adjudication, the adjudicator differs from the fresh confirming readers. A convention-only basis cannot pass. This checks the records and their file proofs, leaving source correctness and inspection honesty to the reviewers.

For **independent agreement**, distinct source readers confirm the same eligible replacement from actually inspected native evidence. Normalize only explicitly equivalent encoding, such as NFC. Keep punctuation boundaries explicit rather than silently stripping them.

For **source adjudication**, retain the original disagreement or validator failure. Read the relevant native region, define the exact adjusted replacement, and obtain a fresh independent confirmation of the disputed characters and owner. Replay mechanical eligibility, uniqueness, structural, and hash checks on the adjusted edit. A ruling never substitutes for these checks. Mark this path separately from initial agreement.

For **mask-boundary disagreement**, inspect the full source fragment and print context. Prove which punctuation lies inside the replacement and which remains outside it, then independently verify the resulting exact fragment. A conventional spelling, neighboring word, or unreadable mark supplies no missing pixel evidence. Hold the affected characters when the source cannot settle them.

For a recheck, freeze the exception inventory and retained evidence before judgment. Give fresh readers answer-free context where practical, keeping proposed readings and prior rationales separate. Reconcile every exception as retained, corrected, reversed, or unresolved. Reverse an unsupported applied edit only through an exact guarded fragment or a replay of its frozen per-key manifest, preserving all other accepted edits. The exception recheck grants no new complete-entry coverage.

## Resumable progress and admission

Use `deriveProgress` from `packet.ts` to derive counts and the first unstarted key within the supplied frozen ordered keys and unique per-entry records. This is not a next-unclaimed cursor. Select the ascending or descending unclaimed range separately against the shared claims and preserve its exact review order. Bind source and complete-review credit to the actual source and implementation hashes. Glyph-only credit remains separate. Keep the detailed source, parser, browser-text, visual, field-hold, and issue records with their evidence rather than reducing them to a single completion boolean.

Retain completed dimensions across resumptions. Reopen a dimension when its relevant raw, parsed, rendered, CSS, font, or implementation hash changes. A held etymological accent does not require another reading of an unchanged definition. Generate prose reports and continuation cursors from the authoritative records, then reconcile claims and actual source before dispatch.

Choose packet size from a representative measured workload. Use source/witness bytes, rendered height, print columns, and field difficulty to separate unusually long entries. Reserve provider slots and usage for independent reading and integration. Stop new discovery admissions when ready verification accumulates or active work cannot be closed within the available budget. Save per-entry results, allowing interrupted workers to resume without repeating completed judgment.

Measure completed review dimensions, accepted witnessed repairs, false acceptances, and unresolved work alongside tokens and elapsed run. Keep discovery and verification measurements separate. A reduced candidate-only pass retains its own coverage label and does not silently replace an exhaustive audit.

## Shared findings and retained evidence

Keep the structural issue queue in `reports/dictionary-structural-issues.jsonl`, with raw span, parsed owner path, witnessed expected ownership or a named evidence gap, and reproduction. Reproduce an older observation against current source before acting on it. Narrow validators route rejected structural edits to the integrator. Group recurring conversion defects for a witnessed pure transform and frozen dry-run. Share rule decisions with active and finished reviewers before integration.

Reuse validated comparison exports and viewers while their input digests match. Preserve source manifests, witness locators, native evidence for unresolved readings, decision records, and regeneration inputs. After checking active service ownership, remove only inactive reproducible databases or captures and record actual deletion receipts. Shared native scans and active packets remain read-only. Final runtime and affected-entry verification remain required.
