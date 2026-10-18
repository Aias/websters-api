import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import { normalizeLookup } from '../app/lib/lookup';
import { slugify } from '../app/lib/slug.ts';
import type {
  CompoundForm,
  DictionaryEntry,
  HeaderPart,
  Homograph,
  InlineBlock,
  LexicalBlock,
  Quotation,
  Sense,
} from '../app/lib/types.ts';
import { readDictionarySource, sourceFingerprint } from './dictionary-source';
import { entryAliases, unambiguousAliases } from './entry-aliases';
import { normalizeSourceTypography } from './source-typography';

const ROOT = join(import.meta.dir, '..');
const DB_FILE = join(ROOT, 'app', 'data', 'dictionary.db');
const BUILD_META_FILE = join(ROOT, 'app', 'data', 'dictionary.build-meta.json');
const PROGRESS_EVERY = 10000;
// Bump when parser/build output semantics change to force a rebuild.
const PARSER_VERSION = 15;

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

function getText($: cheerio.CheerioAPI, node: AnyNode): string {
  return $(node).text().trim();
}

function getHtml($: cheerio.CheerioAPI, node: AnyNode): string {
  return $(node).html() ?? '';
}

function getOuterHtml($: cheerio.CheerioAPI, node: AnyNode): string {
  const $clone = $(node).clone();
  $clone.find('h2').each((_, child) => {
    child.tagName = 'strong';
  });
  return $clone.toString();
}

function unwrapParenthesized(value: string): string {
  return value.trim().replace(/^\(/, '').replace(/\)$/, '');
}

function decodeHtmlCharRefs(str: string): string {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)));
}

