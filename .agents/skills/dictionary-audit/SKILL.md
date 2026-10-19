---
name: dictionary-audit
description: Audit and repair Webster dictionary entries against source witnesses, verify parsing and rendered presentation, and produce the established before/after comparison. Use for exhaustive entry batches or targeted dictionary-content defects, not unrelated application work.
---

# Dictionary audit

Review the requested entries from source through browser output. Correct witnessed transcription defects and shared parsing or presentation defects while preserving the dictionary's historical content, lexical organization, and notation.

An exhaustive batch requires a complete raw-source read, parsed-structure review, actual browser-text check, and visual inspection of every entry. Automated scans help find defects and check regressions. They do not establish manual coverage. For a targeted defect, use the relevant parts of this workflow without expanding it into an unrequested batch.

When the user accepts missed defects to reduce usage, use a conservative candidate-only verification pass instead of repeating exhaustive source judgment for every unchanged entry. Preserve completed reviews, candidates, evidence, and checks across model changes. Leave uncertain edits unapplied and record them for later. Report initial review, candidate verification, and exhaustive completion separately. The reduced-coverage mode does not relax the evidence required to accept a correction.

## Read the relevant guidance

- For batch setup, delegation, integration, and completion, read [Batch review](references/batch-review.md).
- For source recovery or shared parser, lookup, and typography changes, read [Sources and lexical behavior](references/sources-and-lexical-behavior.md).
- For browser evidence or the comparison viewer, read [Rendered comparison](references/rendered-comparison.md).
- For a text-only sweep of an unaudited range that applies only certain corrections, read [Quick-wins pass](references/quick-wins.md).

Read the repository's [parsing guide](../../../scripts/PARSING.md), current implementation, and relevant tests before changing lexical behavior. Confirm boundary conditions in code and tests when the guide summarizes a rule. Paths in the references are relative to the repository root unless identified otherwise. Existing `.context/dictionary-audit/` reports and helpers can accelerate a continuation, but they are gitignored and may be absent. The references here describe the process without depending on those files.

## Establish the scope

Confirm the current branch, working tree, requested direction and count, and the latest completed range. Recover progress from the prior report and actual keys, not a remembered numeric offset. Restored or renamed entries can change the sorted positions. Record the exact selected keys, their order, source revision, and the next entry before editing.

Freeze the original raw values, parsed entries, rendered HTML, and relevant code and styles. Preserve this baseline through the batch. A later fetch, rebase, or another agent's edits must not silently redefine Before.

For substantial batches, delegate disjoint entry ranges and keep one integrator for shared code and the tracked dictionary file. Reviewers return evidence and per-key patches from frozen inputs. They use separate browser sessions and scratch directories. Check claimed ranges against any concurrent audit from the other end of the dictionary.

When two audits run at once, read the other audit's latest report and the settled rules in the references before deciding an editorial question. Record a new rule in the references, send it to every running reviewer, and resume finished reviewers to apply it. Reconciling divergent decisions at integration produces inconsistent entries.

## Review and correct

For each entry, read all homographs, senses, forms, examples, quotations, notes, and compounds, including the end of long entries. Compare it with the matching electronic sources and with the printed page. In an exhaustive batch, read every print column that covers the range, not only the pages behind suspicious entries. GCIDE and Gutenberg share most transcription errors, so only the print reveals them. Record an entry-specific assessment and the evidence actually inspected.

Distinguish four causes before editing:

| Cause                                                                     | Correct location                                                                                                                |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| The raw entry is corrupt or incomplete                                    | A minimal source patch supported by a witness                                                                                   |
| Valid source is parsed or rendered incorrectly                            | The lowest shared parser, typography, lookup, or renderer layer                                                                 |
| The review page has incorrect fonts, styles, dimensions, or cached assets | The review harness, followed by replacement of invalid evidence                                                                 |
| The same conversion defect recurs across the corpus                       | A single [dictionary-wide pass](references/sources-and-lexical-behavior.md#dictionary-wide-passes), not per-entry batch patches |

Preserve unresolved readings and document the missing evidence. Agreement between related transcriptions is not independent corroboration. A related printed edition does not authorize wholesale replacement of the electronic entry. Source restoration is not a redesign of the application.

## Integrate and verify

Review patches against their witnesses, then verify every original-value SHA-256 against the current file before applying any of them. Keep additions and renames explicit. Preserve other agents' changes and re-read shared files before editing or staging.

Recheck the integrated output, including entries affected only by shared behavior. For shared changes, compare old and new behavior on identical source across the relevant corpus population. Check ordered semantic text, hierarchy, quotation ownership, and existing lookup destinations, not only counts or JSON equality.

Use the canonical database build and repository checks. Restart the task-owned app after a database replacement, then verify the selected routes and cross-references against that runtime. Keep the source baseline separate from the code-only regression comparison.

## Deliver the established comparison

For batch delivery, reuse the approved viewer when available. Otherwise follow the [comparison specification](references/rendered-comparison.md). Rendered is first and default, unchanged content uses `filter: opacity(0.5)`, and an identical After pane contains only "No changes". Use `@pierre/diffs` character-level primitives for rendered highlights as well as text differences. Preserve the application's typography and keep typography-only and image changes visible.

The batch report includes the exact reviewed range, source corrections and restored or renamed entries, remaining uncertainty, checks actually completed, working comparison and screenshot links, and the next verified headword. Distinguish manually reviewed entries from corpus-wide automated checks. Keep batch counts, ports, branch names, commit IDs, and current progress in that report rather than this skill. For a targeted defect, report the correction, evidence, uncertainty, and proportionate verification without requiring a batch viewer or continuation cursor.

Make source and shared-code commits coherent and independently reviewable when committing is part of delivery. Use `/pr-guidelines` and `/write` for an authorized PR. A previous merged PR does not authorize creating another. Close owned browser sessions and preserve preview services needed to use the delivered comparison.
