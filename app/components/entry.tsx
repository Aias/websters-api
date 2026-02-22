import type {
	DictionaryEntry,
	Homograph,
	Sense,
	Etymology,
	Quotation,
	CompoundForm,
	InlineHTML,
} from '~/lib/types';

// ─── Inline HTML renderer ────────────────────────────────

function InlineHtml({ html, className }: { html: InlineHTML; className?: string }) {
	return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

// ─── Entry ───────────────────────────────────────────────

export function EntryView({ entry }: { entry: DictionaryEntry }) {
	return (
		<article>
			{entry.homographs.map((homograph, i) => (
				<HomographView key={i} homograph={homograph} />
			))}
		</article>
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
				<h2 className="text-2xl font-bold text-foreground inline">{headword}</h2>
				{pronunciation && (
					<span className="text-muted-foreground ml-2 text-lg">({pronunciation})</span>
				)}
				{partOfSpeech && (
					<span className="text-muted-foreground italic ml-2">{partOfSpeech}</span>
				)}
			</header>

			{verbMorphology && verbMorphology.length > 0 && (
				<p className="text-sm text-muted-foreground mb-2">
					[{verbMorphology.map((form, i) => (
						<span key={i}>
							{i > 0 && '; '}
							<span className="italic">{form.label}</span>{' '}
							<strong>{form.form}</strong>
							{form.pronunciation && ` (${form.pronunciation})`}
						</span>
					))}]
				</p>
			)}

			{etymology && <EtymologyView etymology={etymology} />}

			<ol className="space-y-3 mt-2">
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
				<div className="mt-3 text-sm text-muted-foreground border-l-2 border-border pl-3">
					<InlineHtml html={usage} />
				</div>
			)}

			{alternateSpellings && (
				<p className="mt-2 text-sm text-muted-foreground">
					Also: {alternateSpellings.join(', ')}
				</p>
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
		<p className="text-sm text-muted-foreground mb-2">
			<InlineHtml html={etymology.html} />
		</p>
	);
}

// ─── Sense ───────────────────────────────────────────────

function SenseView({ sense, showNumber }: { sense: Sense; showNumber: boolean }) {
	return (
		<li className="flex gap-2">
			{showNumber && sense.number && (
				<span className="font-bold text-muted-foreground shrink-0 w-6 text-right">
					{sense.number}
				</span>
			)}
			<div className="flex-1">
				{sense.field && (
					<span className="text-sm italic text-muted-foreground mr-1">{sense.field}</span>
				)}
				<span className="def">
					<InlineHtml html={sense.definition} />
				</span>
				{sense.mark && (
					<span className="text-sm italic text-muted-foreground ml-1">{sense.mark}</span>
				)}

				{sense.examples && (
					<span className="text-sm text-muted-foreground ml-1">
						<InlineHtml html={sense.examples} />
					</span>
				)}

				{sense.attributions.map((attr, i) => (
					<span key={i} className="text-sm text-muted-foreground ml-1">
						{attr}
					</span>
				))}

				{sense.quotations.map((q, i) => (
					<QuotationView key={i} quotation={q} />
				))}

				{sense.note && (
					<div className="text-sm text-muted-foreground mt-1">
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
		<blockquote className="mt-1 pl-4 border-l-2 border-border text-sm italic text-muted-foreground">
			<InlineHtml html={quotation.html} />
			{quotation.author && (
				<span className="block text-muted-foreground/60 not-italic mt-0.5">— {quotation.author}</span>
			)}
		</blockquote>
	);
}

// ─── Compound Form ───────────────────────────────────────

function CompoundFormView({ form }: { form: CompoundForm }) {
	return (
		<div className="mb-2">
			{form.headwords.map((hw, i) => (
				<strong key={i} className="mr-1">{hw}</strong>
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
			{form.mark && (
				<span className="text-sm italic text-muted-foreground ml-1">{form.mark}</span>
			)}
		</div>
	);
}
