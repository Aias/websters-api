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

Write one dossier per entry. Each holds the raw HTML, parsed model, rendered HTML, witness extracts with file positions, print leaf range, and crop paths. Report how many entries lack each witness.

## Divide independent review work

Distribute disjoint ranges according to text volume and complexity as well as entry count. Balancing by the combined length of raw HTML and GCIDE text, ranges of roughly 75 to 170 entries fit one reviewer. Each reviewer receives the frozen records, dossiers, baseline exports, the print leaves covering its range, working browser URLs, evidence requirements, and a private scratch directory. Require completion of the assigned range rather than an early sample.

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

Before integration, assert unique, gap-free coverage of the frozen keys and reconcile reviewer boundaries. Count restored entries separately from the original requested batch.

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
