# Dictionary HTML parsing

`scripts/build-db.ts` converts `src/dict.jsonl` into the SQLite dictionary. `app/lib/types.ts` defines the stored shape, and `app/components/entry.tsx` renders it.

The source is stored as JSON Lines, one `{"key", "html"}` object per line, sorted by key in code-point order. `scripts/dictionary-source.ts` reads and writes the file, and a test checks that it stays in that form, so edits to different entries merge without conflicts.

## Source normalization

The parser reads the source as HTML with self-closing tags enabled. This matters for empty source wrappers such as `<div class="cs"/>`.

| Source                                 | Normalized output                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| `b`, `i`                               | `strong`, `em`                                                                     |
| `div.q`                                | `blockquote`, including quotations nested in retained HTML                         |
| Other `div`                            | `span`, because dictionary fragments are often inline                              |
| `.er`                                  | A local `/entry/…` link                                                            |
| Leading and trailing inline whitespace | Moved outside the element without removing word boundaries                         |
| Attributes                             | `class`, local entry-link `href`, and positive integer cell `colspan` survive      |
| Image attributes                       | Local illustration `src`, `alt`, and positive integer `width` and `height` survive |
| Executable containers                  | `script`, `style`, `iframe`, `object`, `embed`, and `template` are removed         |

Verifier metadata (`.ver`) and GCIDE sense pointers such as `wryneck{1}` are omitted from lexical content. Character references are decoded. Unresolved replacement characters in the source remain visible. Empty tagged pronunciation fields and nodes made only of `?`, `#`, or replacement-character alternatives are unfilled fields and are omitted from display. When such a field also cites a pronunciation-guide section, as in `(?; 277)`, only the reference remains: `(277)`. The parser does not invent missing letters or pronunciations. Spaces before punctuation are closed without changing decimal notation, spaced ellipses, or preformatted tables.

