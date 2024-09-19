import * as cheerio from 'cheerio';
import dictionaryData from '../data/dict-sample.json' assert { type: 'json' };

// Define the type for the imported dictionary data
type DictionaryData = Record<string, string>;

// Assert the type of the imported data
const typedDictionaryData = dictionaryData as DictionaryData;

export async function parseDictionary() {
	const entries = Object.entries(typedDictionaryData).map(([key, value]) => {
		const contents = value;
		const $ = cheerio.load(contents, {}, false);

		const output = {
			entryName: key,
			contents,
			_: $
		};
		return output;
	});
	return entries;
}

// Define ParsedDictionary as the resolved type of parseDictionary
export type ParsedDictionary = Awaited<ReturnType<typeof parseDictionary>>;

export function splitContentsBySelector(contents: string, selector: string) {
	const $ = cheerio.load(contents, {}, false);
	const elements = $(selector);

	// If no elements match the selector, return the full content as a single element
	if (elements.length === 0) {
		return [$('*')];
	}

	const result = [];

	// Add content before the first selector, if it exists
	const firstElement = elements.first();
	const contentBeforeFirst = firstElement.prevAll().toArray().reverse();
	if (contentBeforeFirst.length > 0) {
		result.push($(contentBeforeFirst));
	}

	// Split content by selector
	elements.each((_, element) => {
		const $element = $(element);
		const chunk = $element.nextUntil(selector).addBack();
		result.push(chunk);
	});

	return result;
}
