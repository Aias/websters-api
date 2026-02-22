import { Database } from 'bun:sqlite';
import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import { join } from 'node:path';

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

// ─── Helpers ─────────────────────────────────────────────

function isElement(node: AnyNode): node is Element {
	return node.type === 'tag';
}

function hasClass(node: AnyNode, cls: string): boolean {
	return isElement(node) && (node.attribs['class'] ?? '').split(/\s+/).includes(cls);
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

function normalizeKey(key: string): string {
	return key.toLowerCase().trim();
}

// ─── Preprocessing ───────────────────────────────────────

export function preprocess(html: string): string {
	// Remove d:priority attributes
	let result = html.replace(/\s*d:priority="[^"]*"/g, '');

	// Strip U+FFFD replacement characters (data lost during source extraction)
	result = result.replace(/\uFFFD/g, '').replace(/&#xFFFD;/g, '');

	const $ = cheerio.load(result, { xml: false }, false);

	// <b> → <strong>, <i> → <em>, <div> → <span>
	// Source HTML uses <div> for inline elements (.ets, .ex, .xex, .spn, etc.)
	// Converting to <span> makes them valid inside our <span> wrappers and
	// avoids hydration mismatches from browsers restructuring <div>-in-<span>
	$('b').each((_, el) => {
		(el as Element).tagName = 'strong';
	});
	$('i').each((_, el) => {
		(el as Element).tagName = 'em';
	});
	$('div').each((_, el) => {
		(el as Element).tagName = 'span';
	});

	// .er cross-references → <a> links
	$('.er').each((_, el) => {
		const text = $(el).text().trim();
		if (text) {
			(el as Element).tagName = 'a';
			(el as Element).attribs['href'] = `/entry/${encodeURIComponent(text)}`;
		}
	});

	return $.html();
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

function parseVerbMorphology(
	$: cheerio.CheerioAPI,
	node: Element,
): ReadonlyArray<ConjugationForm> {
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

function parseCompoundForm($: cheerio.CheerioAPI, node: Element): CompoundForm {
	const $cs = $(node);
	const headwords: string[] = [];
	const $col = $cs.find('.col');
	if ($col.length > 0) {
		headwords.push($col.text().trim());
	}

	let etymology: Etymology | null = null;
	const $ety = $cs.find('.ety');
	if ($ety.length > 0 && $ety[0]) {
		etymology = parseEtymology($, $ety[0]);
	}

	const $cd = $cs.find('.cd');
	const definition: InlineHTML | null = $cd.length > 0 ? ($cd.html()?.trim() ?? null) : null;

	const $mark = $cs.find('.mark');
	const mark = $mark.length > 0 ? $mark.text().trim() : null;

	return { headwords, etymology, definition, mark };
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
	const html = preprocess(rawHtml);
	const $ = cheerio.load(html, { xml: false }, false);
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
			if (cleaned.trim()) {
				currentNodes.push({ ...node, data: cleaned } as typeof node);
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
		const preContent = sections.shift()!;
		sections[0].nodes = [...preContent.nodes, ...sections[0].nodes];
	}

	const homographs: Homograph[] = sections.map((section) =>
		parseHomograph($, key, section.hwNode, section.isAlternate, section.nodes),
	);

	return { key, normalizedKey: normalizeKey(key), homographs };
}

function parseHomograph(
	$: cheerio.CheerioAPI,
	entryKey: string,
	hwNode: Element | null,
	isAlternate: boolean,
	nodes: AnyNode[],
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
			if (currentSense) senses.push(currentSense.build());
			currentSense = new SenseBuilder(getText($, el));
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
			compoundForms.push(parseCompoundForm($, el));
			continue;
		}

		// Alternate spellings
		if (hasClass(el, 'altsp')) {
			alternateSpellings = [];
			$(el)
				.find('.asp')
				.each((_, asp) => {
					const text = $(asp).text().trim();
					if (text) alternateSpellings!.push(text);
				});
			continue;
		}
	}

	if (currentSense) senses.push(currentSense.build());

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

function writeDatabase(entries: DictionaryEntry[]) {
	const { mkdirSync, existsSync, unlinkSync } = require('node:fs');
	const { dirname } = require('node:path');

	const dataDir = dirname(DB_FILE);
	if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
	if (existsSync(DB_FILE)) unlinkSync(DB_FILE);

	const db = new Database(DB_FILE);

	db.run(`
		CREATE TABLE entries (
			key TEXT PRIMARY KEY,
			normalized_key TEXT NOT NULL,
			data TEXT NOT NULL
		)
	`);
	db.run('CREATE INDEX idx_normalized_key ON entries(normalized_key)');

	const insert = db.prepare('INSERT INTO entries (key, normalized_key, data) VALUES ($key, $normalizedKey, $data)');

	const insertMany = db.transaction((entries: DictionaryEntry[]) => {
		for (const entry of entries) {
			insert.run({
				$key: entry.key,
				$normalizedKey: entry.normalizedKey,
				$data: JSON.stringify(entry),
			});
		}
	});

	insertMany(entries);
	db.close();
}

// ─── Main ────────────────────────────────────────────────

if (import.meta.main) {
	console.log('Reading source dictionary...');
	const raw = await Bun.file(SRC_FILE).text();
	const data: Record<string, string> = JSON.parse(raw);
	const keys = Object.keys(data);
	console.log(`Found ${keys.length} entries`);

	console.log('Parsing entries...');
	const entries: DictionaryEntry[] = [];
	let errors = 0;

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		try {
			entries.push(parseEntry(key, data[key]));
		} catch (err) {
			errors++;
			if (errors <= 10) console.error(`Error parsing "${key}":`, err);
		}

		if ((i + 1) % 10000 === 0) {
			console.log(`  ${i + 1}/${keys.length} parsed...`);
		}
	}

	console.log(`Parsed ${entries.length} entries (${errors} errors)`);
	console.log('Writing database...');
	writeDatabase(entries);
	console.log(`Database written to ${DB_FILE}`);
}