`scripts/source-typography.ts` preserves explicit table rows, cells, and spanning headers as native HTML tables. A malformed row remains in a spanning cell without assigning its text to guessed columns. Tables without cell boundaries retain their preformatted text and row breaks. Source exponent and subscript markers become `sup` and `sub`. Double breves and macrons on `oo` are encoded between the vowels so the mark spans both letters, following [Unicode's double-diacritic encoding](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-7/). In `.grk` text, a word-final σ becomes ς, and a comma written after α, η, or ω inside a word becomes that vowel's iota subscript, as in ζῷον.

`scripts/build-fonts.py` generates the bundled Webster fonts. The regular face includes the segno, fermata, cut-time, turn, and turn-up glyphs from the pinned Noto Music donor, whose license is in `app/fonts/NotoMusic-OFL.txt`. Supplementary-plane characters map only through cmap formats that support them. Existing glyph outlines, metrics, and mappings remain unchanged when adding symbols.

## Homographs and headers

A headword starts a separate homograph after lexical content has begun. Adjacent headwords, including those inside `.mhw`, share one homograph. Connective text inside an `.mhw` group, such as “Also” or “older”, stays on the header line and never starts a new homograph. Each header preserves its headwords, pronunciations, parts of speech, connectors, and interleaved inflections or qualifiers in source order. Pronunciation HTML retains italic vowel notation, and italic connectors between headwords stay italic. A usage mark such as _obs._ before a part of speech, punctuation between consecutive parts of speech, and a following “of” reference, as in “Worse, _a._, _compar._ of Bad.”, remain on the header line. Foreign-word marks remain with the displayed headword but are excluded from lookup metadata.

An attribution between a headword and a grammatical label stays inline on the header, including when a comma or semicolon separates them. An attribution after lexical content remains in the body. An unmarked whole header text node `, a.` supplies an adjective label while preserving its comma and abbreviation. The same text inside or after lexical content remains body text. A complete unwrapped parenthetical field between a headword and a grammatical label is a pronunciation, including italic vowel notation. Numeric guide references retain their header text. Bare `(?)` and `(#)` header placeholders remain unfilled and do not interrupt a following grammatical label. The same strings inside lexical content remain unchanged. A singular-use qualification followed by its plural forms stays with the header in source order.

Unknown single-marker parentheses immediately after `.conjf` inside `.vmorph` are omitted from display, like tagged placeholder-only pronunciations. Raw source remains unchanged. Partial phonetics, guide-bearing fields, and uncertainty elsewhere remain visible.

Entry references keep visible numbered-sense labels while their links target the lexical entry. A trailing comma and number inside `.er` are excluded only from the target slug. Database builds share a source-derived resolver with preprocessing. A terminal period is excluded from the target only when the dotted URL is unresolved and the undotted URL resolves. Canonical slugs, unambiguous aliases, and diaeresis fallback retain runtime lookup precedence. Greek-only etymons inside `.ety`, including those stored in `.er`, remain Greek text rather than entry links. Visible punctuation stays unchanged.

An explicit `.pos` immediately following `.er`, separated only by whitespace or a comma, qualifies that reference. A `.pos` nested at the end of `.er` after a comma does the same. The resolver compares the reference headword and normalized grammatical label with ordered parsed headers of all homographs. Consecutive headwords share following labels; a headword after a label starts a new group. When the current destination owns that exact headword and label, it remains the target. Otherwise, only one exact alternative owner can replace it. Missing or ambiguous matches retain the existing target. Unqualified references and global lookup aliases use their original precedence.

Nested `sd` markup can identify either a definition or a reference to another definition. An explicitly witnessed `data-role="definition"` marker inside `def` or `cd` opens a sibling subsense at the current sense or compound level. Unmarked nested markers remain inline. Inline fragments retain their original word joins, and marker role does not imply the scope of following notes or quotations.

For example, a masculine headword followed by its plural and a feminine headword followed by its plural keeps those associations. Lookup metadata exposes the first headword, alternate headwords, first pronunciation, and first part of speech. A record without a source headword uses its dictionary key.

## Ordered content

A homograph has an ordered `content` array. Nested senses, compound forms, and secondary sections use the same block model. Repeated blocks remain distinct instead of overwriting one another.

| Source class                                             | Block kind                  | Handling                                                                           |
| -------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| `def`, `cd`                                              | `definition`                | Inline HTML, with a space between adjacent definition fragments                    |
| `ety`                                                    | `etymology`                 | Complete etymology HTML                                                            |
| `vmorph`, `amorph`, `nmorph`, `plu`, `sing`, `wordforms` | `forms`                     | Complete inflection text, including language labels, references, and pronunciation |
| `plw`, body `pr`                                         | `forms`                     | Unwrapped form or pronunciation retained in place                                  |
| `note`, `syn`, `usage`                                   | `note`, `synonyms`, `usage` | Repeated blocks retained in order                                                  |
| Body `pos`, `fld`, `mark`                                | `label`                     | Label HTML retained at its source position                                         |
| `q`                                                      | `quotation`                 | Quotation HTML and a separate ordered author list                                  |
| `sn`, `sd`                                               | `sense`                     | Nested content under the source marker                                             |
| `col`, `mcol`                                            | `compound`                  | Headword HTML, lookup headwords, and nested content                                |
| `def2`                                                   | `section`                   | Secondary part of speech and its complete content                                  |
| `wordforms` containing definitions or headwords          | `section`                   | Derived lexical content rather than only an inflection list                        |
| Other elements and meaningful bare text                  | `text`                      | Preserved, including examples and standalone references                            |

Numeric senses contain lettered subsenses. Roman section markers contain their following senses. A repeated empty marker is collapsed while retaining its labels. Nested markers inside inline definition HTML remain visible in that HTML.

A `.cs` wrapper starts compound context, including any introductory labels or text before its first headword. Compound context continues through trailing quotations and lettered definitions outside a `.cs` wrapper. Outside a `.cs` wrapper, forms, secondary sections, notes, synonyms, and usage blocks close compound context. Run-in derivatives (`wordforms`) close an open sense when `endsHomograph` identifies a terminal derivative sequence. Forms within continuing numbered content retain that sense. Definitions and etymologies retain an active compound until an explicit boundary. Explicit `.col` and `.cd` also work without a `.cs` wrapper.

Notes and synonym lists retain their active sense unless the source marks `.note` or `.syn` with an explicit scope. A note marked `data-scope="sense:N"` names an earlier numbered sense through `ownerSense` while retaining its printed position outside the later sense. `data-scope="homograph"` places verified whole-word content outside the senses. `data-scope="sense"` closes lettered subsenses while retaining the numbered sense and also supports sense-local `.cs` compound groups. A secondary definition introduced by `.specif` extends the active sense and retains its trailing attribution. Compound etymologies remain inline with their heading and definition. Compound headings retain their outer `.col` or `.mcol` markup. Boldness comes from source `.col` spans, so conjunctions and scientific names outside them retain their own typography.

A `.col` may specify its complete lexical identity with `data-headword` when the displayed heading uses an ellipsis. An empty value suppresses a shared display fragment from compound metadata and aliases. The visible heading remains unchanged, and unannotated columns retain their literal names.

Structured quotations store authors inside `.qau` separately. An immediately following `.au`, `.qau`, or `.rj` attribution attaches to the preceding structured quotation. After a note, usage block, synonym list, or forms line, it closes that block, and it joins a quotation that ends the block. Punctuation-only text immediately after those blocks stays inside them. Other inline attributions remain in their original positions. Secondary sections retain trailing attributions with their final quotation. Quotations embedded in notes, usage and definitions retain native blockquote markup and share the same presentation as structured quotations.

The authors index groups structured quotations by author, while entries keep their printed attributions. A printed form drops any cited work, such as `Milton (Comus).`, and every scripture reference is cited as the Bible. `app/lib/author-names.json` maps each printed form, keyed by its slug, to a full name in the form of its English Wikipedia article title. Names come from the dictionary's own List of Authors Quoted (pp. vii–xvi, as transcribed in GCIDE), checked against the quotations themselves. When the dictionary prints one form for different people, a key such as `gray@Adnate` names the author of the quotation in that entry. Different people with the same name carry their life dates. Unmapped forms appear as printed.

Inline classes such as `.ets`, `.altname`, `.altnpluf`, `.member`, `.prod`, `.xex`, `.spn`, `.as`, and `.altsp` remain in the HTML. Part names marked `.part` or `.parts` retain the source tagset's italic styling. Embedded headwords in definitions and derived forms become `strong` elements rather than block headings.

## Verification

`bun test` checks normalization, source-text retention for representative dictionary entries, grouped headers, secondary definitions, nested senses, repeated content, attribution, and compound boundaries. Source-recovery tests also check the restored prefix entries and corrected extraction boundaries.

`bun run build:db:force` regenerates the database. The parser version in `build-db.ts` is part of the build fingerprint and must change when stored parser semantics change.
