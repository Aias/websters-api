import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { normalizeLookup } from '../app/lib/lookup';
import type { DictionaryEntry, HeaderPart, LexicalBlock } from '../app/lib/types';
import { readDictionarySource, sourceFingerprint } from './dictionary-source';
import { entryAliases } from './entry-aliases';
import { decodeEntryKey } from './entry-references';

const ROOT = join(import.meta.dir, '..');
const OUTPUT = join(ROOT, 'build', 'macos');
const BUNDLE_ID = 'org.websters1913.dictionary';
const DB_FILE = join(ROOT, 'app', 'data', 'dictionary.db');
const META_FILE = join(ROOT, 'app', 'data', 'dictionary.build-meta.json');

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fragmentId(entryId: string, fragment: string): string {
  return `${entryId}-${Buffer.from(fragment).toString('hex')}`;
}

function contentHtml(
  html: string,
  entryId: string,
  entriesBySlug: ReadonlyMap<string, string>
): string {
  const $ = cheerio.load(html, {}, false);
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href?.startsWith('/entry/')) return;
    const [slug] = href.slice('/entry/'.length).split('#');
    const target = entriesBySlug.get(decodeURIComponent(slug));
    if (target) $(element).attr('href', `x-dictionary:r:${target}:${BUNDLE_ID}`);
    else $(element).removeAttr('href');
  });
  $('[id]').each((_, element) => {
    const id = $(element).attr('id');
    if (id) $(element).attr('id', fragmentId(entryId, id));
  });
  $('math').attr('xmlns', 'http://www.w3.org/1998/Math/MathML');
  $('span').each((_, element) => {
    if ($(element).find('div,table,pre,blockquote').length > 0) element.tagName = 'div';
  });
  $('img[src^="/illustrations/"]').each((_, element) => {
    const src = $(element).attr('src');
    if (src) $(element).attr('src', src.slice(1));
  });
  return $.xml();
}

function renderHeader(
  parts: ReadonlyArray<HeaderPart>,
  entryId: string,
  entriesBySlug: ReadonlyMap<string, string>
): string {
  return parts
    .map((part, index) => {
      const value = 'text' in part ? part.text : part.html;
      const space = index > 0 && !/^[,.;:!?)]/.test(value) ? ' ' : '';
      if ('text' in part) {
        const tag = part.kind === 'headword' ? 'h2' : 'span';
        return `${space}<${tag} class="${part.kind}">${escapeXml(part.text)}</${tag}>`;
      }
      const tag =
        part.kind === 'forms' || /<(?:table|pre|div|blockquote)\b/.test(part.html) ? 'div' : 'span';
      return `${space}<${tag} class="${part.kind}">${contentHtml(part.html, entryId, entriesBySlug)}</${tag}>`;
    })
    .join('');
}

function renderContent(
  content: ReadonlyArray<LexicalBlock>,
  entryId: string,
  entriesBySlug: ReadonlyMap<string, string>
): string {
  return content
    .map((block, index) => {
      if (block.kind === 'sense')
        return `<div class="sense"${block.id ? ` id="${fragmentId(entryId, block.id)}"` : ''}><strong>${escapeXml(block.number)}</strong> ${renderContent(block.content, entryId, entriesBySlug)}</div>`;
      if (block.kind === 'compound')
        return `<div class="compound"${block.id ? ` id="${fragmentId(entryId, block.id)}"` : ''}><strong>${contentHtml(block.headwordHtml, entryId, entriesBySlug)}</strong> ${renderContent(block.content, entryId, entriesBySlug)}</div>`;
      if (block.kind === 'section')
        return `<div class="section">${renderContent(block.content, entryId, entriesBySlug)}</div>`;
      if (block.kind === 'quotation')
        return `<blockquote>${contentHtml(block.html, entryId, entriesBySlug)}${block.authors.length ? ` <span class="author">${escapeXml(block.authors.join('; '))}</span>` : ''}</blockquote>`;
      const body = contentHtml(block.html, entryId, entriesBySlug);
      if (['etymology', 'forms', 'note', 'synonyms', 'usage'].includes(block.kind))
        return `<div class="${block.kind}">${body}</div>`;
      const next = content[index + 1];
      const separator =
        block.kind === 'label' && next && (!('html' in next) || !/^[\s,.;:!?)]/.test(next.html))
          ? ' '
          : '';
      const tag = /<(?:table|pre|div|blockquote)\b/.test(body) ? 'div' : 'span';
      return `<${tag} class="${block.kind}">${body}</${tag}>${separator}`;
    })
    .join('');
}

export function renderDictionaryEntry(
  entry: DictionaryEntry,
  terms: ReadonlyArray<string>,
  entryId: string,
  entriesBySlug: ReadonlyMap<string, string>
): string {
  const indexes = [...new Set([entry.key, ...terms])]
    .sort()
    .map((term) => `<d:index d:value="${escapeXml(term)}" d:title="${escapeXml(entry.key)}"/>`)
    .join('');
  const homographs = entry.homographs
    .map(
      (homograph) =>
        `<div class="homograph"${homograph.id ? ` id="${fragmentId(entryId, homograph.id)}"` : ''}><div class="header">${renderHeader(homograph.header, entryId, entriesBySlug)}</div>${renderContent(homograph.content, entryId, entriesBySlug)}</div>`
    )
    .join('');
  return `<d:entry id="${entryId}" d:title="${escapeXml(entry.key)}">${indexes}${homographs}</d:entry>`;
}

