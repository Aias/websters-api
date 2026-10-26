# Rendered comparison

## Match the real application

Use server-rendered HTML from the actual `EntryView` and data from the actual parser for each revision. Run each exporter from inside the snapshot or worktree whose code it renders, so `react` and `react-dom/server` resolve to a single copy. A second copy fails with an invalid hook call in `HoverLinks`. Keep raw-source edits, parsed-data changes, visible text changes, and visual-only changes distinct. A corrected source wrapper may produce identical output. An italic or subscript change may preserve every character.

Freeze Before code, source, styles, and relevant assets. Export After from final integrated code and source. Pair records through explicit old/new key mappings rather than relying on equal array lengths or sorting independently. Represent a restored entry with an absent Before value rather than borrowing a neighboring record.

Reuse the existing review viewer when it is available under `.context/dictionary-audit/`. Inspect it before adapting paths and batch data. Scratch code can contain hardcoded ports, indices, revisions, source formats, and baseline-only CSS overrides. Remove stale assumptions rather than copying them into a new batch. The viewer requirements below describe its behavior independently of those scratch files. No external skill installation is required.

Read the installed `@pierre/diffs` source and types before changing its integration. Use the pinned dependency and its public primitives instead of adding an unrelated diff engine or silently upgrading it.

## Established interaction

- Put **Rendered** first and select it by default. Keep **Text** and **JSON** modes.
- Present Before and After with accurate revision labels, an entry selector, previous/next controls, and left/right keyboard navigation through the current filtered list.
- Preserve hash navigation and a source-change filter. The filter describes raw-source changes, not every entry affected by shared rendering.
- Highlight changed characters or word fragments, not a whole paragraph for a small edit.
- Dim unchanged rendered content with exactly `filter: opacity(0.5)`. Keep changed characters, changed typography, and new or changed images undimmed.
- For visually identical output, show only **No changes** in the After pane. Keep Before available for inspection.
- Use the application's typography, tokens, and responsive treatments. Keep tool labels concise and omit explanatory interface prose.

## Font and page fidelity

Read `app/layout.tsx`, `app/globals.css`, and `app/fonts/` for the current stack. The application uses a Webster family with Old Standard regular/italic, Besley bold, and Old Standard bold italic, plus Cardo fallback. Loading only Cardo or a generic serif does not reproduce the entry.

The app applies `font-serif` in `app/layout.tsx`. Tailwind 4 emits a theme variable such as `--font-serif` only when a scanned source uses it, so a stylesheet compiled from the renderer alone falls back to the sans-serif body font. Add `@source inline('font-serif')` or scan the layout, then check that the entry pane's computed family starts with `Webster`.

Serve review CSS and font files from the same origin, or explicitly verify cross-origin font access. Wait for `document.fonts.ready`, explicitly load the required family/style/weight faces, and check their loaded status and computed family before bulk capture. A family name in CSS alone does not establish that its font loaded.

Keep before/after width, padding, font smoothing, font sizes, and baseline CSS faithful. A missing `antialiased` class or altered padding can create false weight and height changes. When sharing compiled CSS between panes, isolate actual revision differences deliberately. For a class without a baseline italic rule, inherit the appropriate parent style instead of forcing `normal` and erasing existing quotation italics. Remove previous-batch overrides once their changes are part of the new baseline. Pages that preview a reviewer's proposed patches need a stylesheet compiled from the same revision as the parser that renders them. A parser change can move presentation into CSS, as quotation styling moved to `blockquote.q`, and an older stylesheet then shows false regressions.

Compile Tailwind with both snapshot renderers and the viewer shell in its source set so neither revision loses utility styles. Keep font and illustration URLs reachable after browser navigation. If a capture wrapper or font setup is wrong, fix it and replace the affected evidence before accepting a product defect.

The app's `main` is internally scrollable. A full-page screenshot may include only the visible entry portion. Either scroll that container through the entire entry or render the same entry HTML in a full-content static page. Inspect complete images at native resolution, including every segment of a long contact sheet. For unusually tall pages, verify bottom-region pixels against the actual viewport and check overlaps for repeated earlier rows. Plausible dimensions do not prove a full-page capture is complete. Use independently captured entry or viewport images when the capture path repeats or omits content, and replace affected evidence with explicit supplemental review.

