import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import { normalizeLookup } from '../app/lib/lookup';
import { entryQuotations } from '../app/lib/quotation-authors';
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
import { createEntryReferences, decodeEntryKey, type EntryResolver } from './entry-references';
import { getHtml, getOuterHtml, getText, hasClass, isBr, isElement, isTag } from './source-dom';
import { loadPreprocessedDocument } from './source-preprocessing';

const ROOT = join(import.meta.dir, '..');
const DB_FILE = join(ROOT, 'app', 'data', 'dictionary.db');
const BUILD_META_FILE = join(ROOT, 'app', 'data', 'dictionary.build-meta.json');
const PROGRESS_EVERY = 10000;
// Bump when parser/build output semantics change to force a rebuild.
const PARSER_VERSION = 32;

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

function unwrapParenthesized(value: string): string {
  return value.trim().replace(/^\(/, '').replace(/\)$/, '');
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

export function preprocess(html: string, resolve?: EntryResolver): string {
  return loadPreprocessedDocument(html, resolve).html();
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
  return getOuterHtml($, node, !hasClass(node, 'col') && !hasClass(node, 'mcol'));
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
  let compound: {
    form: MutableCompound;
    scope: ContentScope;
    parent: LexicalBlock[];
    complete: boolean;
  } | null = null;
  let continuation: LexicalBlock[] | null = null;

  function target(): LexicalBlock[] {
    return continuation ?? contentTarget(compound?.scope ?? main);
  }

  function addHtml(kind: InlineBlock['kind'], html: string): void {
    if (!html) return;
    const blocks = target();
    const previous = blocks[blocks.length - 1];
    if (
      kind === 'text' &&
      /^[\s]*[.,;:!?][\s.,;:!?]*$/.test(html) &&
      (previous?.kind === 'synonyms' ||
        previous?.kind === 'note' ||
        previous?.kind === 'usage' ||
        previous?.kind === 'forms')
    ) {
      blocks[blocks.length - 1] = { ...previous, html: previous.html + html };
      return;
    }
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

  function addCompound(node: Element, parent: LexicalBlock[]): void {
    continuation = null;
    const headwords = (hasClass(node, 'mcol') ? $(node).find('.col') : $(node))
      .filter((_, word) => $(word).attr('data-headword') !== '')
      .toArray()
      .map((word) => ($(word).attr('data-headword') ?? getText($, word)).replace(/^‖\s*/, ''));
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
    if (parent === main.content) main.senses = [];
    parent.push(form);
    compound = { form, scope: { content: form.content, senses: [] }, parent, complete: false };
  }

  function process(
    node: AnyNode,
    inCompound: boolean,
    parent: LexicalBlock[] = main.content
  ): void {
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
      continuation = null;
      if (node.attribs['data-scope'] !== 'sense') main.senses = [];
      else while ((main.senses.at(-1)?.level ?? 0) > 1) main.senses.pop();
      const parent = contentTarget(main);
      for (const child of $(node).contents().toArray()) process(child, true, parent);
      return;
    }
    if (hasClass(node, 'col') || hasClass(node, 'mcol')) {
      addCompound(node, inCompound ? parent : (compound?.parent ?? main.content));
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
      if (
        node.attribs['data-scope'] !== 'sense' ||
        (!hasClass(node, 'note') && !hasClass(node, 'syn'))
      )
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
      const container =
        hasClass(node, 'def2') && $(node).prev().hasClass('specif') ? target() : scope.content;
      container.push({ kind: 'section', content });
      if (container === scope.content) scope.senses = [];
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
      if ($(node).children('.sd[data-role="definition"]').length > 0) {
        let fragment = '';
        for (const child of $(node).contents().toArray()) {
          if (
            isElement(child) &&
            hasClass(child, 'sd') &&
            child.attribs['data-role'] === 'definition'
          ) {
            addHtml('definition', fragment);
            fragment = '';
            process(child, inCompound, parent);
          } else fragment += getOuterHtml($, child);
        }
        addHtml('definition', fragment);
      } else addHtml('definition', inlineHtml($, node));
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
    if (hasClass(node, 'note') || hasClass(node, 'syn')) {
      if (node.attribs['data-scope'] === 'homograph') {
        compound = null;
        main.senses = [];
        continuation = null;
      } else if (node.attribs['data-scope'] === 'sense') {
        const scope = compound?.scope ?? main;
        while ((scope.senses.at(-1)?.level ?? 0) > 1) scope.senses.pop();
        continuation = null;
      }
    }
    if (hasClass(node, 'note')) {
      const owner = node.attribs['data-scope']?.match(/^sense:(\d+)$/)?.[1];
      const ownerSense = owner ? `${owner}.` : undefined;
      if (
        ownerSense &&
        main.content.some((block) => block.kind === 'sense' && block.number === ownerSense)
      ) {
        compound = null;
        main.senses = [];
        continuation = null;
        main.content.push({ kind: 'note', html: getHtml($, node), ownerSense });
      } else addHtml('note', getHtml($, node));
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
    } else if (inHeader && node.type === 'text' && /^\s*,\s*a\.\s*$/.test(node.data)) {
      header.push({ kind: 'text', text: ',' }, { kind: 'partOfSpeech', text: 'a.' });
    } else if (inHeader && node.type === 'text' && /^\s*\([?#]\)[,;]?\s*$/.test(node.data)) {
      const punctuation = node.data.replace(/\([?#]\)/, '').trim();
      if (punctuation) header.push({ kind: 'text', text: punctuation });
    } else if (
      inHeader &&
      node.type === 'text' &&
      /^\s*,?\s*(?:but\s+)?(?:(?:often|sometimes|usually)\s+)?used as\s*$/i.test(node.data) &&
      hasClass(nodes[index + 1] ?? node, 'xex') &&
      /^sing\.?$/.test(getText($, nodes[index + 1])) &&
      after?.type === 'text' &&
      /^\s*\.?\s*with\s*$/.test(after.data) &&
      hasClass(nodes[index + 3] ?? node, 'plu')
    ) {
      header.push({
        kind: 'inline',
        html: nodes
          .slice(index, index + 4)
          .map((part) => getOuterHtml($, part))
          .join(''),
      });
      skip = 3;
    } else if (
      inHeader &&
      node.type === 'text' &&
      /^\s*[,;]?\s*\(\d+\)\s*$/.test(node.data) &&
      next &&
      hasClass(next, 'pos')
    ) {
      header.push({ kind: 'text', text: node.data.trim() });
    } else if (
      inHeader &&
      (hasClass(node, 'mark') || hasClass(node, 'au')) &&
      hasClass(
        nodes
          .slice(index + 1)
          .find((later) => later.type !== 'text' || /[^\s,;]/.test(later.data)) ?? node,
        'pos'
      )
    ) {
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
        (header.at(-1)?.kind === 'partOfSpeech' || header.at(-1)?.kind === 'inline') &&
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

export function parseEntry(key: string, rawHtml: string, resolve?: EntryResolver): DictionaryEntry {
  const decodedKey = decodeEntryKey(key);
  const $ = loadPreprocessedDocument(rawHtml, resolve);
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
      !/^[\s,;]*(also|or)[\s,;]*$/i.test(node.data) &&
      !/^\s*,\s*a\.\s*$/.test(node.data)
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
  db.run(
    'CREATE TABLE quotations (author_slug TEXT NOT NULL, author TEXT NOT NULL, cited TEXT NOT NULL, key TEXT NOT NULL, html TEXT NOT NULL, citation TEXT)'
  );
  const references = createEntryReferences(sourceData, parseEntry);

  const insert = db.prepare(
    'INSERT INTO entries (key, normalized_key, slug, data) VALUES ($key, $normalizedKey, $slug, $data)'
  );
  const insertQuotation = db.prepare(
    'INSERT INTO quotations (author_slug, author, cited, key, html, citation) VALUES (?, ?, ?, ?, ?, ?)'
  );

  let parsedCount = 0;
  let errorCount = 0;

  const insertMany = db.transaction((entryKeys: ReadonlyArray<string>) => {
    for (let i = 0; i < entryKeys.length; i++) {
      const key = entryKeys[i];

      try {
        const rawHtml = sourceData.get(key);
        if (rawHtml === undefined) continue;

        const entry = parseEntry(key, rawHtml, references.resolve);
        insert.run({
          $key: entry.key,
          $normalizedKey: normalizeLookup(decodeEntryKey(entry.key)),
          $slug: entry.slug,
          $data: JSON.stringify(entry),
        });
        for (const { slug, name, cited, html, citation } of entryQuotations(entry)) {
          insertQuotation.run(slug, name, cited, entry.key, html, citation);
        }
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
    for (const [alias, key] of references.aliases) {
      insertAlias.run(alias, key);
    }
  })();
  db.run('CREATE INDEX idx_normalized_key ON entries(normalized_key)');
  db.run('CREATE INDEX idx_quotations_author ON quotations(author_slug)');
  db.run(`
    CREATE TABLE authors AS
    SELECT author_slug AS slug, MIN(author) AS name, COUNT(*) AS quotation_count
    FROM quotations GROUP BY author_slug
  `);
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