function normalizeKey(key: string): string {
  return normalizeLookup(decodeHtmlCharRefs(key));
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
  const $ = cheerio.load(
    html,
    { xml: { xmlMode: false, recognizeSelfClosing: true, encodeEntities: 'utf8' } },
    false
  );

  // Drop executable containers from trusted source before extracting any HTML fragments.
  $('script,style,iframe,object,embed,template').remove();
  $('.ver').remove();

  $('*').each((_, el) => {
    if (!isElement(el)) return;

    if (el.tagName === 'b') {
      el.tagName = 'strong';
    } else if (el.tagName === 'i') {
      el.tagName = 'em';
    } else if (el.tagName === 'div') {
      el.tagName = hasClass(el, 'q') ? 'blockquote' : 'span';
    }

    if (hasClass(el, 'er')) {
      const slug = slugify(normalizeLookup($(el).text()));
      if (slug) {
        el.tagName = 'a';
        el.attribs['href'] = `/entry/${slug}`;
      }
    }

    for (const [attributeName, attributeValue] of Object.entries(el.attribs)) {
      const normalizedName = attributeName.toLowerCase();

      if (normalizedName === 'class') continue;
      if (
        el.tagName === 'img' &&
        (normalizedName === 'alt' ||
          (normalizedName === 'src' && /^\/illustrations\/[a-z0-9-]+\.png$/.test(attributeValue)) ||
          (['width', 'height'].includes(normalizedName) && /^[1-9]\d*$/.test(attributeValue)))
      )
        continue;
      if (
        normalizedName === 'data-scope' &&
        attributeValue === 'homograph' &&
        (hasClass(el, 'syn') || hasClass(el, 'note'))
      )
        continue;
      if (
        normalizedName === 'colspan' &&
        /^(?:[1-9]\d*)$/.test(attributeValue) &&
        (hasClass(el, 'td') || hasClass(el, 'th') || el.tagName === 'td' || el.tagName === 'th')
      )
        continue;
      if (normalizedName === 'href' && typeof attributeValue === 'string') {
        if (attributeValue.startsWith('/entry/')) continue;
      }
      delete el.attribs[attributeName];
    }
  });

  $('.pr').each((_, node) => {
    const placeholder =
      /^\(\s*[#?�](?:\s*or\s*[#?�])*\s*(?:[;,]\s*(\d+(?:\s*,\s*\d+)*)\s*)?\)$/.exec(
        getText($, node)
      );
    if (placeholder?.[1]) $(node).text(`(${placeholder[1]})`);
    else if (placeholder) $(node).remove();
  });
  $('h2.hw, .col').each((_, node) => {
    const previous = node.previousSibling;
    if (previous?.type === 'text' && /‖\s*$/.test(previous.data)) {
      previous.data = previous.data.replace(/‖\s*$/, '');
      $(node).prepend('‖');
    }
  });

  normalizeSourceTypography($);

  // Normalize whitespace: move leading/trailing spaces outside inline elements
  // so CSS decorations (underlines, etc.) don't extend over whitespace.
  // Merge into adjacent text nodes rather than creating whitespace-only nodes
  // (which get filtered by parsers that skip empty text).
  // Process in reverse document order so nested elements propagate outward.
  const inlineElements = $('em, span, strong, a').toArray().reverse();
  for (const el of inlineElements) {
    const { children } = el;
    if (children.length === 0) continue;

    const last = children[children.length - 1];
    if (last.type === 'text') {
      const trailing = last.data.match(/(\s+)$/);
      if (trailing) {
        last.data = last.data.slice(0, -trailing[1].length);
        const next = el.nextSibling;
        if (next?.type === 'text') {
          next.data = trailing[1] + next.data;
        } else {
          $(el).after(trailing[1]);
        }
      }
    }

    const first = children[0];
    if (first.type === 'text') {
      const leading = first.data.match(/^(\s+)/);
      if (leading) {
        first.data = first.data.slice(leading[1].length);
        const prev = el.previousSibling;
        if (prev?.type === 'text') {
          prev.data += leading[1];
        } else {
          $(el).before(leading[1]);
        }
      }
    }
  }

  $.root()
    .find('*')
    .addBack()
    .contents()
    .each((_, node) => {
      if (node.type === 'text' && $(node).parents('pre,table').length === 0) {
        const previous = node.prev;
        if (previous && isElement(previous) && /\p{L}$/u.test($(previous).text()))
          node.data = node.data.replace(/^\{\d+\}/, '');
        node.data = node.data
          .replace(/(?<=\p{L})\{\d+\}/gu, '')
          .replace(/(?<!\.)[ \t]+([,;:!?)]|\.(?![\s.]*\.|\d))/g, '$1');
      }
    });

  return $;
}

export function preprocess(html: string): string {
  return loadPreprocessedDocument(html).html();
}

interface MutableSense extends Sense {
  content: LexicalBlock[];
}

interface MutableCompound extends CompoundForm {
  headwords: string[];
  content: LexicalBlock[];
}

interface ContentScope {
  content: LexicalBlock[];
  senses: { level: number; sense: MutableSense }[];
}

function contentTarget(scope: ContentScope): LexicalBlock[] {
  return scope.senses.at(-1)?.sense.content ?? scope.content;
}

function inlineHtml($: cheerio.CheerioAPI, node: Element): string {
  const $clone = $(node).clone();
  $clone.find('h2').each((_, child) => {
    child.tagName = 'strong';
  });
  return $clone.html() ?? '';
}

function parseQuotation($: cheerio.CheerioAPI, node: Element): Quotation {
  const $clone = $(node).clone();
  const authors = $clone
    .find('.qau')
    .toArray()
    .map((author) => getText($, author));
  $clone.find('.qau').remove();
  return { kind: 'quotation', html: ($clone.html() ?? '').trim(), authors };
}

