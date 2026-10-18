# Dictionary HTML parsing

`scripts/build-db.ts` converts `src/dict.json` into the SQLite dictionary. `app/lib/types.ts` defines the stored shape, and `app/components/entry.tsx` renders it.

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

Verifier metadata (`.ver`) is omitted from lexical content. Character references are decoded. Unresolved replacement characters in the source remain visible. Pronunciation nodes containing only `(?)` or `(#)` are unfilled fields and are omitted from display. The parser does not invent missing letters or pronunciations. Spaces before punctuation are closed without changing decimal notation, spaced ellipses, or preformatted tables.

`scripts/source-typography.ts` preserves explicit table rows, cells, and spanning headers as native HTML tables. A malformed row remains in a spanning cell without assigning its text to guessed columns. Tables without cell boundaries retain their preformatted text and row breaks. Source exponent and subscript markers become `sup` and `sub`. Double breves and macrons on `oo` are encoded between the vowels so the mark spans both letters, following [Unicode's double-diacritic encoding](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-7/).

## Homographs and headers

A headword starts a separate homograph after lexical content has begun. Adjacent headwords, including those inside `.mhw`, share one homograph. Each header preserves its headwords, pronunciations, parts of speech, connectors, and interleaved inflections or qualifiers in source order. Pronunciation HTML retains italic vowel notation. Foreign-word marks remain with the displayed headword but are excluded from lookup metadata.

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

A `.cs` wrapper starts compound context, including any introductory labels or text before its first headword. Compound context continues through trailing quotations and lettered definitions outside a `.cs` wrapper. Root forms, secondary sections, notes, synonyms, and usage blocks resume root content. Definitions and etymologies retain an active compound until an explicit boundary. Explicit `.col` and `.cd` also work without a `.cs` wrapper.

Notes and synonym lists retain their active sense unless the source explicitly marks `.note` or `.syn` with `data-scope="homograph"`. This annotation is for verified whole-word content, not a guess based on its position after the final sense. Compound etymologies remain inline with their heading and definition.

Structured quotations store authors inside `.qau` separately. An immediately following `.au`, `.qau`, or `.rj` attribution attaches to the preceding structured quotation. Other inline attributions remain in their original positions. Secondary sections retain trailing attributions with their final quotation. Quotations embedded in notes, usage and definitions retain native blockquote markup and share the same presentation as structured quotations.

Inline classes such as `.ets`, `.altname`, `.altnpluf`, `.member`, `.prod`, `.xex`, `.spn`, `.as`, and `.altsp` remain in the HTML. Embedded headwords in definitions and derived forms become `strong` elements rather than block headings.

## Verification

`bun test` checks normalization, source-text retention for representative dictionary entries, grouped headers, secondary definitions, nested senses, repeated content, attribution, and compound boundaries. Source-recovery tests also check the restored prefix entries and corrected extraction boundaries.

`bun run build:db:force` regenerates the database. The parser version in `build-db.ts` is part of the build fingerprint and must change when stored parser semantics change.
