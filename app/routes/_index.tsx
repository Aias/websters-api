import type { MetaFunction } from '@remix-run/node';
import { parseDictionary, type ParsedDictionary } from '~/lib/parse-dictionary';
import { useEffect, useState } from 'react';

export const meta: MetaFunction = () => {
	return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

const title = `Webster's 1913 API`;

export default function Index() {
	const [, setParsedData] = useState<ParsedDictionary | null>(null);

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
		<div className='flex h-screen items-center justify-center'>
			<h1 className='text-4xl font-bold'>{title}</h1>
		</div>
	);
}
