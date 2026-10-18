import Link from 'next/link';
import { Fragment } from 'react';
import { quotationAuthor } from '~/lib/quotation-authors';
import type {
  DictionaryEntry,
  HeaderPart,
  InlineHTML,
  LexicalBlock,
  Quotation,
  Sense,
} from '~/lib/types';
import { HoverLinks } from './hover-links';

function InlineHtml({ html, className = '' }: { html: InlineHTML; className?: string }) {
  const Tag = /<(?:table|pre|div|blockquote)\b/.test(html) ? 'div' : 'span';
  return (
    <Tag className={`${className} overflow-x-auto`} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function HeaderView({ parts }: { parts: ReadonlyArray<HeaderPart> }) {
  return (
    <header className="mb-2">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && !/^[,.;:!?)]/.test('text' in part ? part.text : part.html) && ' '}
          {part.kind === 'forms' ? (
            <div className="mb-2 text-sm text-muted-foreground">
              <InlineHtml html={part.html} />
            </div>
          ) : part.kind === 'inline' ? (
            <InlineHtml html={part.html} />
          ) : part.kind === 'headword' ? (
            <h2 className="inline text-2xl font-bold text-foreground">{part.text}</h2>
          ) : part.kind === 'pronunciation' ? (
            <InlineHtml html={part.html} className="text-lg text-muted-foreground" />
          ) : part.kind === 'partOfSpeech' ? (
            <span className="text-muted-foreground italic">{part.text}</span>
          ) : (
            <span className="text-muted-foreground">{part.text}</span>
          )}
        </Fragment>
      ))}
    </header>
  );
}

type ContentGroup =
  | { kind: 'senses'; senses: Sense[] }
  | { kind: 'block'; block: Exclude<LexicalBlock, Sense> };

function needsLeadingSpace(block: LexicalBlock | undefined): boolean {
  return Boolean(block && (!('html' in block) || !/^[\s,.;:!?)]/.test(block.html)));
}

function ContentView({
  content,
  inline = false,
}: {
  content: ReadonlyArray<LexicalBlock>;
  inline?: boolean;
}) {
  const groups: ContentGroup[] = [];
  for (const [index, block] of content.entries()) {
    const previous = groups[groups.length - 1];
    if (block.kind === 'sense') {
      if (previous?.kind === 'senses') previous.senses.push(block);
      else groups.push({ kind: 'senses', senses: [block] });
    } else {
      groups.push({ kind: 'block', block });
      if (block.kind === 'label' && needsLeadingSpace(content[index + 1])) {
        groups.push({ kind: 'block', block: { kind: 'text', html: ' ' } });
      }
    }
  }
  return groups.map((group, i) =>
    group.kind === 'senses' ? (
      <ol key={i} className="mt-2 space-y-4">
        {group.senses.map((sense, j) => (
          <li key={j} className="flex gap-2">
            <span className="shrink-0 text-right font-bold text-muted-foreground tabular-nums">
              {sense.number}
            </span>
            <div className="min-w-0 flex-1">
              <ContentView content={sense.content} />
            </div>
          </li>
        ))}
      </ol>
    ) : (
      <BlockView key={i} block={group.block} inline={inline} />
    )
  );
}

export function QuotationView({
  quotation,
  linkAuthors = true,
}: {
  quotation: Quotation;
  linkAuthors?: boolean;
}) {
  return (
    <blockquote className="q">
      <InlineHtml html={quotation.html} />
      {quotation.authors.map((author, i) => {
        const { slug } = quotationAuthor(author);
        return (
          <span key={i} className="quotation-author">
            —{' '}
            {linkAuthors && slug ? (
              <Link href={`/authors/${slug}`} className="hover:underline">
                {author}
              </Link>
            ) : (
              author
            )}
          </span>
        );
      })}
    </blockquote>
  );
}

function BlockView({ block, inline }: { block: Exclude<LexicalBlock, Sense>; inline: boolean }) {
  switch (block.kind) {
    case 'compound': {
      const first = block.content[0];
      return (
        <div className="mt-4 mb-2">
          <strong>
            <InlineHtml html={block.headwordHtml} />
          </strong>
          {needsLeadingSpace(first) ? ' ' : null}
          <ContentView content={block.content} inline />
        </div>
      );
    }
    case 'section':
      return (
        <section className="mt-3">
          <ContentView content={block.content} />
        </section>
      );
    case 'quotation':
      return <QuotationView quotation={block} />;
    case 'etymology':
    case 'forms': {
      const Tag = inline && block.kind === 'etymology' ? 'span' : 'div';
      return (
        <Tag className="mb-2 text-sm text-muted-foreground">
          <InlineHtml html={block.html} />
        </Tag>
      );
    }
    case 'note':
      return (
        <div className="mt-1 text-sm text-muted-foreground">
          <InlineHtml html={block.html} />
        </div>
      );
    case 'synonyms':
      return (
        <div className="mt-3 text-sm">
          <InlineHtml html={block.html} />
        </div>
      );
    case 'usage':
      return (
        <div className="mt-3 border-l-2 border-border pl-3 text-sm text-muted-foreground">
          <InlineHtml html={block.html} />
        </div>
      );
    case 'label':
      return <InlineHtml html={block.html} className="text-sm text-muted-foreground italic" />;
    case 'definition':
    case 'text':
      return <InlineHtml html={block.html} />;
  }
}

export function EntryView({ entry }: { entry: DictionaryEntry }) {
  return (
    <HoverLinks>
      <article>
        {entry.homographs.map((homograph, i) => (
          <section key={i} className="mb-8">
            <HeaderView parts={homograph.header} />
            <ContentView content={homograph.content} />
          </section>
        ))}
      </article>
    </HoverLinks>
  );
}