## Character-level rendered highlighting

Use `@pierre/diffs` for the actual diff, including ranges applied to Rendered. The established integration uses `parseDiffFromFile` and `renderDiffWithHighlighter` with character-level line differences. Inspect the installed API for its exact options and returned node types.

Build a deterministic text projection from both rendered trees, with deliberate block and line boundaries. Use the same projection when computing the diff and mapping offsets back to browser text nodes. If line separators are replaced for diffing, preserve offset correspondence. Assert that the compiled projection equals the browser projection before applying ranges.

Expand changed ranges to grapheme boundaries so combining accents and multi-code-unit characters are not split. Map ranges to DOM `Range` objects and native CSS highlights. Highlight decoration must preserve text, wrapping, spacing, semantic structure, and dimensions. If neutral spans are needed for dimming, verify those properties after insertion.

Dim unchanged subtrees once. Where a text node mixes changed and unchanged characters, separate only the necessary runs. Do not dim an ancestor of changed content or nest dimming elements, which compounds the opacity. Keep link hover and typography behavior intact.

Clear previous highlights and dimming state when changing entries or modes. Rebuild ranges against the current DOM rather than keeping references to detached text nodes. Fail the comparison if its text projection or range mapping does not match, instead of quietly displaying plausible highlights.

## Detect changes beyond text

Align equal text using the diff's equal ranges, then compare computed typography: family, size, style, weight, variant, line height, letter spacing, color, decoration, and vertical alignment. Mark changed typography as visible even when the raw text matches.

Compare semantic layout and non-text content too. A new illustration, a changed image or description, a table, a line arrangement, or a newly formatted quotation must not disappear behind "No changes". Exclude only proven nonsemantic decorations from structural comparison, such as an absolute `aria-hidden` border replaced with an equivalent pseudo-element. Do not broadly ignore DOM changes.

The After pane is identical only when text, relevant typography, semantic layout, and non-text content agree. A JSON difference alone does not prove a visual difference, and equal text alone does not prove visual equality.

Loaded font faces do not prove coverage of every character. Investigate a missing-glyph box with the actual font cmap and rendered glyph, including supplementary-plane symbols. Keep each pane's font bytes and CSS revision faithful. For a glyph repair, verify unchanged existing outlines and metrics, and highlight the affected glyph even when its Unicode text and computed family are unchanged. Include every key using a changed lexical style or glyph in the final recheck, not only source-edited keys.

## Verify the viewer itself

Check every selected entry programmatically after the final export:

- Decorated text equals the original rendered text, and range offsets map to the intended characters.
- Entry layout and dimensions are unchanged by highlighting or dimming.
- Each dimmed node uses `filter: opacity(0.5)`, with no nested dimming or changed descendants.
- Current highlights belong to the current panes, with no stale ranges after navigation.
- Identical After panes contain only "No changes" and have no remaining highlights.
- Typography-only changes and images remain visible, with images loaded at expected dimensions.
- Required fonts load and computed styles match the intended revisions.

Also exercise selection, filtering, hash navigation, keyboard controls, all modes, and a narrow viewport. Inspect representative short, long, notation-heavy, typography-only, restored-entry, and illustration cases. Check for horizontal overflow and complete alt text. Automated checks do not replace the entry-by-entry visual audit.

After rebuilding assets, cache-bust the viewer URL or asset URLs and verify the loaded bundle before interpreting changed-entry counts. Cached JavaScript can produce a convincing but stale result. Save the verification output and representative screenshots with the batch report, and check that every delivered local link exists and every preview URL responds.

Final visual review can overlap integration for stable entries. Capture per-entry raw, parsed, rendered, stylesheet, renderer, and font hashes. At the final export, prove that each reviewed output is unchanged and requeue every changed entry. Preserve the original capture and review records rather than silently replacing their inputs.

Reuse a validated viewer and static exports across batches when their implementation and assets match. A frozen comparison needs its source, code, fonts, exports, build inputs, and digests, without a separate SQLite copy for every pane. Keep the task-owned runtime database for live checks. Delete inactive regenerable databases or captures only after recording their hashes and regeneration inputs, checking service ownership, and preserving unresolved-reading evidence. Shared scans and active packets remain read-only. Record actual reclaimed bytes rather than planned deletions.
