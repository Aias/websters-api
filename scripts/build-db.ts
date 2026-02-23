import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import type {
  CompoundForm,
  DerivedForm,
  DictionaryEntry,
  Etymology,
  Homograph,
  InflectedForm,
  InlineHTML,
  PluralForm,
  Quotation,
  Sense,
} from '../app/lib/types.ts';

const ROOT = join(import.meta.dir, '..');
const SRC_FILE = join(ROOT, 'src', 'dict.json');
const DB_FILE = join(ROOT, 'app', 'data', 'dictionary.db');
const BUILD_META_FILE = join(ROOT, 'app', 'data', 'dictionary.build-meta.json');
const PROGRESS_EVERY = 10000;
// Bump when parser/build output semantics change to force a rebuild.
const PARSER_VERSION = 2;

interface SourceFingerprint {
  size: number;
  mtimeMs: number;
}

interface BuildMetadata {
  parserVersion: number;
  sourceSize: number;
  sourceMtimeMs: number;
  entryCount: number;
  errorCount: number;
}

interface BuildResult {
  parsedCount: number;
  errorCount: number;
}

interface BuildOptions {
  force: boolean;
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

function getOuterHtml($: cheerio.CheerioAPI, node: AnyNode): string {
  return $.html(node).trim();
}

function unwrapParenthesized(value: string): string {
  return value.trim().replace(/^\(/, '').replace(/\)$/, '');
}

function getAdjacentPronunciation($: cheerio.CheerioAPI, node: AnyNode): string | null {
  const next = $(node).next('.pr');
  if (next.length === 0) return null;
  return unwrapParenthesized(next.text());
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

  const parserVersion = Reflect.get(value, 'parserVersion');
  const sourceSize = Reflect.get(value, 'sourceSize');
  const sourceMtimeMs = Reflect.get(value, 'sourceMtimeMs');
  const entryCount = Reflect.get(value, 'entryCount');
  const errorCount = Reflect.get(value, 'errorCount');

  return (
    typeof parserVersion === 'number' &&
    Number.isFinite(parserVersion) &&
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

function shouldSkipBuild(source: SourceFingerprint, parserVersion: number): boolean {
  if (!existsSync(DB_FILE)) return false;
  const metadata = readBuildMetadata();
  if (!metadata) return false;

  return (
    metadata.parserVersion === parserVersion &&
    metadata.sourceSize === source.size &&
    metadata.sourceMtimeMs === source.mtimeMs
  );
}

function writeBuildMetadata(
  source: SourceFingerprint,
  result: BuildResult,
  parserVersion: number
): void {
  const metadata: BuildMetadata = {
    parserVersion,
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
      if (normalizedName === 'href' && typeof attributeValue === 'string') {
        if (attributeValue.startsWith('/entry/')) continue;
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
  return { html: getHtml($, node) };
}

// ─── Morphology parser ──────────────────────────────────

function parseMorphology(
  $: cheerio.CheerioAPI,
  node: Element,
  formClass: string
): ReadonlyArray<InflectedForm> {
  const forms: InflectedForm[] = [];
  const children = $(node).contents().toArray();

  let currentLabel = '';
  for (const child of children) {
    if (hasClass(child, 'pos')) {
      currentLabel = getText($, child);
    } else if (hasClass(child, formClass)) {
      const form = getText($, child);
      forms.push({ label: currentLabel, form, pronunciation: getAdjacentPronunciation($, child) });
    }
  }

  return forms;
}

// ─── Plural forms parser ────────────────────────────────

function parsePluralForms($: cheerio.CheerioAPI, node: Element): ReadonlyArray<PluralForm> {
  const forms: PluralForm[] = [];
  const children = $(node).contents().toArray();

  for (const child of children) {
    if (hasClass(child, 'plw')) {
      const form = getText($, child);
      if (!form) continue;
      forms.push({ form, pronunciation: getAdjacentPronunciation($, child) });
    }
  }

  return forms;
}

// ─── Derived forms parser ───────────────────────────────

function parseDerivedForms($: cheerio.CheerioAPI, node: Element): ReadonlyArray<DerivedForm> {
  const forms: DerivedForm[] = [];
  const children = $(node).contents().toArray();

  let pendingForm: string | null = null;
  let pendingPronunciation: string | null = null;

  function flush(partOfSpeech: string | null): void {
    if (!pendingForm) return;
    forms.push({ form: pendingForm, partOfSpeech, pronunciation: pendingPronunciation });
    pendingForm = null;
    pendingPronunciation = null;
  }

  for (const child of children) {
    if (hasClass(child, 'wf')) {
      // New form — flush any pending one (without POS)
      if (pendingForm) flush(null);
      pendingForm = getText($, child);
      continue;
    }

    if (hasClass(child, 'pr') && pendingForm) {
      pendingPronunciation = unwrapParenthesized(getText($, child));
      continue;
    }

    if (hasClass(child, 'pos') && pendingForm) {
      flush(getText($, child));
      continue;
    }
  }

  flush(null);
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
  let pendingHeadwordHtml: InlineHTML | null = null;
  let pendingEtymology: Etymology | null = null;
  let pendingField: string | null = null;
  let pendingDefinition: InlineHTML | null = null;
  let pendingMark: string | null = null;
  let pendingQuotations: Quotation[] = [];
  let pendingAttributions: string[] = [];
  // Accumulates inline quotation HTML from bare text/elements after cd
  let quotationHtmlParts: string[] = [];

  function flushQuotation(): void {
    if (quotationHtmlParts.length === 0) return;
    const html = quotationHtmlParts.join('').trim();
    if (html) {
      pendingQuotations.push({ html, author: null });
    }
    quotationHtmlParts = [];
  }

  function flush(): void {
    flushQuotation();
    if (
      !pendingDefinition &&
      pendingHeadwords.length === 0 &&
      !pendingEtymology &&
      !pendingField &&
      !pendingMark &&
      pendingQuotations.length === 0 &&
      pendingAttributions.length === 0
    )
      return;

    forms.push({
      headwords: pendingHeadwords,
      headwordHtml: pendingHeadwordHtml,
      etymology: pendingEtymology,
      field: pendingField,
      definition: pendingDefinition,
      mark: pendingMark,
      quotations: pendingQuotations,
      attributions: pendingAttributions,
    });

    pendingHeadwords = [];
    pendingHeadwordHtml = null;
    pendingEtymology = null;
    pendingField = null;
    pendingDefinition = null;
    pendingMark = null;
    pendingQuotations = [];
    pendingAttributions = [];
  }

  function appendHeadword(headword: string): void {
    if (headword) pendingHeadwords.push(headword);
  }

  for (const child of $(node).contents().toArray()) {
    if (isFiller(child)) continue;

    // Bare text nodes — accumulate as quotation content after a cd
    if (!isElement(child)) {
      if (child.type === 'text' && child.data.trim() && pendingDefinition) {
        // Skip dash-only separators between compound entries (en dash, em dash, hyphen)
        if (/^[\s\u2013\u2014\-,;.]+$/.test(child.data)) continue;
        quotationHtmlParts.push(child.data);
      }
      continue;
    }

    if (hasClass(child, 'mcol')) {
      flush();
      pendingHeadwordHtml = getHtml($, child);
      for (const nestedCol of $(child).find('.col').toArray()) {
        appendHeadword(getText($, nestedCol));
      }
      continue;
    }

    if (hasClass(child, 'col')) {
      // New headword signals start of a new form — flush any pending
      if (pendingDefinition) flush();
      appendHeadword(getText($, child));
      continue;
    }

    if (hasClass(child, 'ety')) {
      pendingEtymology = parseEtymology($, child);
      continue;
    }

    if (hasClass(child, 'fld')) {
      pendingField = getText($, child);
      continue;
    }

    if (hasClass(child, 'mark')) {
      const mark = getText($, child);
      if (!mark) continue;

      if (
        forms.length > 0 &&
        pendingHeadwords.length === 0 &&
        !pendingEtymology &&
        !pendingMark &&
        !pendingDefinition
      ) {
        const previous = forms[forms.length - 1];
        forms[forms.length - 1] = { ...previous, mark };
      } else {
        pendingMark = mark;
      }
      continue;
    }

    if (hasClass(child, 'sd')) {
      // Sub-definition label — flush current if we have a definition
      if (pendingDefinition) flush();
      continue;
    }

    if (hasClass(child, 'cd')) {
      // If there's already a pending definition (e.g. back-to-back cd), flush first
      if (pendingDefinition) flush();
      pendingDefinition = getHtml($, child) || null;
      continue;
    }

    if (hasClass(child, 'au')) {
      flushQuotation();
      const author = getText($, child).replace(/\.$/, '');
      if (author) {
        const lastQ = pendingQuotations[pendingQuotations.length - 1];
        if (lastQ && !lastQ.author) {
          pendingQuotations[pendingQuotations.length - 1] = { ...lastQ, author };
        } else {
          pendingAttributions.push(getText($, child));
        }
      }
      continue;
    }

    if (hasClass(child, 'q')) {
      flushQuotation();
      pendingQuotations.push(parseQuotation($, child));
      continue;
    }

    if (hasClass(child, 'rj')) {
      flushQuotation();
      const $au = $(child).find('.au');
      if ($au.length > 0) {
        const author = $au.text().trim().replace(/\.$/, '');
        const lastQ = pendingQuotations[pendingQuotations.length - 1];
        if (lastQ && !lastQ.author) {
          pendingQuotations[pendingQuotations.length - 1] = { ...lastQ, author };
        } else if (author) {
          pendingAttributions.push($au.text().trim());
        }
      }
      continue;
    }

    // Unrecognized inline elements after a definition — accumulate as quotation HTML
    if (pendingDefinition) {
      quotationHtmlParts.push(getOuterHtml($, child));
      continue;
    }
  }

  flush();
  return forms;
}

// ─── Sense builder ───────────────────────────────────────

class SenseBuilder {
  private number: string | null;
  private field: string | null = null;
  private definition: InlineHTML = '';
  private partOfSpeech: string | null = null;
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

  setPartOfSpeech(pos: string) {
    this.partOfSpeech = pos;
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
      partOfSpeech: this.partOfSpeech,
      mark: this.mark,
      quotations: this.quotations,
      attributions: this.attributions,
      examples: this.examples,
      note: this.note,
    };
  }
}

// ─── Main entry parser ──────────────────────────────────

interface HomographSection {
  hwNode: Element | null;
  alternateHwNodes: Element[];
  nodes: AnyNode[];
}

export function parseEntry(key: string, rawHtml: string): DictionaryEntry {
  const decodedKey = decodeHtmlCharRefs(key).normalize('NFC');
  const $ = loadPreprocessedDocument(rawHtml);
  const topNodes = $.root().contents().toArray();

  // Split into homograph sections by h2.hw
  const sections: HomographSection[] = [];
  let currentNodes: AnyNode[] = [];

  for (const node of topNodes) {
    // Strip ‖ marker that appears between homographs in source HTML.
    if (node.type === 'text' && node.data.includes('\u2016')) {
      const cleaned = node.data.replace(/\u2016/g, '');
      node.data = cleaned;
      if (cleaned.trim()) {
        currentNodes.push(node);
      }
      continue;
    }

    // mhw wraps multiple h2.hw elements — extract them as a single section
    if (isElement(node) && hasClass(node, 'mhw')) {
      const hwNodes = $(node).find('h2.hw').toArray();
      if (hwNodes.length > 0) {
        if (sections.length > 0 || currentNodes.length > 0) {
          if (sections.length === 0) {
            sections.push({
              hwNode: null,
              alternateHwNodes: [],
              nodes: currentNodes,
            });
          }
        }
        sections.push({
          hwNode: hwNodes[0],
          alternateHwNodes: hwNodes.slice(1),
          nodes: [],
        });
        currentNodes = sections[sections.length - 1].nodes;
      }
      continue;
    }

    if (isElement(node) && hasClass(node, 'hw') && isTag(node, 'h2')) {
      if (sections.length > 0 || currentNodes.length > 0) {
        if (sections.length === 0) {
          // Pre-hw content
          sections.push({
            hwNode: null,
            alternateHwNodes: [],
            nodes: currentNodes,
          });
        }
      }
      sections.push({
        hwNode: node,
        alternateHwNodes: [],
        nodes: [],
      });
      currentNodes = sections[sections.length - 1].nodes;
      continue;
    }

    currentNodes.push(node);
  }

  // No .hw found — single homograph using JSON key
  if (sections.length === 0) {
    sections.push({
      hwNode: null,
      alternateHwNodes: [],
      nodes: currentNodes,
    });
  }

  // Merge pre-hw content into first real section
  if (sections.length > 1 && sections[0].hwNode === null) {
    const preContent = sections.shift();
    if (preContent) {
      sections[0].nodes = [...preContent.nodes, ...sections[0].nodes];
    }
  }

  const homographs: Homograph[] = sections.map((section) =>
    parseHomograph($, decodedKey, section.hwNode, section.alternateHwNodes, section.nodes)
  );

  return { key: decodedKey, homographs };
}

function parseHomograph(
  $: cheerio.CheerioAPI,
  entryKey: string,
  hwNode: Element | null,
  alternateHwNodes: Element[],
  nodes: AnyNode[]
): Homograph {
  const headword = hwNode ? getText($, hwNode) : entryKey;
  const alternateHeadwords = alternateHwNodes.map((hw) => getText($, hw));
  let pronunciation: string | null = null;
  let partOfSpeech: string | null = null;
  let morphology: ReadonlyArray<InflectedForm> | null = null;
  let pluralForms: ReadonlyArray<PluralForm> | null = null;
  let etymology: Etymology | null = null;
  let synonyms: InlineHTML | null = null;
  let usage: InlineHTML | null = null;
  const compoundForms: CompoundForm[] = [];
  let derivedForms: ReadonlyArray<DerivedForm> | null = null;
  let alternateSpellings: string[] | null = null;
  let homographNote: InlineHTML | null = null;

  const senses: Sense[] = [];
  let currentSense: SenseBuilder | null = null;
  let inHeader = true;

  /** Handle sense/sub-sense number — shared by sn and sd */
  function handleSenseNumber(number: string): void {
    if (!currentSense) {
      currentSense = new SenseBuilder(number);
    } else if (currentSense.hasPayload()) {
      senses.push(currentSense.build());
      currentSense = new SenseBuilder(number);
    } else {
      currentSense.setNumber(number);
    }
    inHeader = false;
  }

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
      pronunciation = unwrapParenthesized(getText($, el));
      continue;
    }

    if (hasClass(el, 'pos') && inHeader && !partOfSpeech) {
      partOfSpeech = getText($, el);
      continue;
    }

    if (hasClass(el, 'vmorph')) {
      morphology = parseMorphology($, el, 'conjf');
      continue;
    }

    if (hasClass(el, 'amorph')) {
      morphology = parseMorphology($, el, 'adjf');
      continue;
    }

    if (hasClass(el, 'plu')) {
      pluralForms = parsePluralForms($, el);
      continue;
    }

    if (hasClass(el, 'ety') && inHeader && !etymology) {
      etymology = parseEtymology($, el);
      continue;
    }

    // Sense number
    if (hasClass(el, 'sn')) {
      handleSenseNumber(getText($, el));
      continue;
    }

    // Sub-definition label — acts as a sense delimiter like sn
    if (hasClass(el, 'sd')) {
      handleSenseNumber(getText($, el));
      continue;
    }

    // Definition
    if (hasClass(el, 'def')) {
      inHeader = false;
      if (!currentSense) currentSense = new SenseBuilder(null);
      currentSense.setDefinition(getHtml($, el));
      continue;
    }

    // def2 — secondary POS definition block; iterate children inline
    if (hasClass(el, 'def2')) {
      inHeader = false;
      if (currentSense?.hasPayload()) {
        senses.push(currentSense.build());
      }
      currentSense = null;
      const sensesBeforeDef2 = senses.length;
      let sensePOS: string | null = null;
      for (const child of $(el).contents().toArray()) {
        if (!isElement(child)) continue;
        if (hasClass(child, 'pos')) {
          sensePOS = getText($, child);
        } else if (hasClass(child, 'sn') || hasClass(child, 'sd')) {
          handleSenseNumber(getText($, child));
        } else if (hasClass(child, 'def')) {
          if (!currentSense) currentSense = new SenseBuilder(null);
          currentSense.setDefinition(getHtml($, child));
        } else if (hasClass(child, 'fld')) {
          if (!currentSense) currentSense = new SenseBuilder(null);
          currentSense.setField(getText($, child));
        } else if (hasClass(child, 'mark')) {
          if (currentSense) currentSense.setMark(getText($, child));
        }
      }
      // Apply POS to all senses created within this def2 block
      if (sensePOS) {
        for (let si = sensesBeforeDef2; si < senses.length; si++) {
          senses[si] = { ...senses[si], partOfSpeech: sensePOS };
        }
        if (currentSense) {
          currentSense.setPartOfSpeech(sensePOS);
        }
      }
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

    // Derived word forms
    if (hasClass(el, 'wordforms')) {
      const forms = parseDerivedForms($, el);
      if (forms.length > 0) {
        derivedForms = [...(derivedForms ?? []), ...forms];
      }
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

    // Catch-all: unrecognized element — preserve as inline content
    if (currentSense) {
      currentSense.appendToDefinition(getOuterHtml($, el));
    }
  }

  if (currentSense?.hasPayload()) {
    senses.push(currentSense.build());
  }

  return {
    headword,
    alternateHeadwords,
    pronunciation,
    partOfSpeech,
    morphology,
    pluralForms,
    etymology,
    senses,
    synonyms,
    usage,
    compoundForms,
    derivedForms,
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
          $normalizedKey: normalizeKey(entry.key),
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

function parseBuildOptions(args: ReadonlyArray<string>): BuildOptions {
  let force = false;

  for (const arg of args) {
    if (arg === '--force' || arg === '-f') {
      force = true;
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return { force };
}

async function main(options: BuildOptions): Promise<void> {
  const sourceFingerprint = getSourceFingerprint();
  if (!options.force && shouldSkipBuild(sourceFingerprint, PARSER_VERSION)) {
    console.log('Source dictionary unchanged. Skipping database rebuild.');
    return;
  }

  if (options.force) {
    console.log('Force rebuild requested; rebuilding dictionary database.');
  }

  console.log('Reading source dictionary...');
  const raw = await Bun.file(SRC_FILE).text();
  const data: Record<string, string> = JSON.parse(raw);
  const keys = Object.keys(data);
  console.log(`Found ${keys.length} entries`);

  console.log('Parsing entries and writing database...');
  const result = writeDatabase(data, keys);

  console.log(`Parsed ${result.parsedCount} entries (${result.errorCount} errors)`);
  writeBuildMetadata(sourceFingerprint, result, PARSER_VERSION);
  console.log(`Database written to ${DB_FILE}`);
}

if (import.meta.main) {
  const options = parseBuildOptions(Bun.argv.slice(2));
  await main(options);
}
