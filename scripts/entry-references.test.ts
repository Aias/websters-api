import { describe, expect, test } from 'bun:test';
import { parseEntry, preprocess } from './build-db';
import { createEntryReferences, decodeEntryKey, entryReferenceSlug } from './entry-references';

const source = new Map([
  ['Reave', '<h2 class="hw">Reave</h2>'],
  ['Bigamy', '<h2 class="hw">Bigamy</h2>'],
  ['Do.', '<h2 class="hw">Do.</h2>'],
  ['Do', '<h2 class="hw">Do</h2>'],
  ['Mister', '<h2 class="hw">Mister</h2><div class="asp">Messrs.</div>'],
  [
    'One',
    '<h2 class="hw">One</h2><div class="asp">Shared</div><div class="asp">Clear</div><div class="asp">Dot.</div><div class="asp">A-B</div><div class="asp">AB</div>',
  ],
  ['Two', '<h2 class="hw">Two</h2><div class="asp">Shared</div>'],
  ['Do&#x74;.', '<h2 class="hw">Dot.</h2>'],
  ['Cafe&#769;', '<h2 class="hw">Café</h2>'],
  ['A?B', '<h2 class="hw">A?B</h2>'],
  ['Diaeresis', '<h2 class="hw">Diaeresis</h2><div class="asp">Face</div>'],
]);
const references = createEntryReferences(source);

describe('reference href punctuation', () => {
  test('changes only the href and keeps visible terminal punctuation', () => {
    expect(preprocess('<div class="er">Reave.</div>', references.resolve)).toBe(
      '<a class="er" href="/entry/reave">Reave.</a>'
    );
    expect(entryReferenceSlug('Bigamy. ', references.resolve)).toBe('bigamy');
    expect(
      JSON.stringify(
        parseEntry(
          'Example',
          '<h2 class="hw">Example</h2><div class="def">See <div class="er">Reave.</div></div>',
          references.resolve
        )
      )
    ).toContain('href=\\"/entry/reave\\">Reave.');
  });
  test('preserves genuine dotted canonical names and aliases', () => {
    expect(entryReferenceSlug('Do.', references.resolve)).toBe('do.');
    expect(entryReferenceSlug('Messrs.', references.resolve)).toBe('messrs.');
    expect(references.resolve('dot.')).toBe('Dot.');
  });
  test('respects ambiguity and preserves unresolved references', () => {
    expect(entryReferenceSlug('Shared.', references.resolve)).toBe('shared.');
    expect(entryReferenceSlug('Absent.', references.resolve)).toBe('absent.');
    expect(entryReferenceSlug('Clear.', references.resolve)).toBe('clear');
  });
  test('retains source sense handling and does not rewrite undotted links', () => {
    expect(entryReferenceSlug('Reave, 2.', references.resolve)).toBe('reave');
    expect(entryReferenceSlug('Reave{2}', references.resolve)).toBe('reave');
    expect(entryReferenceSlug('Reave', references.resolve)).toBe('reave');
    expect(entryReferenceSlug('Reave.')).toBe('reave.');
  });
  test('uses decoded NFC keys and runtime canonical slug precedence', () => {
    expect(decodeEntryKey('Cafe&#769;')).toBe('Café');
    expect(references.resolve('café')).toBe('Café');
    expect(entryReferenceSlug('Café.', references.resolve)).toBe('café');
    expect(references.aliases.get('ab')).toBe('One');
    expect(references.resolve('ab')).toBe('A?B');
  });
  test('matches runtime diaeresis fallback even when that exact alias is absent', () => {
    expect(references.aliases.has('fäce'.normalize('NFC'))).toBe(false);
    expect(references.resolve('fäce'.normalize('NFC'))).toBe('Diaeresis');
    expect(entryReferenceSlug('Fäce.', references.resolve)).toBe('fäce');
  });
});