function endsHomograph(node: AnyNode): boolean {
  const boundary = (other: AnyNode) => isTag(other, 'h2') && hasClass(other, 'hw');
  let senseBetween = false;
  for (let earlier = node.prev; earlier && !boundary(earlier); earlier = earlier.prev) {
    if (hasClass(earlier, 'sn') || hasClass(earlier, 'sd')) senseBetween = true;
    else if (senseBetween && hasClass(earlier, 'wordforms')) return false;
  }
  for (let later = node.next; later && !boundary(later); later = later.next) {
    if (isBr(later) || (later.type === 'text' && /^[\s\u2013\u2014.,;]*$/.test(later.data)))
      continue;
    if (!['wordforms', 'rj', 'au', 'qau', 'mark'].some((cls) => hasClass(later, cls))) return false;
  }
  return true;
}

function parseContent($: cheerio.CheerioAPI, nodes: ReadonlyArray<AnyNode>): LexicalBlock[] {
  const main: ContentScope = { content: [], senses: [] };
  let compound: { form: MutableCompound; scope: ContentScope; complete: boolean } | null = null;
  let continuation: LexicalBlock[] | null = null;

  function target(): LexicalBlock[] {
    return continuation ?? contentTarget(compound?.scope ?? main);
  }

  function addHtml(kind: InlineBlock['kind'], html: string): void {
    if (!html) return;
    const blocks = target();
    const previous = blocks[blocks.length - 1];
    if (kind === 'forms' && blocks.length === 1 && previous.kind === 'text') {
      blocks[0] = { kind, html: (previous.html + html).replace(/^\s*;\s*/, '') };
      return;
    }
    if (previous?.kind === kind && (kind === 'text' || kind === 'forms' || kind === 'definition')) {
      const space = kind !== 'text' && !/\s$/.test(previous.html) && !/^[\s,.;:!?)\]}]/.test(html);
      blocks[blocks.length - 1] = {
        ...previous,
        html: previous.html + (space ? ' ' : '') + html,
      };
    } else {
      blocks.push({ kind, html });
    }
  }

  function addNumber(number: string, sub: boolean, inCompound: boolean): void {
    continuation = null;
    if (!inCompound && !sub) compound = null;
    const scope = compound?.scope ?? main;
    const level = sub ? (/^[IVXLCDM]+[.)]?$/.test(number) ? 0 : 2) : 1;
    const previous = scope.senses.at(-1);
    if (
      previous?.level === level &&
      previous.sense.number === number &&
      previous.sense.content.every(
        (block) => block.kind === 'label' || (block.kind === 'text' && !block.html.trim())
      )
    )
      return;
    while (scope.senses.length > 0 && (scope.senses.at(-1)?.level ?? -1) >= level)
      scope.senses.pop();
    const sense: MutableSense = { kind: 'sense', number, content: [] };
    contentTarget(scope).push(sense);
    scope.senses.push({ level, sense });
  }

  function trailingContent(content: LexicalBlock[]): LexicalBlock[] {
    const last = content.at(-1);
    if (last?.kind !== 'sense' && last?.kind !== 'section') return content;
    const nested = [...last.content];
    content[content.length - 1] = { ...last, content: nested };
    return trailingContent(nested);
  }

  function addCompound(node: Element): void {
    continuation = null;
    const headwords = hasClass(node, 'mcol')
      ? $(node)
          .find('.col')
          .toArray()
          .map((word) => getText($, word).replace(/^‖\s*/, ''))
      : [getText($, node).replace(/^‖\s*/, '')];
    if (
      compound &&
      !compound.complete &&
      compound.form.content.every(
        (block) =>
          block.kind === 'text' &&
          /^[\s,]*(?:(?:or|and)[\s,]*)?$/i.test(cheerio.load(block.html).text())
      )
    ) {
      const connector = compound.form.content
        .map((block) => (block.kind === 'text' ? block.html : ''))
        .join('');
      compound.form.headwords.push(...headwords);
      compound.form.headwordHtml += `${connector || ', '}${inlineHtml($, node).trim()}`;
      compound.form.content.length = 0;
      return;
    }
    const form: MutableCompound = {
      kind: 'compound',
      headwords,
      headwordHtml: inlineHtml($, node).trim(),
      content: [],
    };
    main.senses = [];
    main.content.push(form);
    compound = { form, scope: { content: form.content, senses: [] }, complete: false };
  }

  function process(node: AnyNode, inCompound: boolean): void {
    if (isBr(node)) return;
    if (!isElement(node)) {
      if (node.type !== 'text') return;
      const blocks = target();
      if (!node.data.trim()) {
        if (blocks.length > 0 || compound) addHtml('text', getOuterHtml($, node));
        return;
      }
      if (/^[\s\u2013\u2014{}]+$/.test(node.data) || (inCompound && /^[\s-]+$/.test(node.data))) {
        if (compound && /[-\u2013\u2014]/.test(node.data)) compound.complete = true;
        return;
      }
      if (
        node.nextSibling &&
        (hasClass(node.nextSibling, 'col') || hasClass(node.nextSibling, 'mcol')) &&
        /[\u2013\u2014]\s*$/.test(node.data)
      ) {
        node.data = node.data.replace(/\s*[\u2013\u2014]\s*$/, '');
        if (compound) compound.complete = true;
      }
      const previous = blocks[blocks.length - 1];
      addHtml(previous?.kind === 'forms' ? 'forms' : 'text', getOuterHtml($, node));
      return;
    }

    if (hasClass(node, 'cs')) {
      compound = null;
      main.senses = [];
      continuation = null;
      for (const child of $(node).contents().toArray()) process(child, true);
      return;
    }
    if (hasClass(node, 'col') || hasClass(node, 'mcol')) {
      addCompound(node);
      return;
    }
    if (hasClass(node, 'sn') || hasClass(node, 'sd')) {
      const number = getText($, node);
      if (hasClass(node, 'sd') && !/^(?:\(?[a-z]\)|[IVXLCDM]+[.)]?|\(?\d+[.)]?)$/.test(number))
        addHtml('label', getOuterHtml($, node));
      else addNumber(number, hasClass(node, 'sd'), inCompound);
      return;
    }
    if (hasClass(node, 'plu') && /^\(pl\.\)$/.test(getText($, node))) {
      addHtml('label', getOuterHtml($, node));
      return;
    }
    if (
      !inCompound &&
      (compound || (hasClass(node, 'wordforms') && endsHomograph(node))) &&
      [
        'def2',
        'vmorph',
        'amorph',
        'nmorph',
        'plu',
        'sing',
        'wordforms',
        'note',
        'syn',
        'usage',
      ].some((cls) => hasClass(node, cls))
    ) {
      compound = null;
      main.senses = [];
      continuation = null;
    }
    if (
      hasClass(node, 'def2') ||
      (hasClass(node, 'wordforms') && $(node).find('.def,.def2,.hw').length > 0)
    ) {
      const content = parseContent($, $(node).contents().toArray());
      continuation = null;
      const scope = compound?.scope ?? main;
      scope.content.push({ kind: 'section', content });
      scope.senses = [];
      continuation = trailingContent(content);
      return;
    }
    if (hasClass(node, 'q')) {
      target().push(parseQuotation($, node));
      return;
    }
    if (hasClass(node, 'au') || hasClass(node, 'qau') || hasClass(node, 'rj')) {
      const blocks = target();
      let previousIndex = blocks.length - 1;
      while (previousIndex >= 0) {
        const previous = blocks[previousIndex];
        if (previous.kind !== 'text' || previous.html.trim()) break;
        previousIndex--;
      }
      const previous = blocks[previousIndex];
      if (previous?.kind === 'quotation') {
        const authors = hasClass(node, 'rj')
          ? $(node)
              .find('.au,.qau')
              .toArray()
              .map((author) => getText($, author))
          : [getText($, node)];
        if (authors.length > 0) {
          blocks[previousIndex] = { ...previous, authors: [...previous.authors, ...authors] };
          return;
        }
      }
      if (
        previous?.kind === 'note' ||
        previous?.kind === 'usage' ||
        previous?.kind === 'synonyms' ||
        previous?.kind === 'forms'
      ) {
        blocks[previousIndex] = {
          ...previous,
          html: `${previous.html.trimEnd()} ${getOuterHtml($, node)}`,
        };
        return;
      }
      addHtml('text', getOuterHtml($, node));
      return;
    }
    if (hasClass(node, 'def') || hasClass(node, 'cd')) {
      if (compound) compound.complete = true;
      addHtml('definition', inlineHtml($, node));
      return;
    }
    if (
      ['vmorph', 'amorph', 'nmorph', 'plu', 'sing', 'wordforms'].some((cls) => hasClass(node, cls))
    ) {
      addHtml('forms', inlineHtml($, node));
      return;
    }
    if (hasClass(node, 'plw') || hasClass(node, 'pr')) {
      addHtml('forms', getOuterHtml($, node));
      return;
    }
    if (hasClass(node, 'ety')) {
      addHtml('etymology', getHtml($, node));
      return;
    }
    if (
      (hasClass(node, 'note') || hasClass(node, 'syn')) &&
      node.attribs['data-scope'] === 'homograph'
    ) {
      compound = null;
      main.senses = [];
      continuation = null;
    }
    if (hasClass(node, 'note')) {
      addHtml('note', getHtml($, node));
      return;
    }
    if (hasClass(node, 'syn')) {
      addHtml('synonyms', getHtml($, node));
      return;
    }
    if (hasClass(node, 'usage')) {
      addHtml('usage', getHtml($, node));
      return;
    }
    if (['pos', 'fld', 'mark'].some((cls) => hasClass(node, cls))) {
      addHtml('label', getOuterHtml($, node));
      return;
    }
    if (isTag(node, 'h2') && hasClass(node, 'hw')) {
      addHtml('text', `<strong>${getHtml($, node)}</strong>`);
      return;
    }
    addHtml('text', getOuterHtml($, node));
  }

  for (const node of nodes) process(node, false);
  return main.content;
}

