# Later additions to the dictionary text

`dictionary-later-additions.jsonl` lists material in `src/dict.jsonl` that is probably not in the 1913 printed dictionary. It is sorted by `key` (entry row first, then span rows by `surveyHunkId`). Tools and work files are in `.context/dictionary-audit/later-additions/` (`build.py`, `owner.ts`, `finalize.py`, `excluded-entries.jsonl`).

## Counts

13,903 rows over 11,143 keys.

| category             | entry |  span |  total |
| -------------------- | ----: | ----: | -----: |
| `wordnet`            |    94 |    21 |    115 |
| `gcide-editor`       |   125 |    86 |    211 |
| `supplement-1913`    | 3,356 |   786 |  4,142 |
| `later-unattributed` | 2,158 | 3,370 |  5,528 |
| `uncertain`          |   302 | 3,605 |  3,907 |
| total                | 6,035 | 7,868 | 13,903 |

Left out: 1,168 `ours-extra` hunks whose print vote supports ours, and 721 ours-only entries whose text mostly appears in the print OCR (Gutenberg dropped them; see `excluded-entries.jsonl`). Of the 7,868 span rows, 6,724 have an `owner` pointer and 1,144 await location or fragment reconciliation. Rows for text that a print restoration later replaced are removed once their complete disposition is established.

## Row fields

- Entry: `key`, `scope` "entry", `category`, `gcideSource`, `evidence`.
- Span: `key`, `scope` "span", `text`, `owner`, `category`, `gcideSource`, `printVote`, `surveyHunkId`, `evidence`.
- `gcideSource` lists the GCIDE 0.53 `<source>` tags (`none` means a paragraph with no tag), or `null` when no GCIDE paragraph was found.
- `owner` is a JSON Pointer into `parseEntry(key, html)` from `scripts/build-db.ts`. It locates a containing node, sometimes an array when the span crosses blocks. An owner is `null` when the fragment or its lexical location needs reconciliation. Its container can include printed text outside the classified span.

## How categories were decided

Entries (keys only ours has, from `survey-gutenberg/only-ours.jsonl`):

1. The key is folded and looked up among GCIDE entries. The category follows the strongest source tag among the entry's paragraphs, in the order WordNet, editor, supplement, 1913 Webster: WordNet gives `wordnet`, `PJC`, `+PJC`, `JG` or any other editor gives `gcide-editor`, "Webster 1913 Suppl." gives `supplement-1913`, "1913 Webster" or no tag gives `later-unattributed`. A key with no GCIDE entry is `later-unattributed`.
2. Print check for `later-unattributed` only: the share of the entry text's word trigrams found in the print OCR (1907 volume A to M, 1895 volume N to Z). At 60% or more the entry is 1913 text that Gutenberg dropped and is omitted. From 25% to 60% it is `uncertain`. Below 25% it stays `later-unattributed`.
3. X through Z entries and supplement entries are rechecked against their complete Gutenberg paragraphs ([classification batch 1](dictionary-audit-classification-1.md)). An entry whose text is a main-text paragraph has no entry row. An entry whose text is a supplement paragraph is `supplement-1913`, whatever other tags its GCIDE paragraphs carry. Entries with later material or poor agreement keep their earlier category until span rows or identity checks settle them.

Spans (`ours-extra` hunks):

1. Print vote `ours`: omitted.
2. The GCIDE paragraph holding the text is located (whole span, else span start with left context, else span start). If paragraphs of several kinds match, the priority is `wordnet`, `gcide-editor`, `supplement-1913`, then 1913 Webster, and `evidence` says so. When no paragraph is found, the survey's `gcideSource` tag is used.
3. A WordNet or editor source gives `wordnet` or `gcide-editor` whatever the vote, because the source is independent of the print. "Webster 1913 Suppl." gives `supplement-1913` (1913 text, kept and marked).
4. Otherwise a `gutenberg` vote gives `later-unattributed`, and an `unclear` vote gives `uncertain`. The `evidence` field carries the vote anchor, the score, and the OCR window.

Reviewed entry rows bind source tags to the exact paragraphs supplying the current text. Separate normalized headings and absent GCIDE senses retain their own provenance. A mixed paragraph does not establish that every word came from its latest contributor. [Own-compounds-1/2](dictionary-audit-own-compounds-2.md) corrects six rows under this distinction. [Own-compounds-3-6](dictionary-audit-own-compounds-3-6.md) corrects seven more entry rows and adds Humming bird, whose additional text has no identified contributor. The sole span pointer on its changed owner keys, Lancet's knife-like fragment, retains its matching lexical context.

