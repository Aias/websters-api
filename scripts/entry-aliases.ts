import * as cheerio from 'cheerio';
import { normalizeLookup } from '../app/lib/lookup';

export interface EntryAliases {
  names: string[];
  deferred: string[];
}

export function entryAliases(key: string, rawHtml: string): EntryAliases {
  const $ = cheerio.load(rawHtml, { xml: false }, false);
  const aliases = new Set([key]);
  const deferred = new Set<string>();
  $('.hw, .asp, .col, .conjf, .adjf, .plw, .wf, .plu .er').each((_, element) => {
    const text = (
      $(element).hasClass('col')
        ? ($(element).attr('data-headword') ?? $(element).text())
        : $(element).text()
    )
      .normalize('NFC')
      .replace(/[′ˊˋˈˌ`*\u00ad‖]/g, '')
      .trim();
    if (!text || (text.startsWith('-') && !key.startsWith('-'))) return;
    const pointer =
      $(element).hasClass('col') &&
      /^\s*See under\b/.test($(element).nextAll('.cd').first().text());
    const names = pointer ? deferred : aliases;
    names.add(text);
    names.add(text.replace(/(?<=\p{L})-(?=\p{L})/gu, ''));
  });
  if (
    $.root()
      .children('.pos')
      .toArray()
      .some((element) => /\bverb\b/.test($(element).text()))
  ) {
    aliases.add(`To ${key}`);
  }
  return { names: [...aliases], deferred: [...deferred].filter((name) => !aliases.has(name)) };
}

export function unambiguousAliases(
  entries: ReadonlyMap<string, ReadonlyArray<string>>,
  deferred: ReadonlyMap<string, ReadonlyArray<string>> = new Map()
): Map<string, string> {
  const claimed = resolveClaims(entries);
  const pointers = resolveClaims(deferred, entries.keys());
  for (const name of claimed.names) pointers.aliases.delete(name);
  const canonical = new Map([...entries.keys()].map((key) => [normalizeLookup(key), key]));
  return new Map([...pointers.aliases, ...claimed.aliases, ...canonical]);
}

function resolveClaims(
  entries: ReadonlyMap<string, ReadonlyArray<string>>,
  keys: Iterable<string> = entries.keys()
) {
  const exact = new Map<string, string | null>();
  const equivalent = new Map<string, string | null>();
  const folded = new Map<string, string | null>();
  const aliases = new Map<string, string>();
  const forms = new Map([
    ['ae', ['ae', 'æ']],
    ['æ', ['ae', 'æ']],
    ['oe', ['oe', 'œ']],
    ['œ', ['oe', 'œ']],
  ]);
  const withoutDiaeresis = (value: string) =>
    value
      .normalize('NFD')
      .replace(/\u0308/g, '')
      .normalize('NFC');
  const fold = (value: string) => withoutDiaeresis(value).replace(/æ/g, 'ae').replace(/œ/g, 'oe');
  function add(candidates: Map<string, string | null>, name: string, key: string) {
    if (!name) return;
    const previous = candidates.get(name);
    candidates.set(name, previous === undefined || previous === key ? key : null);
  }
  for (const key of keys) add(folded, fold(normalizeLookup(key)), key);
  for (const [key, names] of entries) {
    for (const name of new Set([key, ...names])) {
      const normalized = normalizeLookup(name);
      add(exact, normalized, key);
      for (const spelling of new Set([normalized, withoutDiaeresis(normalized)])) {
        let variants = [''];
        for (const part of spelling.split(/(ae|oe|æ|œ)/g)) {
          variants = variants.flatMap((prefix) =>
            (forms.get(part) ?? [part]).map((form) => prefix + form)
          );
        }
        for (const variant of variants) add(equivalent, variant, key);
      }
    }
  }
  for (const [name, key] of [...equivalent, ...exact]) {
    const resolved = key ?? folded.get(fold(name));
    if (resolved) aliases.set(name, resolved);
    else aliases.delete(name);
  }
  return { aliases, names: new Set([...equivalent.keys(), ...exact.keys()]) };
}
