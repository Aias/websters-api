import * as cheerio from 'cheerio';
import { normalizeLookup } from '../../app/lib/lookup';
import { slugify } from '../../app/lib/slug';
import type { DictionaryEntry, LexicalBlock } from '../../app/lib/types';
import { parseEntry, preprocess } from '../build-db';
import { entryAliases } from '../entry-aliases';
import { createEntryReferences, decodeEntryKey } from '../entry-references';

export interface TextPart {
  owner: string;
  text: string;
}

export interface SemanticProjection {
  text: string;
  parts: TextPart[];
  structure: string[];
}

export interface TextCandidate {
  before: string;
  after: string;
  classification: 'whitespace' | 'placeholder' | 'unclassified';
}

export interface EntrySnapshot {
  type: 'entry';
  key: string;
  rawToPreprocess: TextCandidate | null;
  preprocessToParsed: TextCandidate | null;
  preprocessedText: string;
  projection: SemanticProjection;
}

export interface LookupSnapshot {
  type: 'lookup';
  canonical: Record<string, string>;
  aliases: Record<string, string>;
  routes: Record<string, string>;
  ambiguousClaims: Record<string, string[]>;
}

export interface EntryDifference {
  key: string;
  text: boolean;
  structure: boolean;
  normalization: boolean;
}

export interface LookupDifference {
  canonical: LookupChange[];
  aliases: LookupChange[];
  routes: LookupChange[];
  newAmbiguity: { name: string; before: string[]; after: string[] }[];
}

export interface LookupChange {
  name: string;
  before: string | undefined;
  after: string | undefined;
}

function decodedText(html: string): string {
  return cheerio.load(html, { xml: false }, false).root().text().normalize('NFC');
}

