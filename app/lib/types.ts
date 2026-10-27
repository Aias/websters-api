export type InlineHTML = string;

type HeaderTextKind = 'headword' | 'partOfSpeech' | 'text';

export type HeaderPart =
  | { [Kind in HeaderTextKind]: { kind: Kind; text: string } }[HeaderTextKind]
  | { kind: 'pronunciation'; html: InlineHTML }
  | { kind: 'forms'; html: InlineHTML }
  | { kind: 'inline'; html: InlineHTML };

export type InlineBlock =
  | {
      kind: 'text' | 'definition' | 'etymology' | 'forms' | 'synonyms' | 'usage' | 'label';
      html: InlineHTML;
    }
  | { kind: 'note'; html: InlineHTML; ownerSense?: string };

export interface Quotation {
  kind: 'quotation';
  html: InlineHTML;
  authors: ReadonlyArray<string>;
}

export interface Sense {
  kind: 'sense';
  id?: string;
  number: string;
  content: ReadonlyArray<LexicalBlock>;
}

export interface CompoundForm {
  kind: 'compound';
  id?: string;
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
  id?: string;
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

export interface Author {
  slug: string;
  name: string;
  quotationCount: number;
}

export interface QuotationOwner {
  id: string;
  label: string;
}

export interface OwnedQuotation extends Quotation {
  owner: QuotationOwner | null;
}

export interface QuotedWord {
  key: string;
  slug: string;
  quotations: ReadonlyArray<OwnedQuotation>;
}
