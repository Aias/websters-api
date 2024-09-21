import type { MetaFunction } from '@remix-run/node';
import { parseDictionary, type ParsedDictionary } from '~/lib/parse-dictionary';
import { useEffect, useState } from 'react';
import '../styles/dictionary.css';

export const meta: MetaFunction = () => {
	return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

const title = `Webster's 1913 API`;

export default function Index() {
	const [parsedData, setParsedData] = useState<ParsedDictionary | null>(null);

	useEffect(() => {
		async function fetchData() {
			try {
				const data = await parseDictionary();
				setParsedData(data);
				console.log('Parsed dictionary data:', data);
			} catch (error) {
				console.error('Error parsing dictionary:', error);
			}
		}

		fetchData();
	}, []);

	return (
		<div className='flex flex-col h-screen p-4'>
			<h1 className='text-4xl font-bold'>{title}</h1>
			<ol>
				{parsedData?.map((entry) => {
					return (
						<li key={entry.entryName} className='pt-4'>
							<h2 className='text-2xl font-bold'>{entry.entryName}</h2>
							<ol>
								{entry.headwords.map((hw, i) => {
									return (
										<li key={i} className='pt-2 pl-4'>
											<h3 className='text-xl'>
												{hw.name}
												{hw.pronunciation ? (
													<em className='text-base'> ({hw.pronunciation})</em>
												) : (
													''
												)}
												{hw.partOfSpeech ? (
													<span className='text-base'>, {hw.partOfSpeech}</span>
												) : (
													''
												)}
											</h3>
											<ol className='text-sm'>
												{hw.defs.map((def, i) => {
													return (
														<li className='pt-2' key={i}>
															<p>{def.definition}</p>
															{def.quotes.map((quote, qIdx) => (
																<blockquote
																	key={qIdx}
																	className='mt-2 pl-4 border-l-4 border-gray-300'
																>
																	<p className='italic'>
																		<span
																			dangerouslySetInnerHTML={{
																				__html: `"${quote.text?.trim()}"`
																			}}
																		/>
																		{quote.author && (
																			<span className='block text-sm mt-1'>
																				— {quote.author}
																			</span>
																		)}
																	</p>
																</blockquote>
															))}
														</li>
													);
												})}
											</ol>
										</li>
									);
								})}
							</ol>
						</li>
					);
				})}
			</ol>
		</div>
	);
}
