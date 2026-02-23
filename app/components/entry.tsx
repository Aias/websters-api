import type {
  DictionaryEntry,
  Homograph,
  Sense,
  Etymology,
  Quotation,
  CompoundForm,
  InlineHTML,
} from '~/lib/types';
import { HoverLinks } from './hover-links';

// ─── Inline HTML renderer ────────────────────────────────

function InlineHtml({ html, className }: { html: InlineHTML; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

// ─── Entry ───────────────────────────────────────────────

export function EntryView({ entry }: { entry: DictionaryEntry }) {
  return (
    <HoverLinks>
      <article>
        {entry.homographs.map((homograph, i) => (
          <HomographView key={i} homograph={homograph} />
        ))}
      </article>
    </HoverLinks>
  );
}

// ─── Homograph ───────────────────────────────────────────

function HomographView({ homograph }: { homograph: Homograph }) {
  const {
    headword,
    pronunciation,
    partOfSpeech,
    verbMorphology,
    etymology,
    senses,
    synonyms,
    usage,
    compoundForms,
    alternateSpellings,
    note,
  } = homograph;

  return (
    <section className="mb-8">
      <header className="mb-2">
        <h2 className="inline text-2xl font-bold text-foreground">{headword}</h2>
        {pronunciation && (
          <span className="ml-2 text-lg text-muted-foreground">({pronunciation})</span>
        )}
        {partOfSpeech && <span className="ml-2 text-muted-foreground italic">{partOfSpeech}</span>}
      </header>

      {verbMorphology && verbMorphology.length > 0 && (
        <p className="mb-2 text-sm text-muted-foreground">
          [
          {verbMorphology.map((form, i) => (
            <span key={i}>
              {i > 0 && '; '}
              <span className="italic">{form.label}</span> <strong>{form.form}</strong>
              {form.pronunciation && ` (${form.pronunciation})`}
            </span>
          ))}
          ]
        </p>
      )}

      {etymology && <EtymologyView etymology={etymology} />}

      <ol className="mt-2 space-y-3">
        {senses.map((sense, i) => (
          <SenseView key={i} sense={sense} showNumber={senses.length > 1} />
        ))}
      </ol>

      {compoundForms.length > 0 && (
        <div className="mt-4 border-l-2 border-border pl-4">
          {compoundForms.map((cf, i) => (
            <CompoundFormView key={i} form={cf} />
          ))}
        </div>
      )}

      {synonyms && (
        <div className="mt-3 text-sm">
          <InlineHtml html={synonyms} />
        </div>
      )}

      {usage && (
        <div className="mt-3 border-l-2 border-border pl-3 text-sm text-muted-foreground">
          <InlineHtml html={usage} />
        </div>
      )}

      {alternateSpellings && (
        <p className="mt-2 text-sm text-muted-foreground">Also: {alternateSpellings.join(', ')}</p>
      )}

      {note && (
        <div className="mt-2 text-sm text-muted-foreground">
          <InlineHtml html={note} />
        </div>
      )}
    </section>
  );
}

// ─── Etymology ───────────────────────────────────────────

function EtymologyView({ etymology }: { etymology: Etymology }) {
  return (
    <p className="mb-2 text-sm text-muted-foreground">
      <InlineHtml html={etymology.html} />
    </p>
  );
}

// ─── Sense ───────────────────────────────────────────────

function SenseView({ sense, showNumber }: { sense: Sense; showNumber: boolean }) {
  return (
    <li className="flex gap-2">
      {showNumber && sense.number && (
        <span className="w-6 shrink-0 text-right font-bold text-muted-foreground">
          {sense.number}
        </span>
      )}
      <div className="flex-1">
        {sense.field && (
          <span className="mr-1 text-sm text-muted-foreground italic">{sense.field}</span>
        )}
        <span className="def">
          <InlineHtml html={sense.definition} />
        </span>
        {sense.mark && (
          <span className="ml-1 text-sm text-muted-foreground italic">{sense.mark}</span>
        )}

        {sense.examples && (
          <span className="ml-1 text-sm text-muted-foreground">
            <InlineHtml html={sense.examples} />
          </span>
        )}

        {sense.attributions.map((attr, i) => (
          <span key={i} className="ml-1 text-sm text-muted-foreground">
            {attr}
          </span>
        ))}

        {sense.quotations.map((q, i) => (
          <QuotationView key={i} quotation={q} />
        ))}

        {sense.note && (
          <div className="mt-1 text-sm text-muted-foreground">
            <InlineHtml html={sense.note} />
          </div>
        )}
      </div>
    </li>
  );
}

// ─── Quotation ───────────────────────────────────────────

function QuotationView({ quotation }: { quotation: Quotation }) {
  return (
    <blockquote className="mt-1 border-l-2 border-border pl-4 text-sm text-muted-foreground italic">
      <InlineHtml html={quotation.html} />
      {quotation.author && (
        <span className="mt-0.5 block text-muted-foreground/60 not-italic">
          — {quotation.author}
        </span>
      )}
    </blockquote>
  );
}

// ─── Compound Form ───────────────────────────────────────

function CompoundFormView({ form }: { form: CompoundForm }) {
  return (
    <div className="mb-2">
      {form.headwords.map((hw, i) => (
        <strong key={i} className="mr-1">
          {hw}
        </strong>
      ))}
      {form.etymology && (
        <span className="text-sm text-muted-foreground">
          <InlineHtml html={form.etymology.html} />
        </span>
      )}
      {form.definition && (
        <span className="ml-1">
          <InlineHtml html={form.definition} />
        </span>
      )}
      {form.mark && <span className="ml-1 text-sm text-muted-foreground italic">{form.mark}</span>}
    </div>
  );
}
