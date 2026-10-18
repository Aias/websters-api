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
  const exact = new Map<string, string | null>();
  const equivalent = new Map<string, string | null>();
  const aliases = new Map<string, string>();
  const canonical = new Map([...entries.keys()].map((key) => [normalizeLookup(key), key]));
  const forms = new Map([
    ['ae', ['ae', 'æ']],
    ['æ', ['ae', 'æ']],
    ['oe', ['oe', 'œ']],
    ['œ', ['oe', 'œ']],
  ]);
  function add(candidates: Map<string, string | null>, name: string, key: string) {
    if (!name) return;
    const previous = candidates.get(name);
    candidates.set(name, previous === undefined || previous === key ? key : null);
  }
  for (const [key, names] of entries) {
    for (const name of new Set([key, ...names])) {
      const normalized = normalizeLookup(name);
      add(exact, normalized, key);
      let variants = [''];
      for (const part of normalized.split(/(ae|oe|æ|œ)/g)) {
        variants = variants.flatMap((prefix) =>
          (forms.get(part) ?? [part]).map((form) => prefix + form)
        );
      }
      for (const variant of variants) add(equivalent, variant, key);
    }
  }
  for (const [name, key] of [...equivalent, ...exact]) {
    if (key === null) aliases.delete(name);
    else aliases.set(name, key);
  }
  return new Map([...aliases, ...canonical]);
}
