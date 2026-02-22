import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getEntry } from '~/lib/db.server';
import { EntryView } from '~/components/entry';
import '~/styles/dictionary.css';

export async function loader({ params }: LoaderFunctionArgs) {
	const entry = getEntry(params.word ?? '');
	if (!entry) throw new Response('Not Found', { status: 404 });
	return json(entry);
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) return [{ title: 'Not Found' }];
	return [{ title: `${data.key} — Webster's 1913` }];
};

export default function EntryPage() {
	const entry = useLoaderData<typeof loader>();

	return (
		<div className="max-w-2xl mx-auto px-4 py-8">
			<nav className="mb-6">
				<Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
					&larr; Search
				</Link>
			</nav>
			<h1 className="text-4xl font-bold mb-6">{entry.key}</h1>
			<EntryView entry={entry} />
		</div>
	);
}
