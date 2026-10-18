export type InlineHTML = string;

type HeaderTextKind = 'headword' | 'partOfSpeech' | 'text';

export type HeaderPart =
  | { [Kind in HeaderTextKind]: { kind: Kind; text: string } }[HeaderTextKind]
  | { kind: 'pronunciation'; html: InlineHTML }
  | { kind: 'forms'; html: InlineHTML }
  | { kind: 'inline'; html: InlineHTML };

export interface InlineBlock {
  kind: 'text' | 'definition' | 'etymology' | 'forms' | 'note' | 'synonyms' | 'usage' | 'label';
  html: InlineHTML;
}

export interface Quotation {
  kind: 'quotation';
  html: InlineHTML;
  authors: ReadonlyArray<string>;
}

export interface Sense {
  kind: 'sense';
  number: string;
  content: ReadonlyArray<LexicalBlock>;
}

export interface CompoundForm {
  kind: 'compound';
  headwords: ReadonlyArray<string>;
  headwordHtml: InlineHTML;
  content: ReadonlyArray<LexicalBlock>;
}

export interface LexicalSection {
  kind: 'section';
  content: ReadonlyArray<LexicalBlock>;
}

export type LexicalBlock = InlineBlock | Quotation | Sense | CompoundForm | LexicalSection;

export interface Homograph {
  headword: string;
  alternateHeadwords: ReadonlyArray<string>;
  pronunciation: string | null;
  partOfSpeech: string | null;
  header: ReadonlyArray<HeaderPart>;
  content: ReadonlyArray<LexicalBlock>;
}

export interface DictionaryEntry {
  key: string;
  slug: string;
  homographs: ReadonlyArray<Homograph>;
}

export interface SearchResult {
  key: string;
  slug: string;
  partOfSpeech: string | null;
}
