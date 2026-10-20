# Quick-wins pass

A quick-wins pass is a text-only discovery sweep over a range that no exhaustive audit has reached. It applies only corrections that the sentence itself makes certain and leaves every other defect for the exhaustive audit. A missed defect costs nothing. A wrong correction damages the historical text, so the pass is tuned for precision, not recall. It never counts as initial review or exhaustive coverage of the range.

## Scope

Correct ordinary English prose inside definitions, collocation definitions, notes, usage blocks, synonym lists, quotations, secondary definitions, subdefinitions, run-in derivative text, the connective words of an alternative-spelling note, and illustration captions:

- Letter-level typos that produce a non-word or an unmistakable wrong word: "excecially" for "excessive", "a stocker" for "a stoker".
- A wrong short function word: "insolvent of bankrupt", "done be fairies", "in a office".
- A duplicated word or phrase, a lost space between two words, a doubled or stray punctuation mark, and an inflection that the grammar settles ("A women who").
- Inside a quotation, only a non-word, a duplicated word, or a lost space. A real word that could be the author's own form stays, including homophone and dialect swaps such as made/maid, me/my, then/than, be/by.

Hold for the integrator rather than apply: a whole-word insertion unless GCIDE confirms the fuller reading, since 1913 definitional style often omits articles ("A glance of eye"); a change of more than eight characters that is not a duplicated-run deletion; a span where GCIDE contains neither the old nor the new reading; an insertion that falls exactly on a text-node boundary, and punctuation added at the edge of an italic example span, because the validator cannot tell which side of the markup they belong on. Reject rather than hold: any span containing U+FFFD, any edit that crosses markup, and any edit inside headwords, pronunciations, etymologies, Greek, taxonomic and proper names, author attributions, grammatical and field labels, sense markers, cross-references, compound headwords, inflection segments, formulas, tables, or verifier metadata. When two corrections are equally plausible ("one the foot" could be "on the foot" or "one on the foot"), do not guess. When one reading parallels the surrounding construction ("unbounded space; an, unbounded ambition"), prefer the parallel.

## Harness

The harness lives in `scripts/quick-wins/` and keeps its run state under `.cache/quick-wins/`: `plan.json`, `runs.jsonl`, `packets/`, `applied/`, and the GCIDE witness unzipped from [GCIDE XML 0.53](https://www.ibiblio.org/webster/gcide_xml-0.53.zip) at `reference/gcide_xml-0.53/`. Frozen packets are immutable; `freeze.ts` refuses to overwrite them without `--force`.

| Step                                                        | Command                                                                                  | Output                                                                               |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Freeze the range into packets with per-entry SHA-256 values | `bun scripts/quick-wins/freeze.ts <first> <last>`                                        | `packets/pNNN/entries.jsonl` and `text.md`; `plan.json` with the baseline revision   |
| Drive headless reviewers over the queue                     | `bun scripts/quick-wins/run.ts --safe --concurrency=4 [--packets=p001-p020] [--reverse]` | `findings.json`, `manifest.json`, `review.json`, `run.json` per packet; `runs.jsonl` |
| Validate one packet's findings                              | `bun scripts/quick-wins/validate.ts <packet>`                                            | `manifest.json` and `manifest.md`                                                    |
| List accepted items for integrator reading                  | `bun scripts/quick-wins/review.ts --packets=p001-p020 --mode=review`                     | One line per item; `--mode=typo`, `holds`, or `all` select other views               |
| Apply accepted items under the frozen-hash guard            | `bun scripts/quick-wins/apply.ts [--dry-run] [--packets=p001,p002]`                      | `src/dict.jsonl` through the canonical writer; `applied/<timestamp>.json` ledger     |

Packets stay within the reading tool's limits, about 1,600 lines or 80,000 characters, roughly 290 entries. Pronunciations and etymologies render as placeholders so the reviewer reads only what it may edit. A later rebase keeps the packets valid while every frozen hash still matches, and `apply.ts` skips an entry whose source changed since the freeze.

## Roles

1. **Reviewer** (Opus, headless): follows `scripts/quick-wins/REVIEWER.md`. It reads the whole packet, writes findings as decoded `old`/`new` text with enough context to be unique within the entry, delegates exact placement to the fixer, then reads the resulting manifest and may veto an accepted item. Reviewer decisions only demote; they never promote a hold.
2. **Fixer** (Haiku): follows `scripts/quick-wins/FIXER.md`. It runs the validator and repairs only locating problems (`not-found`, `ambiguous`, `spans-markup`, `duplicate-finding`) without changing what a finding corrects.
3. **Validator** (`validate.ts`): matches `old` with whitespace-flexible search, trims the finding to its changed characters, maps them to raw offsets, encodes the replacement with the source's entity conventions, rejects denied containers and markup crossings, confirms the parsed skeleton is unchanged, classifies the GCIDE witness as confirmed, shared, both, neither, or no-entry, and writes a manifest with accepted, hold, and rejected items.
4. **Integrator** (strongest model): reads every accepted real-word swap, quotation edit, and punctuation edit in full, skims non-word typos as old/new word pairs, records its decisions in `integrator.json` beside the manifest, applies accepted items, runs the repository checks, and commits each reviewed batch. Holds stay unapplied unless the integrator accepts them with a witness.

`run.ts` invokes `claude -p --model opus --output-format json --no-session-persistence --dangerously-skip-permissions --strict-mcp-config`, adding `--safe-mode` under `--safe`. Safe mode removes CLAUDE.md, skills, and MCP servers, which the reviewer does not need, and more than halves the fixed prompt cost. Per-packet lock files and the resumable queue let two drivers work from both ends of the range. The reviewer stops on a validator error rather than repairing the scripts.

## Calibration

Calibrate before scaling. Build a blinded gold set of about 16 entries with a known transcription slip and 16 correct controls, drawn from outside the range the spec's examples use, since examples taken from the gold set contaminate the measurement. Score exact usable repairs and unsupported control edits. The bar for this spec is 15 exact repairs of 16 and no control edits. The expected failure mode is repairing a real defect the wrong way, as in inserting a word where a letter was wrong; the insertion hold exists for that case.

## Expectations

A headless packet of about 290 entries takes one to four minutes and under a dollar of estimated usage, several times faster than the same packet through an in-session agent. Yield runs between four and seven accepted corrections per hundred entries, with about one finding in seven held. The quotation rule and the insertion hold target the two classes of wrong correction a reviewer produces: homophone swaps inside quotations and whole-word insertions.

GCIDE shares almost every transcription error with this source, so its witness status is usually "shared" and confirms nothing. Treat "confirmed" as supporting evidence, "neither" as a hold, and "shared" as neutral.

## Recurring defects

Reviewers report recurring defects instead of patching them per entry, and a [dictionary-wide pass](sources-and-lexical-behavior.md#dictionary-wide-passes) fixes each class once. Classes the pass leaves alone: `[Collog.]` for `[Colloq.]`; `(Mach.)` on mathematical senses where `(Math.)` belongs; doubled or stacked punctuation at header level such as `,,` and `,;`; a lost space after an italic example span, which needs a word-list check because many spans deliberately split a word; dangling separators before run-in derivative lines; and trailing spaces inside bold headwords. Holds from the pass (word insertions, replacement characters, quotation homophones) are the exhaustive audit's input for the range, not a backlog for this pass.
