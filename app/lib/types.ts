/** Inline HTML string containing only inline markup (em, .er, .ex, etc.) */
export type InlineHTML = string;

export interface InflectedForm {
  /** POS label, e.g. "imperfect or past participle", "comparative", "superlative" */
  label: string;
  form: string;
  pronunciation: string | null;
}

export interface PluralForm {
  form: string;
  pronunciation: string | null;
}

export interface DerivedForm {
  form: string;
  partOfSpeech: string | null;
  pronunciation: string | null;
}

export interface Etymology {
  html: InlineHTML;
}

export interface Quotation {
  html: InlineHTML;
  author: string | null;
}

export interface CompoundForm {
  headwords: ReadonlyArray<string>;
  /** Full HTML of headword group including connectors ("or", ",") for display */
  headwordHtml: InlineHTML | null;
  etymology: Etymology | null;
  /** Domain label: "(Theol.)", "(Law)", etc. */
  field: string | null;
  definition: InlineHTML | null;
  mark: string | null;
  quotations: ReadonlyArray<Quotation>;
  attributions: ReadonlyArray<string>;
}

export interface Sense {
  /** "1.", "2.", "(a)", etc. — null for unnumbered senses */
  number: string | null;
  /** Domain label: "(Mus.)", "(Mar. Law)", etc. */
  field: string | null;
  definition: InlineHTML;
  /** Secondary part of speech from def2 blocks, e.g. "noun" on an adjective entry */
  partOfSpeech: string | null;
  /** "[Obs.]", "[R.]", "[Colloq.]", etc. */
  mark: string | null;
  quotations: ReadonlyArray<Quotation>;
  attributions: ReadonlyArray<string>;
  examples: InlineHTML | null;
  note: InlineHTML | null;
}

export interface Homograph {
  headword: string;
  alternateHeadwords: ReadonlyArray<string>;
  pronunciation: string | null;
  partOfSpeech: string | null;
  morphology: ReadonlyArray<InflectedForm> | null;
  pluralForms: ReadonlyArray<PluralForm> | null;
  etymology: Etymology | null;
  senses: ReadonlyArray<Sense>;
  synonyms: InlineHTML | null;
  usage: InlineHTML | null;
  compoundForms: ReadonlyArray<CompoundForm>;
  derivedForms: ReadonlyArray<DerivedForm> | null;
  alternateSpellings: ReadonlyArray<string> | null;
  note: InlineHTML | null;
}

export interface DictionaryEntry {
  key: string;
  homographs: ReadonlyArray<Homograph>;
}
