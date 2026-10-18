import { Fragment } from 'react';
import type { DictionaryEntry, HeaderPart, InlineHTML, LexicalBlock, Sense } from '~/lib/types';
import { HoverLinks } from './hover-links';

function InlineHtml({ html, className = '' }: { html: InlineHTML; className?: string }) {
  return (
    <span
      className={`${className} [&_.adjf]:font-bold [&_.col]:font-bold [&_.conjf]:font-bold [&_.plw]:font-bold [&_.pos]:italic [&_.wf]:font-bold`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function HeaderView({ parts }: { parts: ReadonlyArray<HeaderPart> }) {
  return (
    <header className="mb-2">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          {part.kind === 'forms' ? (
            <div className="mb-2 text-sm text-muted-foreground">
              <InlineHtml html={part.html} />
            </div>
          ) : part.kind === 'inline' ? (
            <InlineHtml html={part.html} />
          ) : part.kind === 'headword' ? (
            <h2 className="inline text-2xl font-bold text-foreground">{part.text}</h2>
          ) : part.kind === 'pronunciation' ? (
            <span className="text-lg text-muted-foreground">{part.text}</span>
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

function ContentView({ content }: { content: ReadonlyArray<LexicalBlock> }) {
  const groups: ContentGroup[] = [];
  for (const block of content) {
    const previous = groups[groups.length - 1];
    if (block.kind === 'sense') {
      if (previous?.kind === 'senses') previous.senses.push(block);
      else groups.push({ kind: 'senses', senses: [block] });
    } else {
      groups.push({ kind: 'block', block });
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
      <BlockView key={i} block={group.block} />
    )
  );
}

function BlockView({ block }: { block: Exclude<LexicalBlock, Sense> }) {
  switch (block.kind) {
    case 'compound':
      return (
        <div className="mt-4 mb-2">
          <strong>
            <InlineHtml html={block.headwordHtml} />
          </strong>{' '}
          <ContentView content={block.content} />
        </div>
      );
    case 'section':
      return (
        <section className="mt-3">
          <ContentView content={block.content} />
        </section>
      );
    case 'quotation':
      return (
        <blockquote className="relative mt-3 pl-3.5 text-sm text-muted-foreground italic">
          <span
            className="pointer-events-none absolute inset-y-0.25 inset-s-0 w-[3px] rounded bg-border content-['']"
            aria-hidden="true"
          />
          <InlineHtml html={block.html} />
          {block.authors.map((author, i) => (
            <span key={i} className="mt-1 block text-muted-foreground/60 not-italic">
              — {author}
            </span>
          ))}
        </blockquote>
      );
    case 'etymology':
    case 'forms':
      return (
        <div className="mb-2 text-sm text-muted-foreground">
          <InlineHtml html={block.html} />
        </div>
      );
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
      return <InlineHtml html={block.html} className="mr-1 text-sm text-muted-foreground italic" />;
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
