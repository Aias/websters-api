import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import type {
  ConjugationForm,
  CompoundForm,
  CrossReference,
  DictionaryEntry,
  Etymology,
  Homograph,
  InlineHTML,
  Quotation,
  Sense,
} from '../app/lib/types.ts';

const ROOT = join(import.meta.dir, '..');
const SRC_FILE = join(ROOT, 'src', 'dict.json');
const DB_FILE = join(ROOT, 'app', 'data', 'dictionary.db');
const BUILD_META_FILE = join(ROOT, 'app', 'data', 'dictionary.build-meta.json');
const PROGRESS_EVERY = 10000;

interface SourceFingerprint {
  size: number;
  mtimeMs: number;
}

interface BuildMetadata {
  sourceSize: number;
  sourceMtimeMs: number;
  entryCount: number;
  errorCount: number;
}

interface BuildResult {
  parsedCount: number;
  errorCount: number;
}

// ─── Helpers ─────────────────────────────────────────────

function isElement(node: AnyNode): node is Element {
  return node.type === 'tag';
}

function hasClass(node: AnyNode, cls: string): boolean {
  if (!isElement(node)) return false;
  const classes = node.attribs['class'];
  if (!classes) return false;
  if (classes === cls) return true;
  return ` ${classes} `.includes(` ${cls} `);
}

function isTag(node: AnyNode, tag: string): boolean {
  return isElement(node) && node.tagName === tag;
}

function isBr(node: AnyNode): boolean {
  return isTag(node, 'br');
}

/** Check if a node is structural filler (br, whitespace, punctuation-only text) */
function isFiller(node: AnyNode): boolean {
  if (isBr(node)) return true;
  if (node.type === 'text') {
    const t = node.data.trim();
    return t === '' || t === '.' || t === ',' || t === ';';
  }
  return false;
}

function getText($: cheerio.CheerioAPI, node: AnyNode): string {
  return $(node).text().trim();
}

function getHtml($: cheerio.CheerioAPI, node: AnyNode): InlineHTML {
  return ($(node).html() ?? '').trim();
}

function decodeHtmlCharRefs(str: string): string {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)));
}

function normalizeKey(key: string): string {
  return decodeHtmlCharRefs(key).normalize('NFC').toLowerCase().trim();
}

function getSourceFingerprint(): SourceFingerprint {
  const sourceStat = statSync(SRC_FILE);
  return { size: sourceStat.size, mtimeMs: sourceStat.mtimeMs };
}

function isBuildMetadata(value: unknown): value is BuildMetadata {
  if (value === null || typeof value !== 'object') return false;

  const sourceSize = Reflect.get(value, 'sourceSize');
  const sourceMtimeMs = Reflect.get(value, 'sourceMtimeMs');
  const entryCount = Reflect.get(value, 'entryCount');
  const errorCount = Reflect.get(value, 'errorCount');

  return (
    typeof sourceSize === 'number' &&
    Number.isFinite(sourceSize) &&
    typeof sourceMtimeMs === 'number' &&
    Number.isFinite(sourceMtimeMs) &&
    typeof entryCount === 'number' &&
    Number.isFinite(entryCount) &&
    typeof errorCount === 'number' &&
    Number.isFinite(errorCount)
  );
}

