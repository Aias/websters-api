# Batch review

## Freeze a reproducible selection

Read current repository instructions and git state. In Conductor, use `/conductor` to confirm the workspace and target branch. Fetch the target before a branch comparison. Do not assume a prior branch, port, database, or PR is still current.

`src/dict.jsonl` stores one `{key, html}` record per line. Use `readDictionarySource`, `serializeDictionarySource`, and `writeDictionarySource` from `scripts/dictionary-source.ts` so reads reject duplicate keys and writes preserve canonical key order and the final newline. Read selected values or bounded diffs instead of printing the corpus. For a code-only diff, exclude the actual source path and inspect source changes by key separately. When reading a historical baseline, use that revision's source format and loader.

When continuing an audit, use the preceding report's next key and frozen sequence. The established ascending review order uses `[...source.keys()].sort((a, b) => a.localeCompare(b))`, which differs from the source file's canonical key order. Retain the existing review sequence for a continuation and record the ordering for a new one. Select by key before assigning display indices. Recovered entries belong in the evidence and viewer even when they were absent from the original count. Do not use file line numbers as review positions or skip records because an insertion shifted indices. An audit from the end of the alphabet selects the last N keys of the same ascending sort, and its next batch is the N keys that end just before the current first key.

Before edits, save:

| File or directory | Contents                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `plan.json`       | Baseline revision, source digest, ordered keys, direction, requested count, first and last keys, next key, and range ownership |
| `entries.json`    | Frozen `{index, key, raw}` records                                                                                             |
| `baseline.json`   | Actual `parseEntry` output and `EntryView` server-rendered HTML for each record                                                |
| `before/`         | Relevant source, parser, renderer, CSS, font, and asset snapshot                                                               |
| `review-<range>/` | Reviewer ledgers, witness extracts, browser text, screenshots, and proposed patches                                            |

Use an isolated snapshot of the baseline implementation for exports, pairing its parser with its source. Check import paths so baseline helpers do not accidentally load current code. If the baseline includes uncommitted work, capture those files and digests explicitly because a commit ID alone cannot reproduce them.

Place batch evidence beneath `.context/dictionary-audit/exhaustive/<batch>/` and shared downloaded witnesses beneath `.context/dictionary-audit/reference/`. These are scratch conventions, not durable repository files. Keep the requested progress report available for the next session. Recover missing evidence from the original sources rather than treating an absent scratch directory as a blocker.

## Prepare the browser before bulk capture

Export through the real `parseEntry` and `EntryView`. A static full-entry page is useful because the application scrolls its entry within `main`. Use the app's CSS, font faces, width, padding, and antialiasing. Verify the first capture and a long or notation-heavy entry before capturing the batch. See [Rendered comparison](rendered-comparison.md) for the browser checks.

Use named isolated browser sessions. Run task-owned servers under workspace-scoped PM2 names, following the repository's process rules. Keep one service owner so reviewers cannot restart a server during another reviewer's capture. Give reviewers the observed URLs and process boundaries, not guessed ports.

## Build witness dossiers before delegating

Extract each selected entry's witnesses once, so every reviewer starts from the same evidence:

- **GCIDE:** each `<p><ent>` paragraph through the next `<ent>`, matched by a folded key (NFKD without combining marks, æ to ae, œ to oe, lowercase). Keep each paragraph's `[<source>…]` tag. "1913 Webster" is the base text, "Webster 1913 Suppl." is the supplement, and other tags are later contributor additions.
- **Gutenberg:** the paragraphs from the entry's headword paragraph up to the next different headword. A headword paragraph starts with the stress-marked form, an optional parenthesized pronunciation, a comma, and an abbreviated part of speech. Stop at the `=====` divider before the 1913 supplement. Run-in derivatives and supplement-only entries can lack a block, so search the file directly for those.
- **Print:** the leaf found from the page's running heads, plus full-resolution crops of each column in three overlapping parts. Crops about 750 px wide keep the small type legible after image downscaling.

Verify each packet’s printed page number, running head, and actual entry text against its image before assignment. OCR page indices and image-endpoint leaf numbers can diverge when one sequence includes duplicate scans. Reanchor the mapping after such a discontinuity and preserve frozen incorrect inputs when issuing targeted supplements.

Write one dossier per entry. Each holds the raw HTML, parsed model, rendered HTML, witness extracts with file positions, print leaf range, and crop paths. Report how many entries lack each witness.

Check public-network access before assigning downloads to a headless worker. When its sandbox has no network, use an authorized downloader and give reviewers immutable local files with verified hashes and dimensions.