function parseHomograph(
  $: cheerio.CheerioAPI,
  key: string,
  nodes: ReadonlyArray<AnyNode>,
  grouped: ReadonlySet<AnyNode>
): Homograph {
  const header: HeaderPart[] = [];
  const body: AnyNode[] = [];
  let inHeader = true;
  let skip = 0;
  for (const [index, node] of nodes.entries()) {
    const next = nodes.slice(index + 1).find((later) => later.type !== 'text' || later.data.trim());
    const after = nodes[index + 2];
    if (skip > 0) {
      skip--;
    } else if (isElement(node) && isTag(node, 'h2') && hasClass(node, 'hw')) {
      header.push({ kind: 'headword', text: getText($, node) });
      inHeader = true;
    } else if (inHeader && hasClass(node, 'pr')) {
      header.push({ kind: 'pronunciation', html: getHtml($, node).trim() });
    } else if (inHeader && hasClass(node, 'pos')) {
      header.push({ kind: 'partOfSpeech', text: getText($, node) });
    } else if (inHeader && hasClass(node, 'mark') && next && hasClass(next, 'pos')) {
      header.push({ kind: 'inline', html: getOuterHtml($, node) });
    } else if (
      inHeader &&
      header.at(-1)?.kind === 'partOfSpeech' &&
      node.type === 'text' &&
      /^\s*of\s*$/.test(node.data) &&
      hasClass(nodes[index + 1] ?? node, 'er') &&
      after?.type === 'text' &&
      after.data.startsWith('.')
    ) {
      header.push({ kind: 'inline', html: `of ${getOuterHtml($, nodes[index + 1])}.` });
      after.data = after.data.slice(1);
      skip = 1;
    } else if (
      inHeader &&
      header.at(-1)?.kind === 'partOfSpeech' &&
      node.type === 'text' &&
      /^\s*of\s+\p{Lu}[\p{L}′ˊ-]*\.\s*$/u.test(node.data)
    ) {
      header.push({ kind: 'inline', html: getOuterHtml($, node).trim() });
    } else if (inHeader && header.at(-1)?.kind === 'partOfSpeech' && hasClass(node, 'mord')) {
      const following = nodes[index + 1];
      const period = following?.type === 'text' && following.data.startsWith('.');
      header.push({ kind: 'inline', html: getHtml($, node).trim() + (period ? '.' : '') });
      if (period) following.data = following.data.slice(1);
    } else if (inHeader && node.type === 'text' && /^[\s.,;:{}‖]*$/.test(node.data)) {
      if (
        /[,;]/.test(node.data) &&
        header.at(-1)?.kind === 'partOfSpeech' &&
        next &&
        hasClass(next, 'pos')
      ) {
        header.push({ kind: 'text', text: node.data.replace(/[^,;]/g, '') });
      } else if (
        /[,;]/.test(node.data) &&
        nodes.slice(index + 1).some((later) => hasClass(later, 'hw'))
      ) {
        const punctuation = node.data.replace(/[^,;]/g, '');
        const previous = header.at(-1);
        if (previous?.kind === 'forms')
          header[header.length - 1] = { ...previous, html: previous.html.trimEnd() + punctuation };
        else header.push({ kind: 'text', text: punctuation });
      }
      continue;
    } else if (
      /^[\s,;]*(or|also)[\s,;]*$/i.test(getText($, node)) &&
      (inHeader || hasClass(nodes[index + 1] ?? node, 'hw'))
    ) {
      header.push(
        isElement(node)
          ? { kind: 'inline', html: getOuterHtml($, node) }
          : { kind: 'text', text: getText($, node) }
      );
    } else if (
      isElement(node) &&
      ['vmorph', 'amorph', 'nmorph', 'plu', 'sing'].some((cls) => hasClass(node, cls)) &&
      nodes.slice(index + 1).some((later) => hasClass(later, 'hw'))
    ) {
      header.push({ kind: 'forms', html: inlineHtml($, node) });
    } else if (
      !isBr(node) &&
      (grouped.has(node) || nodes.slice(index + 1).some((later) => hasClass(later, 'hw')))
    ) {
      const html = getOuterHtml($, node).replace(/[{}]/g, '');
      if (html.trim()) header.push({ kind: 'inline', html });
    } else if (!isBr(node)) {
      inHeader = false;
      body.push(node);
    }
  }
  const headwords = header
    .filter((part) => part.kind === 'headword')
    .map((part) => part.text.replace(/^‖\s*/, ''));
  if (headwords.length === 0) header.unshift({ kind: 'headword', text: key });
  const pronunciation = header
    .flatMap((part) => (part.kind === 'pronunciation' ? [cheerio.load(part.html).text()] : []))
    .find((text) => !/^\([\d,\s]+\)$/.test(text));
  return {
    headword: headwords[0] ?? key,
    alternateHeadwords: headwords.slice(1),
    pronunciation: pronunciation ? unwrapParenthesized(pronunciation) : null,
    partOfSpeech: header.find((part) => part.kind === 'partOfSpeech')?.text ?? null,
    header,
    content: parseContent($, body),
  };
}

