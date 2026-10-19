# Quick-wins pass

A quick-wins pass is a text-only discovery sweep over a range that no exhaustive audit has reached. It applies only corrections that the sentence itself makes certain and leaves every other defect for the exhaustive audit. A missed defect costs nothing. A wrong correction damages the historical text, so the pass is tuned for precision, not recall. It never counts as initial review or exhaustive coverage of the range.

## Scope

Correct ordinary English prose inside definitions, collocation definitions, notes, usage blocks, synonym lists, quotations, secondary definitions, subdefinitions, run-in derivative text, the connective words of an alternative-spelling note, and illustration captions:

- Letter-level typos that produce a non-word or an unmistakable wrong word: "excecially" for "excessive", "a stocker" for "a stoker".
- A wrong short function word: "insolvent of bankrupt", "done be fairies", "in a office".
- A duplicated word or phrase, a lost space between two words, a doubled or stray punctuation mark, and an inflection that the grammar settles ("A women who").
- Inside a quotation, only a non-word, a duplicated word, or a lost space. A real word that could be the author's own form stays, including homophone and dialect swaps such as made/maid, me/my, then/than, be/by.

Hold for the integrator rather than apply: a whole-word insertion unless GCIDE confirms the fuller reading, since 1913 definitional style often omits articles ("A glance of eye"); a change of more than eight characters that is not a duplicated-run deletion; a span where GCIDE contains neither the old nor the new reading. Reject rather than hold: any span containing U+FFFD, any edit that crosses markup, and any edit inside headwords, pronunciations, etymologies, Greek, taxonomic and proper names, author attributions, grammatical and field labels, sense markers, cross-references, compound headwords, inflection segments, formulas, tables, or verifier metadata. When two corrections are equally plausible ("one the foot" could be "on the foot" or "one on the foot"), do not guess.

## Pipeline

Freeze the range from the current source into packets of review text with per-entry SHA-256 values. Render pronunciations and etymologies as placeholders so the reviewer reads only what it may edit, and keep each packet within the reading tool's limits (about 1,600 lines or 80,000 characters, roughly 290 entries). Record the baseline revision; a later rebase keeps the packets valid when every frozen hash still matches.

Run three roles with one integrator:

1. **Reviewer** (Opus): reads the whole packet, writes findings as decoded `old`/`new` text with enough context to be unique within the entry, delegates exact placement to the fixer, then reads the resulting manifest and may veto an accepted item. Reviewer decisions only demote; they never promote a hold.
2. **Fixer** (Haiku): runs the validator and repairs only locating problems (`not-found`, `ambiguous`, `spans-markup`, `duplicate-finding`) without changing what a finding corrects.
3. **Validator** (script): matches `old` with whitespace-flexible search, trims the finding to its changed characters, maps them to raw offsets, encodes the replacement with the source's entity conventions, rejects denied containers and markup crossings, confirms the parsed skeleton is unchanged, classifies the GCIDE witness as confirmed, shared, both, neither, or no-entry, and writes a manifest with accepted, hold, and rejected items.
4. **Integrator** (strongest model): reads every accepted real-word swap, quotation edit, and punctuation edit in full, skims non-word typos as old/new word pairs, records holds in a separate integrator decision file, applies accepted items by raw offset under the frozen-hash guard, runs the repository checks, and commits each reviewed batch.

Drive reviewers headlessly rather than through in-session agents: `claude -p --model opus --safe-mode --strict-mcp-config --dangerously-skip-permissions --no-session-persistence --output-format json`. Safe mode removes CLAUDE.md, skills, and MCP servers, which the reviewer does not need, and more than halves the fixed prompt cost. Use per-packet lock files and a resumable queue so two drivers can work from both ends of the range. The reviewer spec and fixer spec live beside the scripts, and the reviewer must stop on a validator error rather than repair the scripts.

Calibrate before scaling. The forward audit's blinded 32-case gold set (16 corrupt owners, 16 repaired controls) measures exact usable repairs and unsupported control edits. Draw the spec's examples from a range outside the gold set; examples taken from the gold set contaminate the measurement. Expect a reviewer to repair a real defect the wrong way occasionally, as in inserting a word where a letter was wrong; the insertion hold exists for that case.

## Measured behavior

On the gold set, an Opus reviewer with this spec repaired 15 of 16 corrupt owners exactly and edited no control. Headless packets of about 290 entries took 55 to 230 seconds and about 0.35 to 0.77 dollars of estimated usage each, against about seven minutes for the same packet through an in-session agent. Yield ran between four and seven accepted corrections per hundred entries, with about one finding in seven held. Integrator review found three false positives among the first 131 accepted items (two homophone swaps inside quotations and one inserted word) and none in the following 1,400 after the quotation rule and the insertion hold were added.

GCIDE shares almost every transcription error with this source, so its witness status is usually "shared" and confirms nothing. Treat "confirmed" as supporting evidence, "neither" as a hold, and "shared" as neutral.

## Patterns for dictionary-wide passes

Reviewers report recurring defects instead of patching them per entry. Recorded so far: `[Collog.]` for `[Colloq.]`; `(Mach.)` on mathematical senses where `(Math.)` belongs; doubled or stacked punctuation at header level such as `,,` and `,;`; a lost space after an italic example span, which needs a word-list check because many spans deliberately split a word; dangling separators before run-in derivative lines; and trailing spaces inside bold headwords. Holds from the pass (word insertions, replacement characters, quotation homophones) are the exhaustive audit's input for the range, not a backlog for this pass.