## Divide independent review work

Distribute disjoint ranges according to text volume and complexity as well as entry count. Balancing by the combined length of raw HTML and GCIDE text, ranges of roughly 75 to 170 entries fit one reviewer. Each reviewer receives the frozen records, dossiers, baseline exports, the print leaves covering its range, working browser URLs, evidence requirements, and a private scratch directory. Require completion of the assigned range rather than an early sample.

Choose models and reasoning effort from measured quality and latency on the same frozen representative packets. Compare usable witnessed repairs, unsupported changes, preserved content, actual model/effort, and end-to-end time. A fast failed review is not a throughput improvement. Keep proposal workers, mechanical validators, and fresh source judges independent, and increase concurrency at the measured bottleneck. Benchmark results and active packets remain immutable when instructions improve. For headless runs, retain the executable/version, resolved effort, frozen inputs, usage, and full successful tool trace. A compact event stream may omit image-tool events, so validate the underlying trace rather than treating an absent event as a failed image or an inspection claim as proof. Disable automatic restart for finite batch jobs unless their restart behavior is explicitly safe.

Distinguish noticing a defect from supplying a usable exact correction. Measure incorrect accepted corrections separately from missed defects, including a wrong repair to an already defective field. When the user prioritizes avoiding false corrections over recall, reuse existing proposal reviews and give cheaper reviewers only the proposed edits with their exact owners and witnesses. Allow accept, reject, or uncertain without requesting new discoveries. Retain unchanged-entry evidence without automatically repeating strong-model review. Reserve strong judgment for selected difficult candidates and defer the rest.

Test candidate verification against withheld, independently established gold containing correct proposals, wrong proposals, and unchanged controls. Register both the false-acceptance limit and a useful correct-acceptance threshold before the run. A reviewer that rejects everything has not demonstrated useful throughput. Preserve original outputs and report limited samples honestly rather than interpreting zero observed errors as a guarantee.

Qualify verification by role and field. Success on ordinary prose does not qualify pronunciation, stress, Greek, entry identity, or structural numbering. Give the verifier the exact proposed change and source context, keeping the proposal worker's rationale separate from witness evidence.

Identical tag sequences do not prove preserved text ownership. A repair that moves words across a markup boundary needs structural review, even when it also fixes an ordinary spelling error.

Keep each accepted replacement minimal. A definite typo does not authorize an adjacent optional article, historical spelling change, or punctuation normalization bundled into the same proposal. Split the proposal only with separately bound evidence, or hold it intact.

For latency benchmarks, retain cached and uncached input separately. Lossless initial image attachments can remove image-tool round trips, but require actual native-pixel receipts from the saved initial message. Establish glyph gold by direct independent inspection, not agreement between models. Treat a narrow packet or one run per effort as limited evidence.

For a fresh batch controller, verify output-directory creation, interpreter dependencies, and one actual request before bulk dispatch. Halt on a runner failure with no output rather than draining the queue. Replay a failed invocation only after proving whether a model call occurred, preserving its original logs and any session evidence.

Check structured-output schema support through the provider, not only a local JSON Schema validator. A provider can reject an otherwise valid keyword before starting the model. Preserve that failure, version the corrected schema, and prove actual initial delivery before bulk admission. Enforce exact ordered identities in post-validation when the provider schema cannot express them.

Bound text chunks by the reading tool's actual output limit, not entry count alone. A long entry may need separate raw, parsed, and witness sections. Share page-level font metadata once rather than repeating it throughout every entry. Keep model output compact with stable evidence identifiers and exact edits, then enrich guarded manifests from frozen input mechanically. Compute hashes from immutable inputs and verify their actual delivery rather than asking the model to reproduce hash strings.

Constrain each packet's structured output to its exact entry count and assigned identities. A schema-valid partial ledger is still incomplete. Independently check unique key/index pairs and every review dimension. When only row order differs, preserve the original answer and canonicalize a derived ledger against the frozen sequence rather than repeating the review.

Separate model execution from coverage closure. Quarantine entry-specific source gaps and unproved proposals without crediting them as complete. Unrelated primary jobs can continue after transport, schema, input integrity, and exact identities pass. Require actual raw, decoded, parsed, browser-text, and rendered-image evidence before admitting a packet to independent SOURCE review. Missing print remains a source-only obligation, never a successful print read. Halt dispatch for systemic runner or integrity failures.

Apply missing-witness and uncertain-owner holds to the exact entry or field rather than blocking unrelated rows in its packet. Permit honest incomplete outcomes without requiring a claimed print read. An accepted edit or restored field needs actual matching native evidence bound to its entry's leaf or guarded owner, not merely an image from a nearby entry. A matching leaf is a location check, not proof of a correct reading. Reconcile aggregate state counts against authoritative per-job evidence before repeating work.