export function parseEntry(key: string, rawHtml: string): DictionaryEntry {
  const decodedKey = decodeHtmlCharRefs(key).normalize('NFC');
  const $ = loadPreprocessedDocument(rawHtml);
  const sections: AnyNode[][] = [[]];
  let current = sections[0];
  let hasHeadword = false;
  let hasBody = false;
  const grouped = new Set<AnyNode>();
  function collect(node: AnyNode, inGroup: boolean): void {
    if (isElement(node) && hasClass(node, 'mhw')) {
      for (const child of $(node).contents().toArray()) collect(child, true);
      return;
    }
    if (inGroup) grouped.add(node);
    if (isElement(node) && isTag(node, 'h2') && hasClass(node, 'hw')) {
      if (hasHeadword && hasBody) {
        current = [];
        sections.push(current);
        hasBody = false;
      }
      hasHeadword = true;
    } else if (
      isElement(node) &&
      ['def', 'def2', 'sn', 'sd', 'q', 'cs', 'col', 'cd', 'note', 'syn', 'usage', 'wordforms'].some(
        (cls) => hasClass(node, cls)
      )
    ) {
      hasBody = true;
    } else if (
      !inGroup &&
      node.type === 'text' &&
      /[\p{L}\p{N}]/u.test(node.data) &&
      !/^[\s,;]*(also|or)[\s,;]*$/i.test(node.data)
    ) {
      hasBody = true;
    }
    current.push(node);
  }
  for (const node of $.root().contents().toArray()) collect(node, false);
  return {
    key: decodedKey,
    slug: slugify(decodedKey),
    homographs: sections.map((nodes) => parseHomograph($, decodedKey, nodes, grouped)),
  };
}

