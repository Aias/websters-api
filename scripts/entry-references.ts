import { normalizeLookup } from '../app/lib/lookup';
import { slugify } from '../app/lib/slug';
import { entryAliases, unambiguousAliases } from './entry-aliases';

export type EntryResolver = (slug: string) => string | undefined;

export function decodeEntryKey(key: string): string {
  return key
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .normalize('NFC');
}

export function createEntryReferences(source: ReadonlyMap<string, string>) {
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
  return { aliases, resolve };
}

export function entryReferenceSlug(text: string, resolve?: EntryResolver): string {
  const slug = slugify(normalizeLookup(text.replace(/,\s*\d+\.?\s*$/, '')));
  const undotted = slug.replace(/\.$/, '');
  return slug.endsWith('.') && resolve && !resolve(slug) && resolve(undotted) ? undotted : slug;
}