## Known limits

- The print vote agreed with the page on 90% of 60 hand-checked rows (`survey-gutenberg/verify/REPORT.md`). Votes of `gutenberg` were right 94% of the time; about half of the sampled ours-extra rows were words Gutenberg dropped, so some `later-unattributed` spans are 1913 text.
- Spans are word-level fragments, often one word or a sense number, and several adjacent spans can belong to one added sentence.
- GCIDE tags do not mark most additions: added text often sits in "1913 Webster" paragraphs, so `later-unattributed` is the default for anything absent from the print, and `wordnet` and `gcide-editor` are undercounts.
- `uncertain` spans are mostly one-sided OCR windows. Rows with a high `score` in `evidence` are likely 1913 text.
- Entry-level trigram checks suffer from OCR errors and from entries whose print wording differs from ours.
- Source restorations can remove a fragment, move its owner, or leave the same words elsewhere in the entry. Revalidate the retained registry after source edits. A relocation needs matching lexical context. A unique bare-word match can point at unrelated text.

The original comparison covered A through W and omitted Gutenberg book 670. The expanded [print-source inventory](dictionary-print-reconciliation.md#re-examine-later-addition-classifications) records 497 entry classifications for priority re-examination against X through Z and the supplement. These are presence-based candidates. The inventory preserves the existing categories pending complete-content review. Yang also has a confirmed tag-provenance error: a separate lowercase GCIDE homograph supplied the editor tag, although the current record contains only the historical goose senses.

## Owner verification

`scripts/dictionary-later-additions.test.ts` checks every non-null span pointer against the current parsed entry using the registry's word normalization. This detects absent pointers and fragments missing from their recorded owners. Printed origin, lexical context, and removal boundaries still require review.

The ownership reconciliation at source revision `452e7b9` relocates four spans in Cart, Corn, and Out after confirming their context. It clears 148 stale pointers whose locations remain unconfirmed, retaining their classification and original text for review. Those rows are included in the 1,145 unresolved locations above. For example, Dollar's removed sense-2 word "formerly" must not be reassigned to the same word in Trade dollar.

## Using the file

Select whole-entry classifications for review by category, for example:

```sh
jq -c 'select(.scope=="entry" and (.category=="wordnet" or .category=="gcide-editor" or .category=="later-unattributed")) | .key' reports/dictionary-later-additions.jsonl
```

That lists whole-entry candidates. Confirm each classification before filtering, starting with the more reliable `wordnet` and `gcide-editor` categories.

For span rows, use `owner` to locate the recorded text, then verify its lexical context and exact boundaries against the current source. Remove only the reviewed span. Removing its containing node requires an independent classification of that entire node. Leave text unchanged when the owner is null, the fragment is absent, or its location is ambiguous. Resolve those rows before filtering. Retain original-value hashes for any applied removal.

[Own-compounds-7-14](dictionary-audit-own-compounds-7-14.md) removes three whole-entry rows for printed standalone content, corrects three retained-entry classifications, and classifies Earth's complete electrical span from consecutive Gutenberg supplement paragraphs. Its relocated owner contains the exact span plus additional material outside that classification.

The Bench mark vocabulary-pointer span is retired with its complete-unit restoration. Christian Endeavor's unchanged supplement span moves one content index after adjective sense 2 is restored. Every retained non-null pointer is verified against its current lexical text.

[Own-compounds-15-20](dictionary-audit-own-compounds-15-20.md) corrects nine retained-entry classifications and adds Mango tree. Guttersnipe excludes an absent editor paragraph, while exact retained editor and WordNet paragraphs remain classified. No current own record is removed.

Four Gray whale span rows retire with the replaced modern compound text. The separate whole Gray whale record remains classified and unchanged.

[Own-compounds-21-26](dictionary-audit-own-compounds-21-26.md) corrects seven retained-entry classifications, replaces Snap’s adjective survey fragment with its exact contiguous definition and supplement provenance, retires Parcel post’s replaced modern span, and moves three Red tape pointers to the same lexical containers after Red lead becomes a separate compound. Pack horse is printed main vocabulary and receives no later-addition entry row. All retained non-null pointers pass verification.
