import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { searchEntries, getRandomEntry } from '~/lib/db.server';
import { EntryView } from '~/components/entry';
import '~/styles/dictionary.css';

export const meta: MetaFunction = () => {
	return [
		{ title: "Webster's 1913 Unabridged Dictionary" },
		{ name: 'description', content: "Webster's Unabridged Dictionary, 1913 edition" },
	];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const q = url.searchParams.get('q')?.trim() ?? '';

	if (!q) {
		const random = getRandomEntry();
		return json({ q: '', results: [] as Array<{ key: string }>, featured: random });
	}

	const results = searchEntries(q, 50);
	return json({ q, results, featured: null });
}

export default function Index() {
	const { q, results, featured } = useLoaderData<typeof loader>();

	return (
		<div className="max-w-2xl mx-auto px-4 py-8">
			<h1 className="text-4xl font-bold mb-6">Webster&rsquo;s 1913</h1>

			<Form method="get" className="mb-8">
				<input
					type="search"
					name="q"
					defaultValue={q}
					placeholder="Look up a word..."
					className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-ring"
					autoFocus
				/>
			</Form>

			{q && results.length > 0 && (
				<ul className="space-y-1">
					{results.map((r) => (
						<li key={r.key}>
							<Link
								to={`/entry/${encodeURIComponent(r.key)}`}
								className="text-foreground/80 hover:text-foreground hover:underline"
							>
								{r.key}
							</Link>
						</li>
					))}
				</ul>
			)}

			{q && results.length === 0 && (
				<p className="text-muted-foreground">No entries found for &ldquo;{q}&rdquo;</p>
			)}

			{!q && featured && (
				<div>
					<p className="text-sm text-muted-foreground mb-4">Random entry:</p>
					<h2 className="text-2xl font-bold mb-4">
						<Link to={`/entry/${encodeURIComponent(featured.key)}`} className="hover:underline">
							{featured.key}
						</Link>
					</h2>
					<EntryView entry={featured} />
				</div>
			)}
		</div>
	);
}
