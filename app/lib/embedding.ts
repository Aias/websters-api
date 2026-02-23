import type { DictionaryEntry } from './types';

export const EMBEDDING_MODEL_ID = 'Xenova/paraphrase-MiniLM-L3-v2';
export const EMBEDDING_DIMENSIONS = 384;
const MAX_EMBEDDING_TEXT_LENGTH = 256;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function stripInlineHtml(value: string): string {
  return normalizeWhitespace(
    value
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
  );
}

function firstDefinitionText(entry: DictionaryEntry): string {
  for (const homograph of entry.homographs) {
    const firstSense = homograph.senses[0];
    if (firstSense?.definition) {
      return stripInlineHtml(firstSense.definition);
    }
  }
  return '';
}

function toBoundedText(parts: ReadonlyArray<string>): string {
  const text = normalizeWhitespace(parts.filter((part) => part.length > 0).join(' '));
  return text.slice(0, MAX_EMBEDDING_TEXT_LENGTH);
}

export function entryToEmbeddingText(entry: DictionaryEntry): string {
  const firstHomograph = entry.homographs[0];
  return toBoundedText([
    firstHomograph?.headword ?? entry.key,
    firstHomograph?.partOfSpeech ?? '',
    firstDefinitionText(entry),
  ]);
}

export function queryToEmbeddingText(query: string): string {
  return toBoundedText([query]);
}

export function vectorToSqlLiteral(vector: ReadonlyArray<number>): string {
  return `[${vector.join(',')}]`;
}
