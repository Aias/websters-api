# Definition-5 print reconciliation

This targeted review makes 58 witnessed corrections across 30 existing entries. It resolves 33 held fields: 30 whole-definition or structural holds, plus Witchcraft's pronunciation, Kill's missing paragraphs and Opposite's adjective senses. All accepted targets have print, parsed-ownership, browser-text and visual verification. This review adds no complete-entry audit credit.

The [acceptance ledger](dictionary-audit-definition-5.jsonl) preserves each exact replacement, frozen raw hash, lexical owner, source page, reader identities and acceptance path. It distinguishes 49 independent agreements from nine source adjudications. The adjudications retain the original reader hashes and use two fresh confirming readers. No accepted edit remains held or was reversed after integration.

## Scope and witnesses

The primary packets contain 48 targets, divided 10/10/9/10/9. Their readers agreed directly on 39. Nine differences required adjudication. Final review found ten additional defects, which received separate paired readings and final checks. One proposed Flesh worm correction from the initial final review differed from both fresh readings. The accepted wording follows the native page and the two matching readings, with another final check confirming it.

The native witnesses are Webster's International Dictionary, [volume 1, 1907](https://archive.org/details/webstersinternat01webs), and [volume 2, 1895](https://archive.org/details/webstersinternat02websuoft). These are related printings used under the recorded editorial rulings. GCIDE and Gutenberg supply electronic context. Their shared ancestry does not count as independent print evidence.

| Entry        | Native page / printed page | Accepted targets |
| ------------ | -------------------------- | ---------------: |
| Antarthritic | v1-n167 / 62               |                2 |
| Bacterium    | v1-n216 / 111              |                1 |
| Developer    | v1-n507 / 402              |                2 |
| Feast        | v1-n653 / 548              |                1 |
| Ferment      | v1-n657 / 552              |                2 |
| Flesh        | v1-n674 / 569              |                4 |
| Fleshpot     | v1-n675 / 570              |                2 |
| Home         | v1-n805 / 700              |                1 |
| Keratin      | v1-n916 / 811              |                2 |
| Kill         | v1-n918 / 813              |                1 |
| Lime         | v1-n959 / 854              |                1 |
| Lode         | v1-n970 / 865              |                1 |
| Magnetism    | v1-n987 / 882              |                3 |
| Mizzenmast   | v1-n1038 / 933             |                2 |
| Naked        | v2-n8 / 961                |                2 |
| Nascent      | v2-n10 / 963               |                2 |
| Nondescript  | v2-n27 / 980               |                2 |
| Observable   | v2-n39 / 992               |                2 |
| Opposite     | v2-n54 / 1007              |                2 |
| Phenol       | v2-n123 / 1076             |                1 |
| Sclerosis    | v2-n335 / 1288             |                3 |
| Switch       | v2-n507 / 1460             |                4 |
| Sylvanite    | v2-n508 / 1461             |                2 |
| Teache       | v2-n525 / 1478             |                2 |
| Tin          | v2-n557 / 1510             |                2 |
| Undulatory   | v2-n619 / 1572             |                2 |
| Urethane     | v2-n633 / 1586             |                2 |
| Veinstone    | v2-n645 / 1598             |                2 |
| Vortex       | v2-n666 / 1619             |                2 |
| Witchcraft   | v2-n706 / 1659             |                1 |

The changes include 18 pronunciation targets, five sense-structure targets, two etymologies, Sclerosis's lost Greek word, Kill's compound and synonym paragraphs, and whole definitions or notes. Separate later additions remain, including Developer's Dyeing sense, Mizzenmast's PJC note and Teache's etymology commentary. The [decisions report](dictionary-audit-decisions.md) explains the disputed readings and note boundaries.

## Verification

Replaying all accepted edits from revision `de63cd496a8826f2f48d8038862d9bd0ba73d1e1` reproduces the final source exactly. The corpus retains 100,803 keys, with exactly the 30 rows above changed and no additions or removals.

- Frozen source SHA-256: `d36a956339aefc847f5f94d28d8939a3aebd05c799b59abfa1114f6b22c45d1b`.
- Final source SHA-256: `19ec7e5841c63fd98c77956757e68fca490c37784d8fe2366745634f5fc8d7fd`.

Raw-to-preprocessed and preprocessed-to-parsed comparisons retain exact text and ownership differences for review. No new unexplained loss, duplication, word join or ownership change remains. The complete lookup comparison preserves every canonical destination and introduces no new ambiguity. The alias `to kill time` and route `to_kill_time` move from Time to Kill after restoration of the printed compound.

The canonical database and production build complete. All 354 tests pass, and `bun check` completes. The running production app matches the reviewed text and element markup for all 30 entries, allowing only React's empty text-boundary comments. Runtime navigation verifies the Kill alias and Flesh's repaired Blowfly reference. Desktop and narrow comparison checks cover all 30 entries, including the Rendered, Text and JSON modes. Final reviewers inspect every affected rendered entry and its matching native target crops.

The [local comparison](http://127.0.0.1:56521/) uses the frozen baseline and final source. Its screenshots are `.context/dictionary-audit/definition-5-preview/desktop-final.png` and `narrow-final.png`. Production screenshots and verification receipts are in `.context/dictionary-audit/definition-5-control/`. Original readings, native crop receipts and per-packet final reviews remain in `.context/dictionary-audit/exhaustive/definition-5/` and the `definition-5-fixes`, `definition-5-noun` and `definition-5-final-fixes` directories.

## Remaining work

The holds register contains 150 unresolved fields after these 33 resolutions. Inflection-list pronunciations remain outside this batch, including Switched. No other finding from this batch remains unresolved.

The later-additions register loses 38 rows whose text these restorations remove, plus one stale Lime row already absent from the baseline. Kill's retained Kipling quotation receives its current parsed owner pointer. Other retained classifications stay in place.

The primary packet size remains close to senses-3's 38 targets over four packets. This batch uses configured Astra high readers and an Astra extra-high adjudicator. Reader token telemetry is unavailable, so the results do not establish a cost or speed comparison. Subsequent work can address the existing evidence and Greek-reading holds, missing supplement entries, or further sense-structure candidates. No new range is claimed by this report.
