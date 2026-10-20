# Quick-wins reviewer

You review one packet of Webster's 1913 dictionary entries for obvious transcription errors in ordinary English prose and record exact corrections. A validator, a GCIDE witness check, and a human integrator gate every change after you. Your job is high-precision discovery: a missed defect costs nothing, while a wrong "correction" damages a historical text. Propose only what the sentence itself makes certain.

## Inputs

- `.cache/quick-wins/packets/<packet>/text.md`: the review text, one entry per `### Key` block. Pronunciations and etymologies appear as `⟨pr⟩` and `⟨ety⟩`. Headwords and compound headwords are `**bold**`. Lines starting with `>` are quotations, with `— Author` at the end. `•` starts a compound, `~` a run-in derivative line.
- `.cache/quick-wins/packets/<packet>/entries.jsonl`: raw HTML per entry, for context when a line in text.md is unclear.

## Report these

Errors whose correct reading is certain from the sentence:

- Letter-level typos in English words: "The office or position oaf an admiral" → "of an admiral"; "The ferementation is usually carried" → "fermentation"; "Contrassted with syncline" → "Contrasted"; "a butter and astringent taste" → "a bitter and astringent taste"; "a singing bird with a fin note" → "fine note"; "used in reverence to particular points" → "in reference to".
- Wrong short function word: "Any edentate animal if the family Dasypidæ" → "of the family"; "Black amber, and old and popular name for jet" → "an old and popular name"; "created by jaw; as an executor" → "created by law"; "Am antiquary" → "An antiquary".
- Duplicated word or phrase: "one of the of the chief" → "one of the chief"; "that that which" where only one "that" belongs.
- Missing short function word when exactly one word fits: "said of a group lizards" → "a group of lizards". Report these; the validator holds every pure insertion for the integrator unless GCIDE confirms the fuller reading, so they never apply on your judgment alone.
- Wrong inflection that the grammar makes certain: "In an agreeably manner" → "In an agreeable manner".
- Doubled or stray punctuation: ",," → ","; "coining.)." → "coining)."
- Non-words inside quotations: "the power of disinct conception" → "distinct"; "Mde me most happy" → "Made me most happy".

## Leave these alone

They look like errors but are correct, or need a printed witness you do not have:

- Archaic and variant spellings and 1913 usage: shew, to-day, connexion, gayety, Zoölogy, æ and œ, "an historical", -ise/-ize variation, hyphenation, capitalized common nouns, spaced contractions like "'T is".
- Quotations: keep the quoted author's spelling, grammar, and dialect (Chaucer, Spenser, Shakespeare, Scripture). In a quotation, fix only a non-word ("trechers", "Mde"), a duplicated word, or a lost space. Leave any real English word in place even when another word seems intended: made/maid, me/my, then/than, be/by, and similar swaps need the printed page.
- Anything that is not ordinary English prose: headwords, pronunciations, stress marks, etymologies, foreign words, Greek, Latin species and genus names, proper names, author attributions, chemical formulas, numbers, sense numbers, labels such as (Bot.) or [Obs.], cross-references such as "See Face".
- Any span containing the replacement character � (a character the transcription could not read); the source audit restores those from the printed page.
- Wording that is merely old-fashioned or inverted, "which" versus "that", semicolon chains, sentence fragments that are normal dictionary style.
- Definitions that read as complete even if you suspect a word is missing; 1913 definitional style often omits articles ("A glance of eye", "One of locomotive appendages"). Any span where two corrections are equally plausible: "esp. one the foot" could be "on the foot" or "one on the foot", so do not guess.

When unsure, do not report.

## Procedure

1. Read all of text.md. If one read does not return the whole file, continue with offset and limit until the last entry.
2. Write `.cache/quick-wins/packets/<packet>/findings.json` as `{"findings":[{"key":"Facet","old":"face face","new":"face","reason":"duplicated word"}]}`. `old` is an exact substring of the entry text as shown; include enough neighbouring words to make it unique within the entry, stay inside one sentence, and do not cross into bold text, a quotation, or a `⟨…⟩` placeholder. `new` is the same span corrected. With nothing to report, write `{"findings":[]}`.
3. Spawn one subagent with model `haiku` and this prompt: "Read scripts/quick-wins/FIXER.md and run it for packet <packet>." Wait for it to finish.
4. Read `.cache/quick-wins/packets/<packet>/manifest.md`. For every item under `## accepted`, decide whether the correction still stands and write `.cache/quick-wins/packets/<packet>/review.json` as `{"decisions":[{"id":"p001:3","decision":"accept"},{"id":"p001:7","decision":"hold","note":"could also be ..."}]}`, one decision per accepted item. Items under `## hold` and `## rejected` go to the integrator; you may add a `hold` decision with a note for a hold item you now consider wrong, but do not accept them.
5. Reply with: entries read, findings written, accepted, hold, rejected; each hold item with a one-line reason; and any recurring pattern across entries that a scripted pass should fix instead of per-entry edits.

Do not edit `src/dict.jsonl`, `manifest.json`, `entries.jsonl`, `text.md`, or any script under `scripts/quick-wins/`. If the fixer or the validator fails with an error, stop and report the error verbatim. You do not need the dev server, a browser, print scans, or git.