function textCandidate(before: string, after: string): TextCandidate | null {
  if (before === after) return null;
  const classification =
    before.replace(/\s+/gu, '') === after.replace(/\s+/gu, '')
      ? 'whitespace'
      : before.replace(/\(\s*[?#�]\s*\)/gu, '') === after
        ? 'placeholder'
        : 'unclassified';
  return { before, after, classification };
}

export function projectEntry(entry: DictionaryEntry): SemanticProjection {
  const parts: TextPart[] = [];
  const structure: string[] = [];
  function addText(owner: string, text: string): void {
    parts.push({ owner, text: text.normalize('NFC') });
  }
  function blocks(content: ReadonlyArray<LexicalBlock>, parent: string): void {
    content.forEach((block, index) => {
      const owner = `${parent}/${block.kind}[${index}]`;
      if (block.kind === 'sense') {
        structure.push(JSON.stringify({ owner, number: block.number }));
        blocks(block.content, `${owner}:${block.number}`);
      } else if (block.kind === 'compound') {
        structure.push(JSON.stringify({ owner, headwords: block.headwords }));
        addText(`${owner}/heading`, decodedText(block.headwordHtml));
        blocks(block.content, `${owner}:${JSON.stringify(block.headwords)}`);
      } else if (block.kind === 'section') {
        structure.push(JSON.stringify({ owner }));
        blocks(block.content, owner);
      } else if (block.kind === 'quotation') {
        structure.push(JSON.stringify({ owner, authors: block.authors }));
        addText(owner, decodedText(block.html));
        block.authors.forEach((author, authorIndex) =>
          addText(`${owner}/author[${authorIndex}]`, author)
        );
      } else {
        structure.push(
          JSON.stringify({
            owner,
            ownerSense: block.kind === 'note' ? block.ownerSense : undefined,
          })
        );
        addText(owner, decodedText(block.html));
      }
    });
  }
  structure.push(JSON.stringify({ key: entry.key, slug: entry.slug }));
  entry.homographs.forEach((homograph, index) => {
    const owner = `homograph[${index}]`;
    structure.push(
      JSON.stringify({
        owner,
        headword: homograph.headword,
        alternateHeadwords: homograph.alternateHeadwords,
        pronunciation: homograph.pronunciation,
        partOfSpeech: homograph.partOfSpeech,
      })
    );
    homograph.header.forEach((part, partIndex) => {
      const partOwner = `${owner}/header/${part.kind}[${partIndex}]`;
      structure.push(JSON.stringify({ owner: partOwner }));
      addText(partOwner, 'text' in part ? part.text : decodedText(part.html));
    });
    blocks(homograph.content, owner);
  });
  return { text: parts.map((part) => part.text).join(''), parts, structure };
}

export function ownershipSignature(entry: DictionaryEntry): string[] {
  return projectEntry(entry).structure;
}

export function snapshotEntry(
  key: string,
  rawHtml: string,
  resolve: (slug: string) => string | undefined
): EntrySnapshot {
  const rawText = decodedText(rawHtml);
  const preprocessedText = decodedText(preprocess(rawHtml, resolve));
  const projection = projectEntry(parseEntry(key, rawHtml, resolve));
  return {
    type: 'entry',
    key: decodeEntryKey(key),
    rawToPreprocess: textCandidate(rawText, preprocessedText),
    preprocessToParsed: textCandidate(preprocessedText, projection.text),
    preprocessedText,
    projection,
  };
}

export function snapshotLookup(
  source: ReadonlyMap<string, string>,
  references = createEntryReferences(source)
): LookupSnapshot {
  const canonical = new Map<string, string>();
  const claims = new Map<string, Set<string>>();
  const routeNames = new Set<string>();
  for (const [rawKey, html] of source) {
    const key = decodeEntryKey(rawKey);
    const slug = slugify(key);
    const previous = canonical.get(slug);
    if (previous && previous !== key) throw new Error(`Canonical slug collision: ${slug}`);
    canonical.set(slug, key);
    routeNames.add(slug);
    for (const alias of entryAliases(key, html)) {
      const name = normalizeLookup(alias);
      const owners = claims.get(name) ?? new Set<string>();
      owners.add(key);
      claims.set(name, owners);
      routeNames.add(slugify(name));
    }
  }
  const routes = new Map<string, string>();
  for (const slug of routeNames) {
    const destination = references.resolve(slug);
    if (destination) routes.set(slug, destination);
  }
  return {
    type: 'lookup',
    canonical: Object.fromEntries(canonical),
    aliases: Object.fromEntries(references.aliases),
    routes: Object.fromEntries(routes),
    ambiguousClaims: Object.fromEntries(
      [...claims]
        .filter(([, owners]) => owners.size > 1)
        .map(([name, owners]) => [name, [...owners].sort()])
    ),
  };
}

export function compareEntry(before: EntrySnapshot, after: EntrySnapshot): EntryDifference | null {
  if (before.key !== after.key) throw new Error(`Entry mismatch: ${before.key} / ${after.key}`);
  const text =
    before.projection.text !== after.projection.text ||
    before.preprocessedText !== after.preprocessedText ||
    JSON.stringify(before.projection.parts.map((part) => part.text)) !==
      JSON.stringify(after.projection.parts.map((part) => part.text));
  const structure =
    JSON.stringify(before.projection.structure) !== JSON.stringify(after.projection.structure);
  const normalization =
    JSON.stringify(before.rawToPreprocess) !== JSON.stringify(after.rawToPreprocess) ||
    JSON.stringify(before.preprocessToParsed) !== JSON.stringify(after.preprocessToParsed);
  return text || structure || normalization
    ? { key: before.key, text, structure, normalization }
    : null;
}

function changedKeys(
  before: Record<string, string>,
  after: Record<string, string>
): LookupChange[] {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((key) => before[key] !== after[key])
    .sort()
    .map((name) => ({ name, before: before[name], after: after[name] }));
}

export function compareLookup(before: LookupSnapshot, after: LookupSnapshot): LookupDifference {
  return {
    canonical: changedKeys(before.canonical, after.canonical),
    aliases: changedKeys(before.aliases, after.aliases),
    routes: changedKeys(before.routes, after.routes),
    newAmbiguity: Object.keys(after.ambiguousClaims)
      .filter(
        (name) =>
          JSON.stringify(before.ambiguousClaims[name]) !==
          JSON.stringify(after.ambiguousClaims[name])
      )
      .sort()
      .map((name) => ({
        name,
        before: before.ambiguousClaims[name] ?? [],
        after: after.ambiguousClaims[name],
      })),
  };
}
