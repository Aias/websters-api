import { normalizeLookup } from '../app/lib/lookup';
import { slugify } from '../app/lib/slug';
import type { DictionaryEntry } from '../app/lib/types';
import { entryAliases, unambiguousAliases } from './entry-aliases';

export interface EntryResolver {
  (slug: string): string | undefined;
  qualified?: (text: string, partOfSpeech: string, currentSlug: string) => string | undefined;
}

function headwordNames(text: string): string[] {
  const name = normalizeLookup(text.replace(/[′ˊˋˈˌ`*\u00ad‖]/g, ''));
  return [name, name.replace(/(?<=\p{L})-(?=\p{L})/gu, '')];
}

export function decodeEntryKey(key: string): string {
  return key
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .normalize('NFC');
}

export function createEntryReferences(
  source: ReadonlyMap<string, string>,
  parse: (key: string, html: string) => DictionaryEntry
) {
  const canonical = new Map<string, string>();
  const aliasesByEntry = new Map<string, ReadonlyArray<string>>();
  for (const [rawKey, html] of source) {
    const key = decodeEntryKey(rawKey);
    canonical.set(slugify(key), key);
    aliasesByEntry.set(key, entryAliases(key, html));
  }
  const aliases = unambiguousAliases(aliasesByEntry);
  const resolve: EntryResolver = (slug) => {
    const name = normalizeLookup(slug.replaceAll('_', ' '));
    const folded = name
      .normalize('NFD')
      .replace(/\u0308/g, '')
      .normalize('NFC');
    return canonical.get(slug) ?? aliases.get(name) ?? aliases.get(folded);
  };
  const qualified = new Map<string, Set<string>>();
  for (const [rawKey, html] of source) {
    const key = decodeEntryKey(rawKey);
    for (const homograph of parse(key, html).homographs) {
      let names: string[] = [];
      let labeled = false;
      for (const part of homograph.header) {
        if (part.kind === 'headword') {
          if (labeled) names = [];
          names.push(...headwordNames(part.text));
          labeled = false;
        } else if (part.kind === 'partOfSpeech') {
          const label = normalizeLookup(part.text);
          for (const name of names) {
            const owners = qualified.get(`${name}\u0000${label}`) ?? new Set<string>();
            owners.add(key);
            qualified.set(`${name}\u0000${label}`, owners);
          }
          labeled = true;
        }
      }
    }
  }
  resolve.qualified = (text, partOfSpeech, currentSlug) => {
    const lexical = text.trim().replace(/,\s*\d+\.?\s*$/, '');
    const name = headwordNames(currentSlug.endsWith('.') ? lexical : lexical.replace(/\.$/, ''))[0];
    const owners = qualified.get(`${name}\u0000${normalizeLookup(partOfSpeech)}`);
    if (!owners || owners.has(resolve(currentSlug) ?? '') || owners.size !== 1) return;
    const owner = owners.values().next().value;
    return owner ? slugify(owner) : undefined;
  };
  return { aliases, resolve };
}

export function entryReferenceSlug(
  text: string,
  resolve?: EntryResolver,
  partOfSpeech?: string
): string {
  const slug = slugify(normalizeLookup(text.replace(/,\s*\d+\.?\s*$/, '')));
  const undotted = slug.replace(/\.$/, '');
  const current =
    slug.endsWith('.') && resolve && !resolve(slug) && resolve(undotted) ? undotted : slug;
  return (partOfSpeech && resolve?.qualified?.(text, partOfSpeech, current)) || current;
}
