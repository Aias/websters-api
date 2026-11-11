# Process checks

Use the helpers in `scripts/dictionary-audit/` to check immutable inputs, retain semantic differences, and derive progress. Their results identify mechanical failures and review candidates. They do not establish a printed reading or replace entry-specific judgment.

## Packet preparation

Validate a packet before dispatch:

```sh
bun scripts/dictionary-audit/packet.ts <packet.json>
bun scripts/dictionary-audit/packet.ts <packet.json> --review
```

The exported types in `packet.ts` describe the packet JSON. Record exact ordered assigned keys, one dossier per key, and a file proof containing path, byte length, and SHA-256 for each input. Bind the applicable parsing guide and skill references through a frozen rules bundle containing their full applicable text, original paths, digests, and settled decisions. Preserve and deliver that bundle with the packet. Its file hash binds the actual supplied rules without depending on mutable live reference files. Include the complete text of referenced editorial decisions when they control the assigned disposition. Preserve the original bundle and issue a named supplement when a controlling decision was omitted, reopening only the affected dimensions.

Preparation checks the stored inputs and prepared image coverage without requiring future reviewer delivery or inspection. Review mode checks actual text delivery and image inspection receipts. Each result names its phase. A preparation-ready row has usable inputs, not completed review. The default dossier checks describe a complete-entry packet. A targeted recheck can remain held for unrelated absent dimensions while its named fields are reviewed, without receiving complete-entry credit.

Keep preparation writers separate from admission verifiers. Admission verification reads frozen inputs without rewriting them. Bind supplements to immutable dossiers, rules, and native/text proofs rather than regenerable readiness reports. When a status receipt changes, preserve the failed binding and issue a named revision after proving which source inputs remain identical. Verify each proposed final HTML value against exact edit replay over the decoded dictionary value. Hash that value separately from a file containing its JSON serialization.

Before calling a printed headword missing, search the complete parsed headwords, alternate headings and canonical aliases. An absent canonical key alone does not establish an absent entry.

Before removing an own record as a duplicate, inspect its alphabetic location for a separately printed standalone entry and search every recorded headword variant in the electronic witnesses. Owner-compound pages do not establish standalone absence. Pack horse is printed separately even though Pack also carries its run-in.

Before combining electronic witness paragraphs, confirm their exact lexical identities. Preserve significant spaces and hyphens in headings, using folded names only to locate candidates. Keep source tags separate for distinct entries such as "black bird" and "blackbird" until their complete paragraphs establish the same identity. Do not extend a paragraph source tag to adjacent untagged text. A separate dated witness can establish the complete span's provenance when its boundary and full text match directly.

For text delivery, record zero-based, end-exclusive byte windows and their hashes from actual successful results. Check gap-free coverage of complete raw, decoded, parsed, browser-text, and witness text. A prepared file does not prove delivery, and delivery does not prove inspection. Store reviewer and trace references separately for actual inspection. An electronic witness absent from an edition remains a named field hold.

For image evidence, retain the native page ID, source URL, edition, printed page, original dimensions, and source hash. The original may be JPEG or PNG. Define required native rectangles and lossless, unscaled PNG pieces with coordinates relative to that image. Verify crop pixels against the native source while preparing them and retain the generation receipt. Print evidence supplies `source: {url, edition}` and `generationReceipt: FileProof`; the helper checks the receipt's bytes, not its truth. Image dimensions and file hashes alone cannot establish pixel correspondence or identify the printed entry. Each print image requires the native rectangle that holds its entry, the entry's lines padded and widened to their column, and lists only the column pieces that intersect it. A reviewer opens the whole page for identity and those pieces for the reading, and opens a neighboring piece whenever the entry runs to a piece's edge. Before reviewing an entry, the reviewer records an actual identity inspection with reviewer, trace, key, page ID, printed page, running head, and matching entry text. Review mode requires it. Use separate receipts for image delivery and inspection. Enlargements can support judgment while the native crop remains the pixel reference.

Bind each accepted fragment to its actual inspected crop and page, including continuations. An entry's first crop does not establish evidence for every field in that entry. Preserve original pointers when issuing a corrected receipt.

Carry the original-resolution setting through the final image emission. A wrapper can rescale a file loaded at original detail. Whole-page identity can use a reduced image; inspect target crops without resampling, dividing oversized crops into pieces that preserve every pixel.

Verify the volume and printing against the item's catalog record or title page. Preserve original receipts when correcting a printing label, and bind the correction separately from unchanged image and text evidence.

After packets retain every native page, required rectangle, and piece from the initial packet, including continuations. Compare the complete print-evidence arrays and their hashes during preparation; selecting one print image loses evidence for entries spanning pages. An entry with no matching native witness retains its evidence hold.

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

An adjudicator's certain reading settles a target only when it matches a blind reader who was also certain. One that matches neither reader, or only an uncertain one, goes to a fresh blind reader, and the target is applied when that reading matches the adjudicator's. Send every target with an uncertain reader to adjudication, including one whose readers agree on the text and differ only in spacing or markup.