Probe both total-result and per-line limits. A successful text read can still be clipped. Use byte-bounded, gap-free read windows and verify returned line coverage. Split long source strings losslessly rather than truncating them. Initial inline delivery can remove text-tool round trips, but requires exact persisted request-payload proof and a matched quality benchmark before adoption. Keep inline receipts distinct from successful tool reads.

Start independent source judgment when each packet passes mechanical validation. Use a rolling queue for independent jobs rather than waiting for an entire wave when completed slots could accept ready work. Prepare later packets concurrently, then verify integrated output as it stabilizes. Keep the final source and implementation equality checks before declaring the batch complete.

Share provider concurrency across primary and visual controllers. Count actual model processes and reserved runners from every active batch, deduplicated by working directory. Use one dispatch owner or explicit phase gates to prevent two controllers from taking the same free capacity. Qualify higher concurrency with disjoint bounded cohorts, preserve active jobs, and close new admissions on provider failures. Report latency and completed work without claiming a controlled speed comparison from different packets.

Some agent harnesses block subagents from writing report files. Ask reviewers to put the full report in their final message, and save it from there.

Reviewers may prepare repairs in their own files or isolated worktrees. With a shared checkout, return manifests instead of having several agents rewrite the single dictionary file. The integrator owns shared parser, renderer, and lookup edits. Reviewers report those defects early with source classes and a minimal reproduction.

An audit from the opposite end of the alphabet can proceed independently. Compare exact claimed keys before integration and preserve concurrent work, even when both changes touch `src/dict.jsonl`. A clean tree observed earlier is not evidence of current ownership.

## Record actual per-entry coverage

For every selected entry:

1. Read the complete raw HTML and decoded text, including neighboring source context when a boundary is suspect.
2. Read the complete parsed model. Check parentage and source order, not just the first definition.
3. Read actual browser text and inspect the entire rendered entry at legible resolution.
4. Compare with the matching electronic witnesses. Use a printed page or another primary witness for ambiguous omissions, glyphs, stress, attribution, or layout.
5. Record specific findings, justified retention, or unresolved readings, with the evidence inspected.

A useful ledger records `index`, original and current key, the completed review dimensions, an entry-specific assessment, inspected image paths, browser-text digest, loaded-font evidence, witness references, and proposed corrections. Keep pending work distinguishable from completed review. Generating screenshots or text files does not count as reading them.

Unscaled contact sheets are acceptable if every entry remains legible and the reviewer opens every sheet. Record the exact indices inspected when a sheet overlaps two assignments. Do not downscale long entries to fit a single screen or assume a full-page app screenshot includes an internal scroll region.

To reduce image-tool calls, pack consecutive native-width entry segments into bounded-height sheets. Preserve every source pixel, record each placement and entry identity, and verify each placed region against the original image. Keep individual segments available for closer inspection.

Scrolling captures may overlap. Record their source offsets and trim repeated rows when assembling new sheets, with gap-free pixel coverage. Preserve frozen originals. Confirm apparent seam duplication against raw source, parsed content, browser text, and an independent viewport before treating it as a product defect.

Before integration, assert unique, gap-free coverage of the frozen keys and reconcile reviewer boundaries. Count restored entries separately from the original requested batch.

Validate successful tool results against the frozen file hashes, returned text-line intervals, and native image dimensions. A requested read, an oversized failed result, or a worker's claim is not read evidence. Fill gaps with targeted supplemental review attributed to its actual reviewer, preserving the original incomplete ledger. Reuse byte-identical overlapping images by digest without claiming an unopened image was inspected.

Check image-tool size limits on guides and diagrams as well as entry captures. A successful read may return a resized image. Split oversized originals into overlapping unscaled crops, verify complete pixel coverage, and require actual reads of those crops. Preserve the resized receipt and attribute any supplemental review separately.

When older image results acquire a `[media removed: request limit]` placeholder, distinguish later context removal from an originally failed read. Do not reopen an image already actually inspected solely because that placeholder appears. Reopen unresolved glyphs or images whose original delivery or inspection is incomplete. Delivery receipts alone never establish inspection. Keep prompts and original review traces immutable when adding this guidance to future invocations.

## Apply guarded source patches

Use a patch manifest with these fields:

| Field       | Meaning                                                                |
| ----------- | ---------------------------------------------------------------------- |
| `key`       | Original dictionary key                                                |
| `oldSha256` | SHA-256 of the entire original raw string encoded as UTF-8             |
| `newRaw`    | Complete replacement string with only the witnessed corrections        |
| `reason`    | The defect and intended lexical result                                 |
| `evidence`  | Source URLs, edition/page identification, and local excerpts or images |

Track additions and key renames separately. Check destination collisions before renaming and retain the original review identity for paired comparisons. A restored neighboring entry may require moving a stranded quotation or author out of the preceding record. Account for both sides of that move.

Merge reviewer manifests into one combined manifest keyed by original key, and reject a key patched twice. Apply integrator adjustments as exact find-and-replace edits on the reviewer's result, each with its own reason and evidence.

After adjudicating a validation discrepancy, regenerate derived manifests and coverage from the original answers and frozen values. Independently replay every accepted, adjusted, rejected, and additional edit, then reconcile the complete edit partition. Changing a validation status alone can leave an accepted repair absent from the manifest.

Review every patch, then validate all guards before writing. On a mismatch, read the concurrent change and reconcile it instead of overwriting or merely updating the expected hash. If a patch receives a supplement, retain the baseline hash in the final manifest and guard the supplement against the intermediate value too.

Preserve unchanged raw HTML values and serialize through the canonical writer. When `src/dict.jsonl` conflicts during a rebase, take the new base's file and re-apply the combined manifest through the guarded applier, then compare by key. Do not hand-merge its lines. Compare dictionaries by key to prove that the only changed, added, removed, or renamed records are the intended ones. In a shared checkout, distinguish the batch's change set from other agents' work. Do not stage the whole source file if that would include unrelated edits.

## Verify integration and shared behavior

Re-export After from the final source and final implementation, then visually recheck every affected entry. Include parser-only and typography-only changes, not just the source-edit list. Count affected entries from parsed JSON, rendered text, and the viewer's typography comparison. A renderer class change alters every entry's markup, so comparing HTML strings overcounts. Fresh verifiers can split the list. Fix each failure at its cause and recheck it. Give a fresh reviewer substantive source restorations or shared changes when independent judgment can catch an error.

For shared behavior, run the old and new implementations on the same frozen input. To attribute every corpus change to a rule, also run copies of the new parser with one rule disabled at a time. Investigate any change that no single rule explains. Compare the relevant whole-corpus population:

- Ordered lexical text, repeated blocks, homographs, sense and compound parentage, and quotation-author association.
- Every existing canonical and alias destination when lookup behavior changes, plus recovered references and ambiguous inferred spellings.
- Relevant typography or notation classes, including negative cases, nesting, existing explicit markup, and repeated normalization.

Token retention is a candidate detector, not a proof of lexical correctness. Review newly introduced candidates and compare them with the baseline's classified cases. Header fallbacks, empty duplicate markers, and deliberate semantic boundaries can explain differences. Keep the explanations rather than accepting a count because it stayed constant. Check structure independently because a text-preserving move can still attach a note to the wrong sense.

When constructing an alias comparison, reproduce the database writer: use decoded/NFC parsed keys and its `Map` overwrite behavior. Comparing raw source keys against the built database creates spurious gains and losses. Test the complete alias map, not only spellings presently used by links.

Use the current package scripts:

```sh
bun test
bun check
bun run build
```

`bun run build` includes database generation. Bump `PARSER_VERSION` in `scripts/build-db.ts` when stored parser or alias semantics change. Use `bun run build:db:force` when deliberately testing a rebuild. Do not hand-edit the generated database. Scratch TypeScript may participate in project type checking even under `.context`. Resolve real errors instead of adding exclusions to hide them.

After replacing the database, restart the task-owned app so its cached SQLite connection opens the new file. Verify actual entry routes against expected rendered text and check cross-reference destinations through the runtime's canonical-slug-first lookup. For additions and renames, also exercise search and navigation. A successful build alone does not verify these flows.

## Complete the batch

Verify the comparison across all selected entries, then inspect representative desktop and narrow-screen cases. See [Rendered comparison](rendered-comparison.md) for the checks.

Write a report with coverage, correction counts, additions and renames, evidence, unresolved readings, relevant regression results, verified runtime behavior, comparison URL, screenshots, and the next headword. Do not describe a corpus-wide automated scan as a corpus-wide manual review. State any verification limits directly.

Re-read git state before staging or committing. Run `bun check` before each commit as required by the repository. Keep source corrections and shared behavior in coherent commits. Publish only within the user's authorization, using the current target branch and the full PR diff. Close only owned browser sessions and processes. Leave preview services running when the delivered links depend on them.
