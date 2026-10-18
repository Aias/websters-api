import * as cheerio from 'cheerio';
import { normalizeLookup } from '../app/lib/lookup';

export function entryAliases(key: string, rawHtml: string): string[] {
  const $ = cheerio.load(rawHtml, { xml: false }, false);
  const aliases = new Set([key]);
  $('.hw, .asp, .col, .conjf, .adjf, .plw, .wf').each((_, element) => {
    const text = $(element)
      .text()
      .replace(/[′ˊˋˈˌ`*\u00ad‖]/g, '')
      .trim();
    if (!text || (text.startsWith('-') && !key.startsWith('-'))) return;
    aliases.add(text);
    aliases.add(text.replace(/(?<=\p{L})-(?=\p{L})/gu, ''));
  });
  if (
    $.root()
      .children('.pos')
      .toArray()
      .some((element) => /\bverb\b/.test($(element).text()))
  ) {
    aliases.add(`To ${key}`);
  }
  return [...aliases];
}

export function unambiguousAliases(
  entries: ReadonlyMap<string, ReadonlyArray<string>>
): Map<string, string> {
  const aliases = new Map<string, string>();
  const ambiguous = new Set<string>();
  const canonical = new Map([...entries.keys()].map((key) => [normalizeLookup(key), key]));
  for (const [key, names] of entries) {
    for (const name of names) {
      const normalized = normalizeLookup(name);
      if (!normalized || canonical.has(normalized) || ambiguous.has(normalized)) continue;
      const previous = aliases.get(normalized);
      if (previous && previous !== key) {
        aliases.delete(normalized);
        ambiguous.add(normalized);
      } else {
        aliases.set(normalized, key);
      }
    }
  }
  return new Map([...aliases, ...canonical]);
}