When a final check changes an inserted unit, freeze the final replacement and independently confirm that complete fragment. Preserve earlier answers under their original hashes rather than assigning them the adjusted replacement's hash.

For **mask-boundary disagreement**, inspect the full source fragment and print context. Prove which punctuation lies inside the replacement and which remains outside it, then independently verify the resulting exact fragment. A conventional spelling, neighboring word, or unreadable mark supplies no missing pixel evidence. Hold the affected characters when the source cannot settle them.

For a recheck, freeze the exception inventory and retained evidence before judgment. Give fresh readers answer-free context where practical, keeping proposed readings and prior rationales separate. Reconcile every exception as retained, corrected, reversed, or unresolved. Reverse an unsupported applied edit only through an exact guarded fragment or a replay of its frozen per-key manifest, preserving all other accepted edits. The exception recheck grants no new complete-entry coverage.

## Whole-page reading

Whole-page reading finds differences that entry-by-entry review does not reach, at a small fraction of its cost per entry. Two models transcribe every column of a page without seeing the record, and the words they read identically are aligned with the records on that page. It judges words only. Pronunciation marks, punctuation, capitals and italics need their own review.

- **Cutting:** cut each column into pieces of about 27 lines and enlarge them twice. Take the column edges from the scan's OCR word boxes as well as from the printed rules, because a skewed page clips the first or last letter of every line under a vertical cut. Leave the pronunciation key at the foot of the page out of the crop.
- **Matching:** match a printed entry to a record's key or to a secondary headword inside a record. Headwords joined by a brace share one definition. A printed entry that matches neither is a missing record: confirm it on the second printing and transcribe it into a new record in its neighbours' markup.
- **Sorting:** set aside a difference that lies inside a registered later addition, a source mark, an abbreviated genus, or print both readers mark unreadable. Compare every other difference with the Gutenberg text. Where Gutenberg reads as the print, GCIDE changed the wording and the 1913 wording returns. Where the record has words that Gutenberg and the print both lack, GCIDE added them and they stay.
- **Third reading:** read each remaining difference blind on the second printing before applying it. Worn or broken type in one impression produces confident wrong readings, and only the second printing exposes them.
- **Print errors:** read each proposed correction for sense before applying it. Both printings can share a misprint, such as a wrong chapter in a citation or a misspelled author, and the record's corrected reading then stands.
- **Edits:** draft a plain-word correction from the reading and keep the record's punctuation around it. Draft anything that touches markup by hand from the same record's conventions. Apply all of a record's changes in one pass against a hash of the original record.
- **Weaker second reader:** when the second reader misreads more often than the first, also compare the first reader alone with the record. Where it finds a difference the pair missed, have a third model read a strip of the same scan blind, and count its agreement as the second reading.
- **Unsettled strips:** when a strip of the second printing does not settle a difference, cut a taller one from the place the first reader found the line and read it again before giving up.
- **Inflected forms:** read the differences inside the bracket of inflected forms by hand. Most are the record's written-out labels, and a few are misspelled forms.
- **Misfiled entries:** a printed entry with no record may sit under a misspelled key or inside a neighbour under the neighbour's headword. Search by definition text before writing a new record, and restore the neighbour in the same change.
- **Rewritten passages:** where GCIDE rewrote a sentence around a registered later addition, do not correct it word by word, because the result is neither text. Ask the person one question for the whole passage. Before applying a batch, list every passage where some differences are corrected and others are left, and read each one whole.
- **Supplement text:** set aside every difference that lies in text GCIDE sources to the 1913 Supplement. The Supplement revised some main-vocabulary definitions, the record carries the revision, and the main page then differs without the record being wrong. `reports/dictionary-print-fragments.jsonl` gives the source of each differing passage. The tags are not always right, so a rewritten passage that reads like early-1900s text goes to the person as well.
- **Probable 1913 revisions:** the record descends from a transcription typed from the 1913 printing, which Project Gutenberg preserves. Where that transcription and the record agree on a whole phrase, or on a correct reading, against the 1898 and 1907 printings, the 1913 printing probably revised or corrected the passage, and the record stays. A single plausible word cannot be told from a typist's slip and follows the ruling.
- **Records and edits together:** fold every word-level correction to a record into any drafted rename or rewrite of the same record before applying either, because the draft replaces the whole record.
- **Special letters:** draft by hand any correction where the printed word touches a letter outside the plain alphabet, such as a thorn.
- **Proofreading:** have a reader who did not draft them read every rule-drafted correction for sense before it is applied.
- **Questions for the person:** put every judgment call in the review queue with crops of both printings, and record a hold for it.
- **Third reader:** two blind readers with a tiebreak and a confirming printing already find the word differences. A third model that read 34 corrected pages blind found none they had missed, so do not add a third reader for words.
- **Blended corrections:** when a proofreader finds that a correction would mix the printed wording with a later rewrite, ask the person about the whole passage. Do not keep the record without a question.
- **Punctuation and capitals:** compare the marks between words and initial capitals from the same blind readings, in a pass of their own. Leave out later additions, headings, forms, names and small capitals. Confirm each difference with a strip of the second printing, draft the simple shapes by rule, and have every change proofread. [The pass report](../../../../reports/dictionary-audit-punctuation.md) gives the method.
- **Punctuation shapes no rule drafts:** have one agent write the exact replacement by hand, with a stated reason wherever the record should stay, and a different agent proofread it. A reported change stays out unless its text changes after the review.
- **Lists set in several columns:** the line comparison cannot follow a list the print sets two or three across, such as the word lists under Un-. Set its differences aside before any drafting, and compare the list's words as a set against both readers.
- **Registered text before a repair:** check the later-additions register before turning a reported blend into a hand correction. If the correction would remove registered text, ask the person.
- **Entries under X, Y and Z:** the register lists only whole entries there. Check every correction to those entries by hand, and judge later additions from the typists' text and the two printings.
- **A correction whose result is already in the record:** a hand correction that only removes a repeated phrase leaves text that the record already contains, so a check for "already applied" skips it. Give it enough context that the result is new.
- **Page numbers:** take a printed page number from the scan leaf it was read from, never from memory.
- **Tests that pin record text:** some tests assert a record's exact words. When a correction legitimately changes them, update the expected text, and run the tests after every plan.
- **Order of same-spelled entries:** compare a record's entries with the print as whole units before comparing words. Pair each entry with a printed one by its opening words, in both readings, and reorder only when both readers and the typists' text give one order. A word comparison that runs first lines text up against the wrong entry and hides real differences inside it.
- **A literal ‖ in the source:** the source writes the printed foreign-word mark as `&#x2016;`. A literal ‖ before an entry that is not the record's first is the source's own leftover, and the site shows it as a foreign-word mark. Drop it where neither reader has the mark before the printed entry. Ask the person where the entry has no printed page.