// ─── Database writer ─────────────────────────────────────

function writeDatabase(sourceData: Map<string, string>, keys: ReadonlyArray<string>): BuildResult {
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
      slug TEXT NOT NULL UNIQUE,
      data TEXT NOT NULL
    )
  `);
  db.run('CREATE TABLE aliases (normalized_key TEXT PRIMARY KEY, key TEXT NOT NULL)');
  const aliasesByEntry = new Map<string, ReadonlyArray<string>>();

  const insert = db.prepare(
    'INSERT INTO entries (key, normalized_key, slug, data) VALUES ($key, $normalizedKey, $slug, $data)'
  );

  let parsedCount = 0;
  let errorCount = 0;

  const insertMany = db.transaction((entryKeys: ReadonlyArray<string>) => {
    for (let i = 0; i < entryKeys.length; i++) {
      const key = entryKeys[i];

      try {
        const rawHtml = sourceData.get(key);
        if (rawHtml === undefined) continue;

        const entry = parseEntry(key, rawHtml);
        aliasesByEntry.set(entry.key, entryAliases(entry.key, rawHtml));
        insert.run({
          $key: entry.key,
          $normalizedKey: normalizeKey(entry.key),
          $slug: entry.slug,
          $data: JSON.stringify(entry),
        });
        parsedCount++;
      } catch (err) {
        errorCount++;
        if (errorCount <= 10) {
          console.error(`Error parsing "${key}":`, err);
        }
      } finally {
        sourceData.delete(key);
      }

      if ((i + 1) % PROGRESS_EVERY === 0) {
        console.log(`  ${i + 1}/${entryKeys.length} parsed...`);
      }
    }
  });

  insertMany(keys);
  const insertAlias = db.prepare('INSERT INTO aliases (normalized_key, key) VALUES (?, ?)');
  db.transaction(() => {
    for (const [alias, key] of unambiguousAliases(aliasesByEntry)) {
      insertAlias.run(alias, key);
    }
  })();
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

function main(options: BuildOptions): void {
  const fingerprint = sourceFingerprint();
  if (!options.force && shouldSkipBuild(fingerprint, PARSER_VERSION)) {
    console.log('Source dictionary unchanged. Skipping database rebuild.');
    return;
  }

  if (options.force) {
    console.log('Force rebuild requested; rebuilding dictionary database.');
  }

  console.log('Reading source dictionary...');
  const data = readDictionarySource();
  const keys = [...data.keys()];
  console.log(`Found ${keys.length} entries`);

  console.log('Parsing entries and writing database...');
  const result = writeDatabase(data, keys);

  console.log(`Parsed ${result.parsedCount} entries (${result.errorCount} errors)`);
  writeBuildMetadata(fingerprint, result, PARSER_VERSION);
  console.log(`Database written to ${DB_FILE}`);
}

if (import.meta.main) {
  const options = parseBuildOptions(Bun.argv.slice(2));
  main(options);
}
