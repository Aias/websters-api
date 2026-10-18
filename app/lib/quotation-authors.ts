import authorNames from './author-names.json';
import { slugify } from './slug';
import type { DictionaryEntry, LexicalBlock, Quotation } from './types';

const SCRIPTURE =
  /^(?:(?:[1-4I]\.?\s*)?[A-Z][a-z]+\.?\s*(?:[ivxlcdm]+|\d+)(?:[.:,]\s*|\s+)\d+|(?:[23]\.?\s*John|Jude|Obad|Ob|Philem|Phil)\.?\s+\d+)/;

const AUTHOR_NAMES = new Map(Object.entries(authorNames));

function terminate(attribution: string): string {
  return attribution.replace(/[\s.,;:]*$/, '.');
}

export function quotationAuthor(attribution: string, entryKey: string) {
  const stripped = terminate(attribution.replace(/\s*(?:[([]|,\s*\d{4}\b).*/, ''));
  const cited = SCRIPTURE.test(stripped) ? 'Bible.' : stripped;
  const form = slugify(cited.replace(/\./g, ''));
  const name = AUTHOR_NAMES.get(`${form}@${entryKey}`) ?? AUTHOR_NAMES.get(form) ?? cited;
  return {
    slug: slugify(name.replace(/–/g, '-').replace(/\./g, '')),
    name,
    cited,
    citation: terminate(attribution) === cited ? null : attribution,
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
    .flatMap(({ html, authors }) =>
      authors.map((author) => ({ ...quotationAuthor(author, entry.key), html }))
    )
    .filter(({ slug }) => slug);
}
