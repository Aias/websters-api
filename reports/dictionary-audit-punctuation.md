# Punctuation and capitals pass

The [page-reading batches](dictionary-audit-page-reading-2.md) compare words. This pass compares what they leave out: the marks between words and the initial capital of each word. It uses the same blind readings, so no page is read again. A correction is made where both readers agree against the record and a reading of the 1898 printing confirms them.

| Pages     | Differences | Confirmed by 1898 | Drafted by rule | Kept by proofreaders | Corrections | Punctuation | Capitals | Entries | Ledger                                         |
| --------- | ----------: | ----------------: | --------------: | -------------------: | ----------: | ----------: | -------: | ------: | ---------------------------------------------- |
| 751–850   |         340 |               278 |             228 |                   19 |         209 |         163 |       46 |     189 | [jsonl](dictionary-audit-punctuation-10.jsonl) |
| 851–960   |         359 |               304 |             248 |                   28 |         220 |         168 |       52 |     190 | [jsonl](dictionary-audit-punctuation-11.jsonl) |
| 961–1060  |         429 |               349 |             282 |                   34 |         248 |         168 |       80 |     212 | [jsonl](dictionary-audit-punctuation-12.jsonl) |
| 1061–1160 |         334 |               296 |             264 |                   33 |         231 |         188 |       43 |     204 | [jsonl](dictionary-audit-punctuation-13.jsonl) |
| Total     |       1,462 |             1,227 |           1,022 |                  114 |         908 |         687 |      221 |     795 |                                                |

## Method

1. **Compare.** For each record, the words of both blind readings are aligned with the record's words. Between two neighbouring words that all three share, the marks are compared: period, comma, semicolon, colon, question and exclamation marks, quotation marks, parentheses and brackets. Dashes are not compared. The first letter of each shared word is compared for its case. A difference counts only when both readers agree with each other.
2. **Set aside what is not the print's running text.** Places inside or beside a registered later addition, entries the register lists whole, pronunciations, headwords, inflected forms, phrase headings, scientific names, formulas and small-capital abbreviations such as "a. d." are left out. So are words in small capitals inside a cross-reference, and words broken across a printed line.
3. **Confirm.** Opus reads a strip of the 1898 printing at each place, blind. The difference stands only if that reading has the same marks or the same capital as the two readers.
4. **Draft by rule.** A rule drafts the change where the gap holds only the simple marks (period, comma, semicolon, colon) or one letter changes case. It keeps the record's markup: a mark that belongs to the word on the left goes after any closing tag, and a period that ends a definition, a note or an authority goes inside that element. Other shapes are left for a later pass, and the ledger lists them.
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

## Later pages

The same pass over later pages finds the same kinds of change in about the same proportions. Added commas and periods lead, followed by commas that the print sets as semicolons. The table at the top gives the counts for each run of pages.

The proofreaders' reasons for keeping the record fall into the same groups as on pages 751 to 850. Four recurring cases are worth noting.

- **The printing lost a mark.** Where a period, the dot of a semicolon or the upper dot of a colon failed to print in both printings, the record's mark stays. Examples: "(Naut )" under Mainstay, "[Obs ]" under Pen and "E Darwin" under Preclude.
- **"Hence:" and "Specifically:" labels.** Where a later editor split a printed sentence into a new numbered sense, the record's label and capital stay, as under Matrix, Member, Overlook, Pabulum and Petition.
- **Phrase names the record spells out.** The print's "narrow, or long, pennant" is two full names in the record, so the printed commas have no place there. Pennant and Poachard are examples.
- **A confirmation from the wrong entry.** A strip sometimes shows a neighbouring entry with the same words. The proofreaders then check the change against the first scan, and it is applied only if that scan supports it, as under Primate and Prosimiae. Under Pneumatic it did not, and the record stays.

The proofreaders also found that the rule had put a closing period outside a definition's or an author's tag. The rule was changed, as step 4 now says. Where a proofreader found a change right but its drafted markup wrong, the change was redrafted by the rule or corrected by hand and then applied: 15 changes so far. Seventeen further periods that the changed rule could draft, all at the end of a definition or after an author's name or a citation, were checked by hand against the printed context and applied.

## Cost

| Step                                        | Tokens      | Model time |
| ------------------------------------------- | ----------- | ---------- |
| Readings of 1,462 strips of 1898 (Opus)     | 6.6 million | 90 minutes |
| Proofreading of 1,022 changes, eight agents | 1.4 million | 53 minutes |

No page was read again. The integrating session's own usage was not measured.

## Limits

- Dashes, italics and pronunciation marks are not compared.
- 205 confirmed differences on these pages wait for a later pass, because no rule drafts their shape. Most involve parentheses, brackets or quotation marks.
- A mark that the 1913 printing changed cannot be told from a typist's slip without the 1913 page. The ruling of 10 November 2026 treats it as a slip.
- The comparison needs both neighbouring words to agree in all three texts, so a mark beside a word difference is not compared.
