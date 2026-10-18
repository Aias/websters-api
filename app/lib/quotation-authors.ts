import { slugify } from './slug';
import type { DictionaryEntry, LexicalBlock, Quotation } from './types';

const SCRIPTURE =
  /^(?:(?:[1-4I]\.?\s*)?[A-Z][a-z]+\.?\s*(?:[ivxlcdm]+|\d+)(?:[.:,]\s*|\s+)\d+|(?:[23]\.?\s*John|Jude|Obad|Ob|Philem|Phil)\.?\s+\d+)/;

function terminate(attribution: string): string {
  return attribution.replace(/[\s.,;:]*$/, '.');
}

export function quotationAuthor(attribution: string) {
  const cited = terminate(attribution.replace(/\s*(?:[([]|,\s*\d{4}\b).*/, ''));
  const name = SCRIPTURE.test(cited) ? 'Bible.' : cited;
  return {
    slug: slugify(name.replace(/\./g, '')),
    name,
    citation: terminate(attribution) === name ? null : attribution,
  };
}

function* quotations(content: ReadonlyArray<LexicalBlock>): Generator<Quotation> {
  for (const block of content) {
    if (block.kind === 'quotation') yield block;
    else if ('content' in block) yield* quotations(block.content);
  }
}

export function entryQuotations(entry: DictionaryEntry) {
  return entry.homographs
    .flatMap((homograph) => [...quotations(homograph.content)])
    .flatMap(({ html, authors }) => authors.map((author) => ({ ...quotationAuthor(author), html })))
    .filter(({ slug }) => slug);
}
