# Punctuation and capitals pass

The [page-reading batches](dictionary-audit-page-reading-2.md) compare words. This pass compares what they leave out: the marks between words and the initial capital of each word. It uses the same blind readings, so no page is read again. A correction is made where both readers agree against the record and a reading of the 1898 printing confirms them.

| Pages     | Differences | Confirmed by 1898 | Drafted by rule | Kept by proofreaders | Corrections | Punctuation | Capitals | Entries | Ledger                                         |
| --------- | ----------: | ----------------: | --------------: | -------------------: | ----------: | ----------: | -------: | ------: | ---------------------------------------------- |
| 151–250   |         865 |               805 |             768 |                   11 |         757 |         576 |      181 |     544 | [jsonl](dictionary-audit-punctuation-4.jsonl)  |
| 251–350   |         591 |               518 |             479 |                    4 |         475 |         382 |       93 |     379 | [jsonl](dictionary-audit-punctuation-5.jsonl)  |
| 351–450   |         351 |               277 |             263 |                   11 |         252 |         202 |       50 |     217 | [jsonl](dictionary-audit-punctuation-6.jsonl)  |
| 451–550   |         437 |               373 |             330 |                    3 |         327 |         253 |       74 |     258 | [jsonl](dictionary-audit-punctuation-7.jsonl)  |
| 551–650   |         589 |               529 |             499 |                   16 |         483 |         401 |       82 |     354 | [jsonl](dictionary-audit-punctuation-8.jsonl)  |
| 651–750   |         339 |               288 |             266 |                    5 |         261 |         228 |       33 |     207 | [jsonl](dictionary-audit-punctuation-9.jsonl)  |
| 751–850   |         340 |               278 |             243 |                   19 |         224 |         178 |       46 |     199 | [jsonl](dictionary-audit-punctuation-10.jsonl) |
| 851–960   |         359 |               304 |             265 |                   28 |         237 |         185 |       52 |     205 | [jsonl](dictionary-audit-punctuation-11.jsonl) |
| 961–1060  |         429 |               349 |             308 |                   35 |         273 |         193 |       80 |     232 | [jsonl](dictionary-audit-punctuation-12.jsonl) |
| 1061–1160 |         334 |               296 |             278 |                   33 |         245 |         202 |       43 |     215 | [jsonl](dictionary-audit-punctuation-13.jsonl) |
| 1161–1260 |         421 |               368 |             335 |                   22 |         313 |         204 |      109 |     257 | [jsonl](dictionary-audit-punctuation-14.jsonl) |
| Total     |       5,055 |             4,385 |           4,034 |                  187 |       3,847 |       3,004 |      843 |   3,067 |                                                |

## Method

1. **Compare.** For each record, the words of both blind readings are aligned with the record's words. Between two neighbouring words that all three share, the marks are compared: period, comma, semicolon, colon, question and exclamation marks, quotation marks, parentheses and brackets. Dashes are not compared. The first letter of each shared word is compared for its case. A difference counts only when both readers agree with each other.
2. **Set aside what is not the print's running text.** Places inside or beside a registered later addition, entries the register lists whole, pronunciations, headwords, inflected forms, phrase headings, scientific names, formulas and small-capital abbreviations such as "a. d." are left out. So are words in small capitals inside a cross-reference, and words broken across a printed line.
3. **Confirm.** Opus reads a strip of the 1898 printing at each place, blind. The difference stands only if that reading has the same marks or the same capital as the two readers.
4. **Draft by rule.** A rule drafts the change where simple marks (period, comma, semicolon, colon) are added, removed or exchanged, where a period, question mark or exclamation mark replaces another, or where one letter changes case. A simple mark may also be added beside a parenthesis, a bracket or a closing quotation mark, and at the end of a verse line. The rule keeps the record's markup: a mark that belongs to the word on the left goes after any closing tag, a period that ends a definition, a note or an authority goes inside that element, and the space after a removed mark stays inside the closing tag. Other shapes are left for a later pass, and the ledger lists them.
5. **Proofread.** Reviewers who did not draft the changes read every one against the printed context and the 1898 reading. They report a change when the print is wrong, when it would damage the text or markup, when the difference is the record's own convention, or when the place lies in text a later editor rewrote. A reported change is not applied.
6. **Apply.** The remaining changes are applied by position against a hash of each record.

The 1913 typists' text usually reads as the record at these places, because the typists dropped and swapped marks often. Under the ruling of 10 November 2026 the print wins where both readers and the 1898 printing agree.

## Pages 751 to 850

The comparison found 340 differences: 260 in punctuation and 80 in capitals. The 1898 printing confirmed 278. For 16 it reads as the record, and for 46 the place was not found in the strip. A rule drafted 228 of the confirmed differences and left 50 whose shape it does not handle. Two proofreaders read the 228 and reported 22. Nineteen of those keep the record, and three low-confidence doubts were applied.

