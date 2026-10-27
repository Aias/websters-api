import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import { QuotationView } from '~/components/entry';
import { HoverLinks } from '~/components/hover-links';
import { Masonry } from '~/components/masonry';
import { getAuthor, getCitedForm, getQuotedWords } from '~/lib/db.server';

type AuthorPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const author = getAuthor(decodeURIComponent((await params).slug));
  return { title: author ? `${author.name} — Webster's 1913` : 'Not Found' };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const author = getAuthor(decodeURIComponent((await params).slug));

  if (!author) {
    notFound();
  }
  const cited = getCitedForm(author.slug);

  return (
    <div data-wide>
      <h1 className="mb-2 text-4xl font-bold">{author.name}</h1>
      <p className="mb-6 text-muted-foreground">
        {author.quotationCount.toLocaleString('en-US')}{' '}
        {author.quotationCount === 1 ? 'quotation' : 'quotations'}
        {cited !== author.name && cited !== `${author.name}.` && `, cited as ${cited}`}
      </p>
      <HoverLinks>
        <Masonry>
          {getQuotedWords(author.slug).map((word) => (
            <article key={word.key} className="rounded-lg border border-border p-4">
              <h2 className="text-xl font-bold">
                <Link href={`/entry/${word.slug}`} className="hover:underline">
                  {word.key}
                </Link>
              </h2>
              {word.quotations.map(({ owner, ...quotation }, i) => (
                <Fragment key={i}>
                  {owner && owner.id !== word.quotations[i - 1]?.owner?.id && (
                    <Link
                      href={`/entry/${word.slug}#${owner.id}`}
                      className="text-sm font-bold text-muted-foreground hover:underline"
                    >
                      {owner.label}
                    </Link>
                  )}
                  <QuotationView quotation={quotation} entryKey={word.key} linkAuthors={false} />
                </Fragment>
              ))}
            </article>
          ))}
        </Masonry>
      </HoverLinks>
    </div>
  );
}