function readBuildMetadata(): BuildMetadata | null {
  if (!existsSync(BUILD_META_FILE)) return null;

  try {
    const raw = readFileSync(BUILD_META_FILE, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (!isBuildMetadata(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function shouldSkipBuild(source: SourceFingerprint): boolean {
  if (!existsSync(DB_FILE)) return false;
  const metadata = readBuildMetadata();
  if (!metadata) return false;

  return metadata.sourceSize === source.size && metadata.sourceMtimeMs === source.mtimeMs;
}

function writeBuildMetadata(source: SourceFingerprint, result: BuildResult): void {
  const metadata: BuildMetadata = {
    sourceSize: source.size,
    sourceMtimeMs: source.mtimeMs,
    entryCount: result.parsedCount,
    errorCount: result.errorCount,
  };

  writeFileSync(BUILD_META_FILE, `${JSON.stringify(metadata, null, 2)}\n`);
}

// ─── Preprocessing ───────────────────────────────────────

function loadPreprocessedDocument(html: string): cheerio.CheerioAPI {
  // Remove d:priority attributes and strip replacement characters from source extraction.
  let normalized = html.replace(/\s*d:priority="[^"]*"/g, '');
  normalized = normalized.replace(/\uFFFD/g, '').replace(/&#xFFFD;/g, '');

  const $ = cheerio.load(normalized, { xml: false }, false);

  // Drop executable containers from trusted source before extracting any HTML fragments.
  $('script,style,iframe,object,embed,template').remove();

  $('*').each((_, el) => {
    if (!isElement(el)) return;

    if (el.tagName === 'b') {
      el.tagName = 'strong';
    } else if (el.tagName === 'i') {
      el.tagName = 'em';
    } else if (el.tagName === 'div') {
      // Source HTML uses divs for inline fragments; span avoids invalid inline nesting.
      el.tagName = 'span';
    }

    if (hasClass(el, 'er')) {
      const text = $(el).text().trim();
      if (text) {
        el.tagName = 'a';
        el.attribs['href'] = `/entry/${encodeURIComponent(text)}`;
      }
    }

    for (const [attributeName, attributeValue] of Object.entries(el.attribs)) {
      const normalizedName = attributeName.toLowerCase();

      if (normalizedName === 'class') continue;

      if (normalizedName === 'href') {
        if (typeof attributeValue !== 'string' || !attributeValue.startsWith('/entry/')) {
          delete el.attribs[attributeName];
        }
        continue;
      }

      if (
        normalizedName.startsWith('on') ||
        normalizedName === 'style' ||
        normalizedName === 'srcdoc'
      ) {
        delete el.attribs[attributeName];
        continue;
      }

      delete el.attribs[attributeName];
    }
  });

  return $;
}

export function preprocess(html: string): string {
  return loadPreprocessedDocument(html).html();
}

// ─── Etymology parser ────────────────────────────────────

function parseEtymology($: cheerio.CheerioAPI, node: Element): Etymology {
  const html = getHtml($, node);
  const sourceWords: string[] = [];
  const crossReferences: CrossReference[] = [];

  $(node)
    .find('.ets')
    .each((_, el) => {
      const text = $(el).text().trim();
      if (text) sourceWords.push(text);
    });

  $(node)
    .find('.er')
    .each((_, el) => {
      const text = $(el).text().trim();
      if (text) crossReferences.push({ text, target: normalizeKey(text) });
    });

  return { html, sourceWords, crossReferences };
}

// ─── Verb morphology parser ──────────────────────────────

function parseVerbMorphology($: cheerio.CheerioAPI, node: Element): ReadonlyArray<ConjugationForm> {
  const forms: ConjugationForm[] = [];
  const children = $(node).contents().toArray();

  let currentLabel = '';
  for (const child of children) {
    if (hasClass(child, 'pos')) {
      currentLabel = getText($, child);
    } else if (hasClass(child, 'conjf')) {
      const form = getText($, child);
      let pronunciation: string | null = null;
      const next = $(child).next('.pr');
      if (next.length > 0) {
        pronunciation = next.text().trim().replace(/^\(/, '').replace(/\)$/, '');
      }
      forms.push({ label: currentLabel, form, pronunciation });
    }
  }

  return forms;
}

// ─── Quotation parser ────────────────────────────────────

function parseQuotation($: cheerio.CheerioAPI, node: Element): Quotation {
  const $q = $(node);
  const $qau = $q.find('.qau');
  const author = $qau.length > 0 ? $qau.text().trim().replace(/\.$/, '') : null;

  const $clone = $q.clone();
  $clone.find('.qau').remove();
  const html = $clone.html()?.trim() ?? '';

  return { html, author };
}

// ─── Compound form parser ────────────────────────────────

function parseCompoundForms($: cheerio.CheerioAPI, node: Element): ReadonlyArray<CompoundForm> {
  const forms: CompoundForm[] = [];
  let pendingHeadwords: string[] = [];
  let pendingEtymology: Etymology | null = null;
  let pendingMark: string | null = null;

  function flush(definition: InlineHTML | null): void {
    if (!definition && pendingHeadwords.length === 0 && !pendingEtymology && !pendingMark) return;

    forms.push({
      headwords: pendingHeadwords,
      etymology: pendingEtymology,
      definition,
      mark: pendingMark,
    });

    pendingHeadwords = [];
    pendingEtymology = null;
    pendingMark = null;
  }

  function appendHeadword(headword: string): void {
    if (headword) pendingHeadwords.push(headword);
  }

  for (const child of $(node).contents().toArray()) {
    if (!isElement(child)) continue;

    if (hasClass(child, 'mcol')) {
      for (const nestedCol of $(child).find('.col').toArray()) {
        appendHeadword(getText($, nestedCol));
      }
      continue;
    }

    if (hasClass(child, 'col')) {
      appendHeadword(getText($, child));
      continue;
    }

    if (hasClass(child, 'ety')) {
      pendingEtymology = parseEtymology($, child);
      continue;
    }

    if (hasClass(child, 'mark')) {
      const mark = getText($, child);
      if (!mark) continue;

      if (forms.length > 0 && pendingHeadwords.length === 0 && !pendingEtymology && !pendingMark) {
        const previous = forms[forms.length - 1];
        forms[forms.length - 1] = {
          headwords: previous.headwords,
          etymology: previous.etymology,
          definition: previous.definition,
          mark,
        };
      } else {
        pendingMark = mark;
      }
      continue;
    }

    if (hasClass(child, 'cd')) {
      const definition = getHtml($, child);
      flush(definition || null);
      continue;
    }
  }

  flush(null);
  return forms;
}

// ─── Sense builder ───────────────────────────────────────

class SenseBuilder {
  private number: string | null;
  private field: string | null = null;
  private definition: InlineHTML = '';
  private mark: string | null = null;
  private quotations: Quotation[] = [];
  private attributions: string[] = [];
  private examples: InlineHTML | null = null;
  private note: InlineHTML | null = null;

  constructor(number: string | null) {
    this.number = number;
  }

  setNumber(number: string) {
    this.number = number;
  }

  setField(field: string) {
    this.field = field;
  }

  setDefinition(html: InlineHTML) {
    this.definition = html;
  }

  appendToDefinition(text: string) {
    this.definition = (this.definition + text).trim();
  }

  setMark(mark: string) {
    this.mark = mark;
  }

  addQuotation(q: Quotation) {
    this.quotations.push(q);
  }

  addAttribution(text: string) {
    this.attributions.push(text);
  }

  setExamples(html: InlineHTML) {
    this.examples = html;
  }

  setNote(html: InlineHTML) {
    this.note = html;
  }

  hasPayload(): boolean {
    return (
      this.definition !== '' ||
      this.mark !== null ||
      this.quotations.length > 0 ||
      this.attributions.length > 0 ||
      this.examples !== null ||
      this.note !== null
    );
  }

  build(): Sense {
    return {
      number: this.number,
      field: this.field,
      definition: this.definition,
      mark: this.mark,
      quotations: this.quotations,
      attributions: this.attributions,
      examples: this.examples,
      note: this.note,
    };
  }
}

// ─── Main entry parser ──────────────────────────────────

export function parseEntry(key: string, rawHtml: string): DictionaryEntry {
  const decodedKey = decodeHtmlCharRefs(key).normalize('NFC');
  const $ = loadPreprocessedDocument(rawHtml);
  const topNodes = $.root().contents().toArray();

  // Split into homograph sections by h2.hw
  const sections: Array<{ hwNode: Element | null; isAlternate: boolean; nodes: AnyNode[] }> = [];
  let currentNodes: AnyNode[] = [];
  let pendingAlternate = false;

  for (const node of topNodes) {
    // Check for ‖ marker in text nodes before an h2.hw
    if (node.type === 'text' && node.data.includes('\u2016')) {
      pendingAlternate = true;
      const cleaned = node.data.replace(/\u2016/g, '');
      node.data = cleaned;
      if (cleaned.trim()) {
        currentNodes.push(node);
      }
      continue;
    }

    if (isElement(node) && hasClass(node, 'hw') && isTag(node, 'h2')) {
      if (sections.length > 0 || currentNodes.length > 0) {
        if (sections.length === 0) {
          // Pre-hw content
          sections.push({ hwNode: null, isAlternate: false, nodes: currentNodes });
        }
      }
      sections.push({ hwNode: node, isAlternate: pendingAlternate, nodes: [] });
      pendingAlternate = false;
      currentNodes = sections[sections.length - 1].nodes;
      continue;
    }

    currentNodes.push(node);
  }

  // No .hw found — single homograph using JSON key
  if (sections.length === 0) {
    sections.push({ hwNode: null, isAlternate: pendingAlternate, nodes: currentNodes });
  }

  // Merge pre-hw content into first real section
  if (sections.length > 1 && sections[0].hwNode === null) {
    const preContent = sections.shift();
    if (preContent) {
      sections[0].nodes = [...preContent.nodes, ...sections[0].nodes];
    }
  }

  const homographs: Homograph[] = sections.map((section) =>
    parseHomograph($, decodedKey, section.hwNode, section.isAlternate, section.nodes)
  );

  return { key: decodedKey, normalizedKey: normalizeKey(decodedKey), homographs };
}

function parseHomograph(
  $: cheerio.CheerioAPI,
  entryKey: string,
  hwNode: Element | null,
  isAlternate: boolean,
  nodes: AnyNode[]
): Homograph {
  const headword = hwNode ? getText($, hwNode) : entryKey;
  let pronunciation: string | null = null;
  let partOfSpeech: string | null = null;
  let verbMorphology: ReadonlyArray<ConjugationForm> | null = null;
  let etymology: Etymology | null = null;
  let synonyms: InlineHTML | null = null;
  let usage: InlineHTML | null = null;
  const compoundForms: CompoundForm[] = [];
  let alternateSpellings: string[] | null = null;
  let homographNote: InlineHTML | null = null;

  const senses: Sense[] = [];
  let currentSense: SenseBuilder | null = null;
  let inHeader = true;

  for (const node of nodes) {
    if (isFiller(node)) continue;

    if (!isElement(node)) {
      // Bare text after a definition — append to current sense
      if (currentSense && node.type === 'text' && node.data.trim()) {
        currentSense.appendToDefinition(node.data);
      }
      continue;
    }

    const el = node;

    // Header fields
    if (hasClass(el, 'pr') && inHeader && !pronunciation) {
      pronunciation = getText($, el).replace(/^\(/, '').replace(/\)$/, '');
      continue;
    }

    if (hasClass(el, 'pos') && inHeader && !partOfSpeech) {
      partOfSpeech = getText($, el);
      continue;
    }

    if (hasClass(el, 'vmorph')) {
      verbMorphology = parseVerbMorphology($, el);
      continue;
    }

    if (hasClass(el, 'ety') && inHeader && !etymology) {
      etymology = parseEtymology($, el);
      continue;
    }

    // Sense number
    if (hasClass(el, 'sn')) {
      const number = getText($, el);
      if (!currentSense) {
        currentSense = new SenseBuilder(number);
      } else if (currentSense.hasPayload()) {
        senses.push(currentSense.build());
        currentSense = new SenseBuilder(number);
      } else {
        currentSense.setNumber(number);
      }

      inHeader = false;
      continue;
    }

    // Definition
    if (hasClass(el, 'def')) {
      inHeader = false;
      if (!currentSense) currentSense = new SenseBuilder(null);
      currentSense.setDefinition(getHtml($, el));
      continue;
    }

    // Field label
    if (hasClass(el, 'fld')) {
      if (!currentSense) currentSense = new SenseBuilder(null);
      currentSense.setField(getText($, el));
      continue;
    }

    // Mark
    if (hasClass(el, 'mark')) {
      if (currentSense) currentSense.setMark(getText($, el));
      continue;
    }

    // Quotation
    if (hasClass(el, 'q')) {
      if (!currentSense) currentSense = new SenseBuilder(null);
      currentSense.addQuotation(parseQuotation($, el));
      continue;
    }

    // Attribution
    if (hasClass(el, 'au')) {
      if (currentSense) currentSense.addAttribution(getText($, el));
      continue;
    }

    // Right-justified (wraps .au)
    if (hasClass(el, 'rj')) {
      const $au = $(el).find('.au');
      if ($au.length > 0 && currentSense) {
        currentSense.addAttribution($au.text().trim());
      }
      continue;
    }

    // Note
    if (hasClass(el, 'note')) {
      if (currentSense) {
        currentSense.setNote(getHtml($, el));
      } else {
        homographNote = getHtml($, el);
      }
      continue;
    }

    // Examples
    if (hasClass(el, 'as')) {
      if (currentSense) currentSense.setExamples(getHtml($, el));
      continue;
    }

    // Synonyms (homograph-level)
    if (hasClass(el, 'syn')) {
      synonyms = getHtml($, el);
      continue;
    }

    // Usage discussion (homograph-level)
    if (hasClass(el, 'usage')) {
      usage = getHtml($, el);
      continue;
    }

    // Compound forms
    if (hasClass(el, 'cs')) {
      compoundForms.push(...parseCompoundForms($, el));
      continue;
    }

    // Alternate spellings
    if (hasClass(el, 'altsp')) {
      const spellings: string[] = [];
      $(el)
        .find('.asp')
        .each((_, asp) => {
          const text = $(asp).text().trim();
          if (text) spellings.push(text);
        });
      alternateSpellings = spellings;
      continue;
    }
  }

  if (currentSense?.hasPayload()) {
    senses.push(currentSense.build());
  }

  return {
    headword,
    isAlternate,
    pronunciation,
    partOfSpeech,
    verbMorphology,
    etymology,
    senses,
    synonyms,
    usage,
    compoundForms,
    alternateSpellings,
    note: homographNote,
  };
}

// ─── Database writer ─────────────────────────────────────

function writeDatabase(
  sourceData: Record<string, string>,
  keys: ReadonlyArray<string>
): BuildResult {
  const dataDir = dirname(DB_FILE);
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  if (existsSync(DB_FILE)) unlinkSync(DB_FILE);

  const db = new Database(DB_FILE);

  db.run('PRAGMA journal_mode = MEMORY');
  db.run('PRAGMA synchronous = OFF');
  db.run('PRAGMA temp_store = MEMORY');
  db.run('PRAGMA locking_mode = EXCLUSIVE');

  db.run(`
    CREATE TABLE entries (
      key TEXT PRIMARY KEY,
      normalized_key TEXT NOT NULL,
      data TEXT NOT NULL
    )
  `);

  const insert = db.prepare(
    'INSERT INTO entries (key, normalized_key, data) VALUES ($key, $normalizedKey, $data)'
  );

  let parsedCount = 0;
  let errorCount = 0;

  const insertMany = db.transaction((entryKeys: ReadonlyArray<string>) => {
    for (let i = 0; i < entryKeys.length; i++) {
      const key = entryKeys[i];

      try {
        const rawHtml = sourceData[key];
        if (typeof rawHtml !== 'string') continue;

        const entry = parseEntry(key, rawHtml);
        insert.run({
          $key: entry.key,
          $normalizedKey: entry.normalizedKey,
          $data: JSON.stringify(entry),
        });
        parsedCount++;
      } catch (err) {
        errorCount++;
        if (errorCount <= 10) {
          console.error(`Error parsing "${key}":`, err);
        }
      } finally {
        delete sourceData[key];
      }

      if ((i + 1) % PROGRESS_EVERY === 0) {
        console.log(`  ${i + 1}/${entryKeys.length} parsed...`);
      }
    }
  });

  insertMany(keys);
  db.run('CREATE INDEX idx_normalized_key ON entries(normalized_key)');
  db.close();

  return { parsedCount, errorCount };
}

// ─── Main ────────────────────────────────────────────────

async function main(): Promise<void> {
  const sourceFingerprint = getSourceFingerprint();
  if (shouldSkipBuild(sourceFingerprint)) {
    console.log('Source dictionary unchanged. Skipping database rebuild.');
    return;
  }

  console.log('Reading source dictionary...');
  const raw = await Bun.file(SRC_FILE).text();
  const data: Record<string, string> = JSON.parse(raw);
  const keys = Object.keys(data);
  console.log(`Found ${keys.length} entries`);

  console.log('Parsing entries and writing database...');
  const result = writeDatabase(data, keys);

  console.log(`Parsed ${result.parsedCount} entries (${result.errorCount} errors)`);
  writeBuildMetadata(sourceFingerprint, result);
  console.log(`Database written to ${DB_FILE}`);
}

if (import.meta.main) {
  await main();
}
