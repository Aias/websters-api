# Later additions to the dictionary text

`dictionary-later-additions.jsonl` lists material in `src/dict.jsonl` that is probably not in the 1913 printed dictionary. It is sorted by `key` (entry row first, then span rows by `surveyHunkId`). Nothing in `src/` was changed. Tools and work files are in `.context/dictionary-audit/later-additions/` (`build.py`, `owner.ts`, `finalize.py`, `excluded-entries.jsonl`).

## Counts

14,328 rows over 11,492 keys.

| category             | entry |  span |  total |
| -------------------- | ----: | ----: | -----: |
| `wordnet`            |   120 |    22 |    142 |
| `gcide-editor`       |   195 |    89 |    284 |
| `supplement-1913`    | 3,273 |   787 |  4,060 |
| `later-unattributed` | 2,246 | 3,445 |  5,691 |
| `uncertain`          |   502 | 3,649 |  4,151 |
| total                | 6,336 | 7,992 | 14,328 |

Left out: 1,168 `ours-extra` hunks whose print vote supports ours, and 721 ours-only entries whose text mostly appears in the print OCR (Gutenberg dropped them; see `excluded-entries.jsonl`). Of the 7,992 span rows, 6,993 have an `owner` pointer. Rows for text that a print restoration later replaced are removed.

## Row fields

- Entry: `key`, `scope` "entry", `category`, `gcideSource`, `evidence`.
- Span: `key`, `scope` "span", `text`, `owner`, `category`, `gcideSource`, `printVote`, `surveyHunkId`, `evidence`.
- `gcideSource` lists the GCIDE 0.53 `<source>` tags (`none` means a paragraph with no tag), or `null` when no GCIDE paragraph was found.
- `owner` is a JSON Pointer into `parseEntry(key, html)` from `scripts/build-db.ts`. It names the deepest node whose text contains the span (with its two left-context words tried first). It may point at an array (a span that crosses blocks) and is `null` when the text could not be found in the parsed entry, as for whole sections, headword changes, or text that parsing rewrites.

## How categories were decided

Entries (keys only ours has, from `survey-gutenberg/only-ours.jsonl`):

1. The key is folded and looked up among GCIDE entries. The category follows the strongest source tag among the entry's paragraphs, in the order WordNet, editor, supplement, 1913 Webster: WordNet gives `wordnet`, `PJC`, `+PJC`, `JG` or any other editor gives `gcide-editor`, "Webster 1913 Suppl." gives `supplement-1913`, "1913 Webster" or no tag gives `later-unattributed`. A key with no GCIDE entry is `later-unattributed`.
2. Print check for `later-unattributed` only: the share of the entry text's word trigrams found in the print OCR (1907 volume A to M, 1895 volume N to Z). At 60% or more the entry is 1913 text that Gutenberg dropped and is omitted. From 25% to 60% it is `uncertain`. Below 25% it stays `later-unattributed`.

Spans (`ours-extra` hunks):

1. Print vote `ours`: omitted.
2. The GCIDE paragraph holding the text is located (whole span, else span start with left context, else span start). If paragraphs of several kinds match, the priority is `wordnet`, `gcide-editor`, `supplement-1913`, then 1913 Webster, and `evidence` says so. When no paragraph is found, the survey's `gcideSource` tag is used.
3. A WordNet or editor source gives `wordnet` or `gcide-editor` whatever the vote, because the source is independent of the print. "Webster 1913 Suppl." gives `supplement-1913` (1913 text, kept and marked).
4. Otherwise a `gutenberg` vote gives `later-unattributed`, and an `unclear` vote gives `uncertain`. The `evidence` field carries the vote anchor, the score, and the OCR window.

## Known limits

- The print vote agreed with the page on 90% of 60 hand-checked rows (`survey-gutenberg/verify/REPORT.md`). Votes of `gutenberg` were right 94% of the time; about half of the sampled ours-extra rows were words Gutenberg dropped, so some `later-unattributed` spans are 1913 text.
- Spans are word-level fragments, often one word or a sense number, and several adjacent spans can belong to one added sentence.
- GCIDE tags do not mark most additions: added text often sits in "1913 Webster" paragraphs, so `later-unattributed` is the default for anything absent from the print, and `wordnet` and `gcide-editor` are undercounts.
- `uncertain` spans are mostly one-sided OCR windows. Rows with a high `score` in `evidence` are likely 1913 text.
- Entry-level trigram checks suffer from OCR errors and from entries whose print wording differs from ours.

## Using the file

Filter later additions out of a build by dropping rows by category, for example keeping `supplement-1913` and `uncertain`:

```sh
jq -c 'select(.scope=="entry" and (.category=="wordnet" or .category=="gcide-editor" or .category=="later-unattributed")) | .key' reports/dictionary-later-additions.jsonl
```

That lists whole entries to remove. For spans, group rows by `key` and apply the removal at the `owner` pointer of the parsed entry, falling back to matching `text` when `owner` is null. Take `wordnet` and `gcide-editor` first (the most reliable), then `later-unattributed`, and review `uncertain` by hand.