**209 corrections in 189 entries: 163 in punctuation and 46 in capitals.**

| Change                    | Corrections |
| ------------------------- | ----------: |
| Comma added               |          37 |
| Period added              |          23 |
| Comma removed             |          17 |
| Comma to period           |          11 |
| Comma to semicolon        |          11 |
| Semicolon to colon        |          10 |
| Period to comma           |          10 |
| Period removed            |           7 |
| Other punctuation changes |          37 |
| Capital or lowercase      |          46 |

Examples: Jointing "long, straight", Inquisitorial "Inquisition, or", Judge "court-martial: he", Kobold's etymology closes with a period, Italian and Lazar gain the comma after a phrase heading, and Irish "Īrisc" takes its capital. Several verse quotations lose or change the mark at a line end, as under Lead and Just.

The typists' text reads as the record at 182 of the 209 places, as the print at 15, and was not matched at 12.

**Kept by the proofreaders (19):**

- **Later rewrites:** Index, Iron, Knowledge, Lamellibranch, Levogyrate and Liberalize, where the printed mark no longer fits the record's wording.
- **The record's conventions:** "a. d." in small capitals under Indiction, the label "Hence:" under Jargon, and a phrase name the record spells out under Lead.
- **The print is wrong:** a sense number without its period under Infancy and Knop, a comma before a new sentence under King, and "as" without its comma under Lean.
- **The rule's output was wrong:** two ellipsis changes under Indifference, one of a pair of commas under Kamichi, and a period set outside the author's tag under Lacunar.

The second pass described below adds 15 corrections on these pages. The table at the top includes them.

## Other pages

The same pass over the other pages finds the same kinds of change in about the same proportions. Added commas and periods lead, followed by commas that the print sets as semicolons. The table at the top gives the counts for each run of pages.

The proofreaders' reasons for keeping the record fall into the same groups as on pages 751 to 850. Five recurring cases are worth noting.

- **The printing lost a mark.** Where a period, the dot of a semicolon or the upper dot of a colon failed to print in both printings, the record's mark stays. Examples: "(Naut )" under Mainstay, "[Obs ]" under Pen and "E Darwin" under Preclude.
- **"Hence:" and "Specifically:" labels.** Where a later editor split a printed sentence into a new numbered sense, the record's label and capital stay, as under Matrix, Member, Overlook, Pabulum and Petition.
- **Phrase names the record spells out.** The print's "narrow, or long, pennant" is two full names in the record, so the printed commas have no place there. Pennant and Poachard are examples.
- **A confirmation from the wrong entry.** A strip sometimes shows a neighbouring entry with the same words. The proofreaders then check the change against the first scan, and it is applied only if that scan supports it, as under Primate and Prosimiae. Under Pneumatic it did not, and the record stays.
- **Printed figures.** Under Figurate the print shows triangles of dots, which the record writes as periods. The readers pass over the figure, so the record stays.

The proofreaders also found that the rule had put a closing period outside a definition's or an author's tag. The rule was changed, as step 4 now says. Where a proofreader found a change right but its drafted markup wrong, the change was redrafted by the rule or corrected by hand and then applied: 63 changes so far. Eighteen further marks that the changed rule could draft, all at the end of a definition or an etymology or after an author's name or a citation, were checked by hand against the printed context and applied. One hand correction also removes a stray word beside the mark: Corselet read "as, the body breastplate" where the print has "as the breastplate".

**Second pass.** At first the rule drafted only simple marks added, removed or exchanged in a gap that held nothing else. It was then extended to the other shapes step 4 lists. A second pass over pages 751 to 1160 drafted 72 more changes from the confirmed differences the first pass had left. A proofreader read all 72 and kept one, under Nightmare, where a later editor rewrote the sentence. The other pages were drafted once, with the extended rule.

## Cost

| Step                                     | Tokens       | Model time |
| ---------------------------------------- | ------------ | ---------- |
| Readings of 5,055 strips of 1898 (Opus)  | 22.6 million | 5.0 hours  |
| Proofreading of 4,016 changes, 34 agents | 5.9 million  | 3.4 hours  |

No page was read again. The integrating session's own usage was not measured.

## Limits

- Dashes, italics and pronunciation marks are not compared.
- 351 confirmed differences on these pages wait for a later pass, because no rule drafts their shape. Most involve a parenthesis, bracket or quotation mark that only one text has.
- A mark that the 1913 printing changed cannot be told from a typist's slip without the 1913 page. The ruling of 10 November 2026 treats it as a slip.
- The comparison needs both neighbouring words to agree in all three texts, so a mark beside a word difference is not compared.