function main(): void {
  if (!existsSync(DB_FILE) || !existsSync(META_FILE))
    throw new Error('Build the database before exporting the macOS dictionary.');
  const metadata: unknown = JSON.parse(readFileSync(META_FILE, 'utf8'));
  if (
    metadata === null ||
    typeof metadata !== 'object' ||
    !('errorCount' in metadata) ||
    metadata.errorCount !== 0 ||
    !('sourceHash' in metadata) ||
    metadata.sourceHash !== sourceFingerprint()
  )
    throw new Error(
      'Database is incomplete or stale; rebuild it before exporting the macOS dictionary.'
    );
  const db = new Database(DB_FILE, { readonly: true });
  const entries = db.query('SELECT key, slug, data FROM entries ORDER BY key').all();
  const aliases = db.query('SELECT normalized_key, key FROM aliases ORDER BY normalized_key').all();
  const parsedEntries: DictionaryEntry[] = [];
  const entriesBySlug = new Map<string, string>();
  for (const [index, row] of entries.entries()) {
    if (
      row === null ||
      typeof row !== 'object' ||
      !('key' in row) ||
      typeof row.key !== 'string' ||
      !('slug' in row) ||
      typeof row.slug !== 'string' ||
      !('data' in row) ||
      typeof row.data !== 'string'
    )
      throw new Error('Invalid dictionary database entry.');
    parsedEntries.push(JSON.parse(row.data));
    entriesBySlug.set(row.slug, `e${index + 1}`);
  }
  const termsByKey = new Map<string, string[]>();
  for (const row of aliases) {
    if (
      row === null ||
      typeof row !== 'object' ||
      !('key' in row) ||
      typeof row.key !== 'string' ||
      !('normalized_key' in row) ||
      typeof row.normalized_key !== 'string'
    )
      throw new Error('Invalid dictionary database alias.');
    const terms = termsByKey.get(row.key) ?? [];
    terms.push(row.normalized_key);
    termsByKey.set(row.key, terms);
  }
  for (const [rawKey, html] of readDictionarySource()) {
    const key = decodeEntryKey(rawKey);
    const terms = termsByKey.get(key) ?? [];
    terms.push(...entryAliases(key, html).names.map(normalizeLookup));
    termsByKey.set(key, terms);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<d:dictionary xmlns="http://www.w3.org/1999/xhtml" xmlns:d="http://www.apple.com/DTDs/DictionaryService-1.0.rng">\n${parsedEntries.map((entry) => renderDictionaryEntry(entry, termsByKey.get(entry.key) ?? [], entriesBySlug.get(entry.slug) ?? '', entriesBySlug)).join('\n')}\n</d:dictionary>\n`;
  mkdirSync(OUTPUT, { recursive: true });
  writeFileSync(join(OUTPUT, 'Webster1913.xml'), xml);
  writeFileSync(
    join(OUTPUT, 'Webster1913.css'),
    '@font-face { font-family: "Old Standard Webster"; src: url("fonts/OldStandard-Regular.woff2") format("woff2"); }\n@font-face { font-family: "Old Standard Webster"; src: url("fonts/OldStandard-Italic.woff2") format("woff2"); font-style: italic; }\n@font-face { font-family: "Old Standard Webster"; src: url("fonts/OldStandard-BoldItalic.woff2") format("woff2"); font-style: italic; font-weight: bold; }\nbody { font-family: "Old Standard Webster", serif; }\nh2.headword { display: inline; margin: 0; }\n.header { margin: 0 0 .35em; }\n.homograph, .sense, .compound, blockquote { margin: 0 0 .7em; }\n.etymology, .forms, .note, .synonyms, .usage { margin: .4em 0; }\n.partOfSpeech, .etymology, .label, .author, .it, .pos, .ets, .qau, .au { font-style: italic; }\n.adjf, .col, .conjf, .plw, .wf { font-weight: bold; }\n.sc { font-variant: small-caps; }\n'
  );
  writeFileSync(
    join(OUTPUT, 'Webster1913.plist'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>CFBundleDevelopmentRegion</key><string>English</string><key>CFBundleDisplayName</key><string>Webster's 1913 Dictionary</string><key>CFBundleIdentifier</key><string>${BUNDLE_ID}</string><key>CFBundleName</key><string>Webster's 1913 Dictionary</string><key>CFBundleShortVersionString</key><string>1.0</string><key>DCSDictionaryManufacturerName</key><string>Webster's 1913 Dictionary</string></dict></plist>\n`
  );
  cpSync(join(ROOT, 'public', 'illustrations'), join(OUTPUT, 'OtherResources', 'illustrations'), {
    recursive: true,
  });
  const fonts = join(OUTPUT, 'OtherResources', 'fonts');
  mkdirSync(fonts, { recursive: true });
  for (const name of [
    'OldStandard-Regular.woff2',
    'OldStandard-Italic.woff2',
    'OldStandard-BoldItalic.woff2',
    'OldStandard-OFL.txt',
    'Noto-OFL.txt',
  ])
    cpSync(join(ROOT, 'app', 'fonts', name), join(fonts, name));
  db.close();
  console.log(`Wrote ${parsedEntries.length} entries to ${OUTPUT}`);
}

if (import.meta.main) main();