[Page-reading batch 2](../../../../reports/dictionary-audit-page-reading-2.md) gives measured costs and yields.

## Readings the readers leave open

When the readers do not settle a field, hand it to the person through the review queue instead of holding it for a later reading. This covers a character every reader marks unreadable, readers who still differ after a second printing, and a question about how the record represents what the print shows.

Append one JSON line per field to `.cache/review/items.jsonl`, in the `ReviewItem` shape from `app/lib/review-queue.ts`: an `id`, the entry `key`, a one-sentence `question`, the exact raw fragment `old` (it must occur once in the entry), the best-guess raw fragment `proposed` or `null`, each reader's `readings`, and `images`. Save the crops as PNG files under `.cache/review/images/`, one per printing, cut wide enough to show the line above and below.

The person decides each item at `/review` in the development server, by accepting the proposal, editing it, or keeping the record. `bun scripts/review/apply.ts --dry-run` lists the decided items, and without the flag it writes them to the source under the one-anchor guard. Commit applied decisions with the batch that raised them, and run the usual checks first.

## Resumable progress and admission

Use `deriveProgress` from `packet.ts` to derive counts and the first unstarted key within the supplied frozen ordered keys and unique per-entry records. This is not a next-unclaimed cursor. Select the ascending or descending unclaimed range separately against the shared claims and preserve its exact review order. Bind source and complete-review credit to the actual source and implementation hashes. Glyph-only credit remains separate. Keep the detailed source, parser, browser-text, visual, field-hold, and issue records with their evidence rather than reducing them to a single completion boolean.

Retain completed dimensions across resumptions. Reopen a dimension when its relevant raw, parsed, rendered, CSS, font, or implementation hash changes. A held etymological accent does not require another reading of an unchanged definition. Generate prose reports and continuation cursors from the authoritative records, then reconcile claims and actual source before dispatch.

Choose packet size from a representative measured workload. Use source/witness bytes, rendered height, print columns, and field difficulty to separate unusually long entries. Keep every provider slot working, giving ready independent reading and integration the next free slots. Save per-entry results, allowing interrupted workers to resume without repeating completed judgment.

Measure completed review dimensions, accepted witnessed repairs, false acceptances, and unresolved work alongside tokens and elapsed run. Keep discovery and verification measurements separate. A reduced candidate-only pass retains its own coverage label and does not silently replace an exhaustive audit.

## Shared findings and retained evidence

Keep the structural issue queue in `reports/dictionary-structural-issues.jsonl`, with raw span, parsed owner path, witnessed expected ownership or a named evidence gap, and reproduction. Reproduce an older observation against current source before acting on it. Narrow validators route rejected structural edits to the integrator. Group recurring conversion defects for a witnessed pure transform and frozen dry-run. Share rule decisions with active and finished reviewers before integration.

Reuse validated comparison exports and viewers while their input digests match. Preserve source manifests, witness locators, native evidence for unresolved readings, decision records, and regeneration inputs. After checking active service ownership, remove only inactive reproducible databases or captures and record actual deletion receipts. Shared native scans and active packets remain read-only. Final runtime and affected-entry verification remain required.
