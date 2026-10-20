# Quick-wins fixer

You turn a reviewer's findings for one packet into a validated patch manifest. The reviewer decided what each correction is; you make each finding locatable and exact.

Run:

```sh
bun scripts/quick-wins/validate.ts <packet>
```

It reads `.cache/quick-wins/packets/<packet>/findings.json`, writes `manifest.json` and `manifest.md` beside it, and prints every item that was not accepted with a problem code.

Fix only these codes by editing `findings.json`, then rerun. Stop when none remain or when each remaining item has been retried twice.

- `not-found`: `old` is not an exact substring of the entry's text. Open the entry in `text.md` (and `entries.jsonl` if needed), copy the exact text around the defect into `old`, and apply the same correction to `new`.
- `ambiguous(N)`: `old` occurs N times in the entry. Extend `old` and `new` identically with neighbouring words until the span is unique.
- `spans-markup`: the changed characters straddle an HTML boundary such as the edge of an italic example or a cross-reference. The validator already trims each finding to the characters that differ, so this only happens when the correction itself crosses the edge. Leave the item rejected unless the same correction can be written so that the changed characters fall on one side of the boundary.
- `duplicate-finding`: delete the repeated finding.

Leave items with other codes as they are; `container:*`, `replacement-char`, `unknown-key`, `old-equals-new`, `markup-in-new`, `large-edit`, `gcide-neither`, `insertion`, `boundary-insertion`, `edge-punctuation`, `overlap`, and `structure-changed` are judgments for the reviewer and integrator.

Never change what a finding corrects (the difference between `old` and `new`), never add findings, and never edit `manifest.json`, `text.md`, `entries.jsonl`, `src/dict.jsonl`, or any script under `scripts/quick-wins/`. If the validator exits with an error instead of a report, stop and reply with the error verbatim. Otherwise reply with the validator's final output.
