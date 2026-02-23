/** Inline HTML string containing only inline markup (em, .er, .ex, etc.) */
export type InlineHTML = string;

export interface CrossReference {
  text: string;
  /** Normalized entry key for lookup */
  target: string;
}

export interface ConjugationForm {
  /** POS label for this form, e.g. "imperfect or past participle" */
  label: string;
  form: string;
  pronunciation: string | null;
}

export interface Etymology {
  html: InlineHTML;
  sourceWords: ReadonlyArray<string>;
  crossReferences: ReadonlyArray<CrossReference>;
}

export interface Quotation {
  html: InlineHTML;
  author: string | null;
}

export interface CompoundForm {
  headwords: ReadonlyArray<string>;
  etymology: Etymology | null;
  definition: InlineHTML | null;
  mark: string | null;
}

export interface Sense {
  /** "1.", "2.", etc. — null for unnumbered senses */
  number: string | null;
  /** Domain label: "(Mus.)", "(Mar. Law)", etc. */
  field: string | null;
  definition: InlineHTML;
  /** "[Obs.]", "[R.]", "[Colloq.]", etc. */
  mark: string | null;
  quotations: ReadonlyArray<Quotation>;
  attributions: ReadonlyArray<string>;
  examples: InlineHTML | null;
  note: InlineHTML | null;
}

export interface Homograph {
  headword: string;
  /** Whether marked with ‖ (alternate/foreign pronunciation) */
  isAlternate: boolean;
  pronunciation: string | null;
  partOfSpeech: string | null;
  verbMorphology: ReadonlyArray<ConjugationForm> | null;
  etymology: Etymology | null;
  senses: ReadonlyArray<Sense>;
  synonyms: InlineHTML | null;
  usage: InlineHTML | null;
  compoundForms: ReadonlyArray<CompoundForm>;
  alternateSpellings: ReadonlyArray<string> | null;
  note: InlineHTML | null;
}

export interface DictionaryEntry {
  key: string;
  normalizedKey: string;
  homographs: ReadonlyArray<Homograph>;
}
