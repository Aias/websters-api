import { normalizeLookup } from '../app/lib/lookup';
import { slugify } from '../app/lib/slug';
import type { DictionaryEntry, LexicalBlock } from '../app/lib/types';
import { entryAliases, unambiguousAliases } from './entry-aliases';

export interface ReferenceTarget {
  recorded?: string;
  sense?: string;
  subsense?: string;
  partOfSpeech?: string;
  phrases: ReadonlyArray<string>;
}

export interface EntryResolver {
  (slug: string): string | undefined;
  qualified?: (text: string, partOfSpeech: string, currentSlug: string) => string | undefined;
  fragment?: (slug: string, target: ReferenceTarget) => string | undefined;
}

interface EntryTargets {
  ids: Set<string>;
  compounds: Map<string, string>;
  homographs: { id?: string; partsOfSpeech: string[]; senses: Map<string, string> }[];
}

function headwordNames(text: string): string[] {
  const name = normalizeLookup(text.replace(/[′ˊˋˈˌ`*\u00ad‖]/g, ''));
  return [name, name.replace(/(?<=\p{L})-(?=\p{L})/gu, '')];
}

export function phraseName(text: string): string {
  return normalizeLookup(text.replace(/[′ˊˋˈˌ`*\u00ad‖]/g, ''))
    .replace(/[^\p{L}\p{N}']+/gu, ' ')
    .trim();
}

function collectTargets(
  content: ReadonlyArray<LexicalBlock>,
  targets: EntryTargets,
  senses?: Map<string, string>
): void {
  for (const block of content) {
    if (block.kind === 'sense' && block.id) {
      targets.ids.add(block.id);
      const number = /^(\d+)\.?$/.exec(block.number)?.[1];
      if (number && senses && !senses.has(number)) senses.set(number, block.id);
      collectTargets(block.content, targets, number ? undefined : senses);
    } else if (block.kind === 'compound' && block.id) {
      targets.ids.add(block.id);
      for (const headword of block.headwords) {
        if (!targets.compounds.has(phraseName(headword)))
          targets.compounds.set(phraseName(headword), block.id);
      }
      collectTargets(block.content, targets);
    } else if ('content' in block) collectTargets(block.content, targets);
  }
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
  const pointersByEntry = new Map<string, ReadonlyArray<string>>();
  for (const [rawKey, html] of source) {
    const key = decodeEntryKey(rawKey);
    canonical.set(slugify(key), key);
    const { names, deferred } = entryAliases(key, html);
    aliasesByEntry.set(key, names);
    if (deferred.length) pointersByEntry.set(key, deferred);
  }
  const aliases = unambiguousAliases(aliasesByEntry, pointersByEntry);
  const resolve: EntryResolver = (slug) => {
    const name = normalizeLookup(slug.replaceAll('_', ' '));
    const folded = name
      .normalize('NFD')
      .replace(/\u0308/g, '')
      .normalize('NFC');
    return canonical.get(slug) ?? aliases.get(name) ?? aliases.get(folded);
  };
  const qualified = new Map<string, Set<string>>();
  const targetsByEntry = new Map<string, EntryTargets>();
  for (const [rawKey, html] of source) {
    const key = decodeEntryKey(rawKey);
    const targets: EntryTargets = { ids: new Set(), compounds: new Map(), homographs: [] };
    targetsByEntry.set(key, targets);
    for (const homograph of parse(key, html).homographs) {
      const senses = new Map<string, string>();
      if (homograph.id) targets.ids.add(homograph.id);
      collectTargets(homograph.content, targets, senses);
      targets.homographs.push({
        id: homograph.id,
        partsOfSpeech: homograph.header.flatMap((part) =>
          part.kind === 'partOfSpeech' ? [normalizeLookup(part.text)] : []
        ),
        senses,
      });
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
  resolve.fragment = (slug, { recorded, sense, subsense, partOfSpeech, phrases }) => {
    const key = resolve(slug) ?? '';
    const targets = targetsByEntry.get(key);
    if (!targets) return;
    if (recorded && targets.ids.has(recorded)) return recorded;
    const label = partOfSpeech && ` ${normalizeLookup(partOfSpeech)} `;
    const labeled = label
      ? targets.homographs.filter(({ partsOfSpeech }) =>
          partsOfSpeech.some((part) => ` ${part} `.includes(label))
        )
      : [];
    const id = sense
      ? [...labeled, ...targets.homographs].map(({ senses }) => senses.get(sense)).find(Boolean)
      : undefined;
    if (id) return subsense && targets.ids.has(`${id}-${subsense}`) ? `${id}-${subsense}` : id;
    const name = phraseName(key);
    for (const phrase of phrases) {
      const compound = phraseName(phrase) !== name && targets.compounds.get(phraseName(phrase));
      if (compound) return compound;
    }
    return labeled[0]?.id;
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
