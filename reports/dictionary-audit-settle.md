# Third reading of unsettled word differences

The [page-reading batches](dictionary-audit-page-reading-2.md) left 167 word differences open where both readers agreed against the record and two strips of the 1898 printing settled nothing. A taller crop of the 1898 page settles 69 of them. Together with a fresh comparison of the reordered records and the slips a proofreader noticed, this pass makes 61 corrections in 50 records. The [ledger](dictionary-audit-settle.jsonl) has a row for each.

| Source of the correction                                         | Corrections |
| ---------------------------------------------------------------- | ----------: |
| The taller 1898 crop reads as the print                          |          40 |
| A reordered record, compared again                               |          10 |
| Noticed by the proofreader beside another correction             |           9 |
| Noticed by hand (Castrate's "p. p.", Pimaric's "Pinus Pinaster") |           2 |

## The taller crop

The first two strips showed about four lines each, and the reader could not find the place in them. This time each crop shows about thirty lines around the place where the first reader found the word. Opus read each crop without seeing either text.

| Verdict of the taller crop | Differences |
| -------------------------- | ----------: |
| Reads as the print         |          55 |
| Reads as the record        |          14 |
| Still unclear              |          98 |

Of the 55, 40 became corrections. Among them are "dilatation" under Augmentation, "charged" under Brokerage, "Narthecium" under Marsh, "Larus marinus" under Gull, the missing authority Cowell under Aver, and the formula of carbonic acid, which a later editor had rewritten. The other 15 stay as they are: three are misprints in the print ("eaudate" under Acaudate, "restcration" under Refusion, "coai" under Underclay), and twelve are not differences in the words, such as a table, a figure's description, or a comparison that had lined a word up against the wrong place.

## Reordered records

The [homograph order pass](dictionary-audit-homograph-order.md) put the entries of 100 records in the printed order. The earlier word comparison had lined those records up against the print in record order, so part of each was compared with the wrong entry. Comparing them again found 33 fresh differences. Ten are corrections, each given by both readers and read by eye on a crop of the 1898 page: "Old politicians chew on wisdom past" and "a quid; a cud. [Low]" under Chew, "to countenance" under Favor, "fierce" under Mankind, "sparkling" under Exchange, "adaptation" under Specific, and others. One is a question for the person: the last sentence of Malignant's note on malignant pustule, which a later editor rewrote. The rest are later additions and phrase headings that keep the record's form.

## Proofreading

A second agent read both readers' lines and the page crop for all 59 corrections drafted to that point and found each one right. It reported nine more slips beside them, which are corrected too: the missing "walls" in Castle's figure key, the words "little loaf, a lozenge, dim. of" lost from Pastille's etymology, "three-masted" under Barkentine, a damaged form pronunciation under Crook, a missing space under Exchange, and four marks of punctuation.

## Cost

| Step                                          | Tokens      | Model time |
| --------------------------------------------- | ----------- | ---------- |
| Readings of 167 taller crops (Opus, 61 calls) | 2.8 million | 43 minutes |
| Proofreading of 59 corrections (one agent)    | 0.6 million | 18 minutes |

## Limits

- 98 differences were still unclear after three crops of the 1898 printing. [Settle-2](#settle-2) settles them.
- The fresh comparison covered only the 100 reordered records.
- The proofreader's nine finds were slips beside places it was already reading. Other entries have had no such second look at their surroundings.

## Settle-2

The 98 unclear differences were mostly not unreadable print. The verdict looked for the record's or the print's words together with their neighbours in the taller crop's transcription, and it failed where a brace paired two headings, where both page readers had dropped or repeated a line at the edge of a piece, or where the crop's reader marked a letter unreadable beside the word. Read by hand, the existing crops settle about 60. For the rest, the place is found on each printing by that printing's own recognized words, not carried over from another scan, and a column crop and a close-up are cut from the 1907 or 1895 scan, the 1898 printing and, in volume 1, the 1890 printing. Opus reads every crop twice, blind, and Fable reads the close-ups where the Opus readings differ. A second Opus agent proofread every correction. The [ledger](dictionary-audit-settle-2.jsonl) has a row for each field.

| Outcome                                                 | Differences |
| ------------------------------------------------------- | ----------: |
| Corrected                                               |          36 |
| Not a difference in the words                           |          33 |
| Both page readers dropped a line; the record is right   |           4 |
| The print is misprinted or worn; the record is right    |          13 |
| A later printing reads as the record                    |           3 |
| The 1913 typists' text reads as the record, which stays |           8 |
| Held for the person                                     |           1 |

Among the corrections are "Castanopsis" under Chinquapin, "Infected Sion's daughters" in Infect's quotation from Milton, "Mark viii. 3." under Faint, "Wherein my time, something too prodigal" under Gage, the clause Wing lost between two occurrences of "attached", the note that introduces the list of grasses under Grass, and Baltimore oriole's printed definition, "A common American bird", in place of a later rewrite. Chincona's definition, which a later editor rewrote around a registered later addition, waits on the person. A check of the rendered entries found one more slip beside a correction, a missing space in Filigrane's "filum a thread".

The printings differ more than earlier passes assumed. The 1898 printing resets Radiolaria's column to make room for Radiograph and its Röntgen rays, and it replaces Saki's last sentence with an entry for sake. The 1907 printing drops Crop's "[Obs.]", changes Abaca's "under Manilla" to "under Manila", and changes Clavier's German respelling from (klȧ-fēr′) to (klȧ-vēr′). Where the record agrees with the later printing, it stays.

The same pass settles fields from three other pools:

- **Reading holds:** eight rows close, among them Abaca's cross-reference, now "See Manila hemp under Manila" as the 1913 typists have it, and Philippic's Greek "Φιλιππικός". Five had already been restored by earlier passes. Abaca's "Manilla-hemp plant" returns to "Manila-hemp plant", because the 1913 printing evidently finished the respelling the 1907 printing began. Spleenwort's breathing (no dictionary lists ἀσπλήνιον), Eupnœa's headword (the record spells it with æ) and Clavier's header pronunciation get sharper questions. Sixteen lost-character rows wait on a printing that sets their entries.
- **Later-addition rows containing Ω:** two blind page readings confirm every restoration the record carries, character for character: Analogize (v. t.), Pelican's "fr. πέλεκυς an ax", Anatreptic, Archaeological, Boustrophedon, Didelphia, Ecumenical and Chlorite. Semeiology's printed first definition, "The science or art of signs.", replaces a later rewrite. The Greek-letter Pi is in neither the print nor the 1913 typists' text, so its whole homograph stays as a later addition.
- **Lost characters:** Clavier's note takes the 1907 respelling, and the earlier printings' form waits in the review queue. The other 17 markers have no printing at hand or printings that disagree, and each is already in the review queue.

| Step                                                      | Calls | Tokens      | List price |
| --------------------------------------------------------- | ----: | ----------- | ---------: |
| Opus readings of 145 crops in six waves, and proofreading |    43 | 2.3 million |      $8.56 |
| Fable readings of 13 close-ups                            |     3 | 0.1 million |      $0.75 |
