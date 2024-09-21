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
		const $hwSelection = $('.hw');
		let $headwords = [];
		if ($hwSelection.length === 0) {
			const $allContents = $('*');
			$headwords = [$allContents];
		} else {
			const $firstHw = $('.hw').first();
			const $beforeFirstHw = $firstHw.prevAll();
			if ($beforeFirstHw.length > 0) {
				const $prevContents = $beforeFirstHw.last().nextUntil('.hw').addBack();
				$headwords.push($prevContents);
			}
			$headwords = [
				...$headwords,
				...$hwSelection.map((_, hw) => {
					const $hwContents = $(hw).nextUntil('.hw').addBack();
					return $hwContents;
				})
			];
		}

		const extractedHeadwords = $headwords.map(($hw) => {
			const name = $hw.filter('.hw').text().trim() || key;
			const pronunciation = $hw.filter('.pr').first().text().trim().replace('(', '').replace(')', '');
			const partOfSpeech = $hw.filter('.pos').first().text().trim();
			const defs = $hw
				.filter('.def')
				.toArray()
				.map((def) => {
					const $def = $(def);
					const $defContents = $def.nextUntil('.def').addBack();
					const quotes = $defContents
						.filter('.q')
						.map((_, q) => ({
							text: $(q).clone().find('.qau').remove().end().html(), // Remove .qau from text
							author: $(q).find('.qau').text().trim() // Extract author from .qau
						}))
						.get();
					return {
						definition: $def.contents().text().trim(),
						contents: $defContents.toString(),
						quotes // Updated quotes property
					};
				});
			return {
				name,
				pronunciation,
				partOfSpeech,
				defs,
				contents: $hw.toString()
			};
		});

		const output = {
			entryName: key,
			contents,
			headwords: extractedHeadwords
			// _: $('.hw')
		};
		return output;
	});
	return entries;
}

// Define ParsedDictionary as the resolved type of parseDictionary
export type ParsedDictionary = Awaited<ReturnType<typeof parseDictionary>>;
