# Dictionary HTML Parsing Reference

This document catalogs every CSS class found in the source dictionary HTML (`src/dict.json`) and how `build-db.ts` handles it.

## Preprocessing

Before structural parsing, `loadPreprocessedDocument` normalizes the raw HTML:

| Transform                       | Description                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `<b>` → `<strong>`              | Semantic bold                                                                   |
| `<i>` → `<em>`                  | Semantic emphasis                                                               |
| `<div>` → `<span>`              | Avoid invalid block-in-inline nesting                                           |
| `.er` → `<a href="/entry/...">` | Cross-reference links                                                           |
| Attribute stripping             | Only `class` and safe `href` retained; `on*`, `style`, `srcdoc` removed         |
| Script removal                  | `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, `<template>` stripped |
| Character normalization         | Replacement characters (`U+FFFD`) and `d:priority` attributes removed           |

## Top-Level Structural Classes

These classes appear as direct children of the entry root and are parsed by `parseHomograph` (or `parseEntry` for splitting).

### Entry Splitting

| Class | Element  | Handler                 | Type Field                                            |
| ----- | -------- | ----------------------- | ----------------------------------------------------- |
| `hw`  | `<h2>`   | `parseEntry` split loop | `Homograph.headword`                                  |
| `mhw` | `<span>` | `parseEntry` split loop | First `h2.hw` → headword, rest → `alternateHeadwords` |

### Header Fields

| Class    | Handler                           | Type Field                     | Notes                                           |
| -------- | --------------------------------- | ------------------------------ | ----------------------------------------------- |
| `pr`     | Inline (header only)              | `Homograph.pronunciation`      | First occurrence only, while `inHeader` is true |
| `pos`    | Inline (header only)              | `Homograph.partOfSpeech`       | First occurrence only, while `inHeader` is true |
| `ety`    | `parseEtymology()`                | `Homograph.etymology`          | Raw inline HTML is preserved for rendering      |
| `vmorph` | `parseMorphology($, el, 'conjf')` | `Homograph.morphology`         | Verb conjugation forms                          |
| `amorph` | `parseMorphology($, el, 'adjf')`  | `Homograph.morphology`         | Adjective inflection forms                      |
| `plu`    | `parsePluralForms()`              | `Homograph.pluralForms`        | Contains `.plw` (plural word) + optional `.pr`  |
| `altsp`  | Inline                            | `Homograph.alternateSpellings` | Contains `.asp` children                        |

### Sense-Level Classes

| Class  | Handler                    | Type Field                             | Notes                                                               |
| ------ | -------------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| `sn`   | `handleSenseNumber()`      | `Sense.number`                         | Sense delimiter — flushes previous sense                            |
| `sd`   | `handleSenseNumber()`      | `Sense.number`                         | Sub-definition label — acts like `sn`                               |
| `def`  | Inline                     | `Sense.definition`                     | Inner HTML preserved via `getHtml()`                                |
| `def2` | Inline (children iterated) | Multiple senses + `Sense.partOfSpeech` | Secondary POS block; POS applied retroactively to all senses within |
| `fld`  | Inline                     | `Sense.field`                          | Field/domain label (e.g., "Arch.", "Bot.")                          |
| `mark` | Inline                     | `Sense.mark`                           | Usage mark (e.g., "Obs.", "R.")                                     |
| `q`    | `parseQuotation()`         | `Sense.quotations[]`                   | Contains `.qau` (author)                                            |
| `au`   | Inline                     | `Sense.attributions[]`                 | Standalone attribution                                              |
| `rj`   | Inline                     | `Sense.attributions[]`                 | Right-justified wrapper, typically contains `.au`                   |
| `as`   | Inline                     | `Sense.examples`                       | Example phrases; inner HTML preserved                               |
| `note` | Inline                     | `Sense.note` or `Homograph.note`       | Context-dependent placement                                         |

### Homograph-Level Blocks

| Class       | Handler                | Type Field                  | Notes                                  |
| ----------- | ---------------------- | --------------------------- | -------------------------------------- |
| `syn`       | Inline                 | `Homograph.synonyms`        | Inner HTML preserved                   |
| `usage`     | Inline                 | `Homograph.usage`           | Inner HTML preserved                   |
| `cs`        | `parseCompoundForms()` | `Homograph.compoundForms[]` | Compound/phrasal entries               |
| `wordforms` | `parseDerivedForms()`  | `Homograph.derivedForms`    | Contains `.wf`, `.pos`, `.pr` children |

## Compound Form Classes (inside `.cs`)

Parsed by `parseCompoundForms`:

| Class  | Handler                     | Type Field                                                 | Notes                                                             |
| ------ | --------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| `mcol` | Flush + headword extraction | `CompoundForm.headwordHtml`, `.headwords[]`                | Multi-column headword wrapper; contains `.col` children           |
| `col`  | Inline                      | `CompoundForm.headwords[]`                                 | Single headword; triggers flush if definition pending             |
| `cd`   | Inline                      | `CompoundForm.definition`                                  | Compound definition; deferred flush allows quotation accumulation |
| `ety`  | `parseEtymology()`          | `CompoundForm.etymology`                                   |                                                                   |
| `mark` | Inline                      | `CompoundForm.mark`                                        | Attaches to previous form if no pending state                     |
| `sd`   | Flush trigger               | —                                                          | Sub-definition label within compound forms                        |
| `q`    | `parseQuotation()`          | `CompoundForm.quotations[]`                                |                                                                   |
| `au`   | Inline                      | Author on last quotation, or `CompoundForm.attributions[]` |                                                                   |
| `rj`   | Inline                      | Same as `au`                                               | Right-justified attribution wrapper                               |

## Nested Inline Classes

These classes appear inside containers (`.def`, `.q`, `.ety`, `.as`, `.syn`, etc.) and are preserved as-is in the `InlineHTML` string via `getHtml()`. They do not need dedicated handlers.

| Class     | Meaning                                 | Example Container            |
| --------- | --------------------------------------- | ---------------------------- |
| `er`      | Cross-reference (preprocessed to `<a>`) | `.def`, `.q`, `.syn`, `.ety` |
| `ets`     | Etymology source word                   | `.ety`                       |
| `xex`     | Example word in context                 | `.def`, `.q`                 |
| `specif`  | Specifically                            | `.def`                       |
| `stype`   | Sense type qualifier                    | `.def`                       |
| `spn`     | Species name (Latin)                    | `.def`                       |
| `gen`     | Genus name                              | `.def`                       |
| `fam`     | Family name                             | `.def`                       |
| `chform`  | Chemical formula                        | `.def`                       |
| `ant`     | Antonym                                 | `.syn`                       |
| `cref`    | Cross-reference phrase                  | `.def`, `.syn`               |
| `altname` | Alternate name                          | `.def`                       |
| `table`   | Tabular data                            | `.def`                       |
| `qau`     | Quotation author                        | `.q`                         |

## Catch-All Behavior

Any top-level element not matching a recognized class is handled by the catch-all at the end of `parseHomograph`:

```typescript
// Catch-all: unrecognized element — preserve as inline content
if (currentSense) {
  currentSense.appendToDefinition(getOuterHtml($, el));
}
```

This preserves the element's outer HTML (including its tag and attributes) as part of the current sense definition, preventing silent data loss.

## Morphology Sub-Classes

Used inside `.vmorph` and `.amorph`, parsed by `parseMorphology`:

| Class   | Meaning                                      |
| ------- | -------------------------------------------- |
| `conjf` | Verb conjugation form (inside `.vmorph`)     |
| `adjf`  | Adjective inflection form (inside `.amorph`) |
| `pos`   | Part-of-speech label for the following forms |
| `pr`    | Pronunciation (adjacent to form)             |

## Derived Form Sub-Classes

Used inside `.wordforms`, parsed by `parseDerivedForms`:

| Class | Meaning                                |
| ----- | -------------------------------------- |
| `wf`  | Word form                              |
| `pos` | Part of speech for preceding word form |
| `pr`  | Pronunciation                          |

## Plural Form Sub-Classes

Used inside `.plu`, parsed by `parsePluralForms`:

| Class | Meaning          |
| ----- | ---------------- |
| `plw` | Plural word form |
| `pr`  | Pronunciation    |
