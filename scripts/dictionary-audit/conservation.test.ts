import { describe, expect, test } from 'bun:test';
import type { DictionaryEntry } from '../../app/lib/types';
import { parseEntry } from '../build-db';
import {
  compareEntry,
  compareLookup,
  ownershipSignature,
  projectEntry,
  snapshotEntry,
  snapshotLookup,
} from './conservation';

const heading = '<h2 class="hw">Example</h2>';

describe('conservation projection', () => {
  test('retains joins, punctuation, and combining marks', () => {
    const base = projectEntry(
      parseEntry('Example', `${heading}<div class="def">two words, ē.</div>`)
    );
    const joined = projectEntry(
      parseEntry('Example', `${heading}<div class="def">twowords, ē.</div>`)
    );
    const punctuation = projectEntry(
      parseEntry('Example', `${heading}<div class="def">two words; ē.</div>`)
    );
    const mark = projectEntry(
      parseEntry('Example', `${heading}<div class="def">two words, ĕ.</div>`)
    );
    expect(base.text).toContain('two words, ē.');
    expect(joined.text).not.toBe(base.text);
    expect(punctuation.text).not.toBe(base.text);
    expect(mark.text).not.toBe(base.text);
    expect(
      ownershipSignature(parseEntry('Example', `${heading}<div class="def">two words.</div>`))
    ).toEqual(
      ownershipSignature(parseEntry('Example', `${heading}<div class="def">two-words.</div>`))
    );
  });

  test('detects changed ownership with identical flat text', () => {
    const entry: DictionaryEntry = {
      key: 'Example',
      slug: 'example',
      homographs: [
        {
          headword: 'Example',
          alternateHeadwords: [],
          pronunciation: null,
          partOfSpeech: null,
          header: [{ kind: 'headword', text: 'Example' }],
          content: [{ kind: 'definition', html: 'same' }],
        },
      ],
    };
    const nested: DictionaryEntry = {
      ...entry,
      homographs: [
        {
          ...entry.homographs[0],
          content: [
            { kind: 'sense', number: '1', content: [{ kind: 'definition', html: 'same' }] },
          ],
        },
      ],
    };
    const whole = snapshotEntry(
      'Example',
      `${heading}<div class="def">same</div>`,
      () => undefined
    );
    const before = { ...whole, projection: projectEntry(entry) };
    const after = { ...whole, projection: projectEntry(nested) };
    expect(before.projection.text).toBe(after.projection.text);
    expect(compareEntry(before, after)).toEqual({
      key: 'Example',
      text: false,
      structure: true,
      normalization: false,
    });
  });

  test('keeps expected normalization visible as a candidate', () => {
    const snapshot = snapshotEntry(
      'Example',
      `${heading}<span class="pr">(?)</span>`,
      () => undefined
    );
    expect(snapshot.rawToPreprocess?.classification).toBe('placeholder');
    expect(snapshot.rawToPreprocess?.before).toContain('(?)');
    expect(snapshot.rawToPreprocess?.after).not.toContain('(?)');
  });
});

describe('lookup comparison', () => {
  test('reports an alias redirect and a new collision', () => {
    const before = snapshotLookup(
      new Map([
        ['A', '<h2 class="hw">Shared</h2>'],
        ['B', '<h2 class="hw">Other</h2>'],
      ])
    );
    const redirect = snapshotLookup(
      new Map([
        ['A', '<h2 class="hw">Other</h2>'],
        ['B', '<h2 class="hw">Shared</h2>'],
      ])
    );
    const collision = snapshotLookup(
      new Map([
        ['A', '<h2 class="hw">Shared</h2>'],
        ['B', '<h2 class="hw">Shared</h2>'],
      ])
    );
    expect(compareLookup(before, redirect).aliases).toContainEqual({
      name: 'shared',
      before: 'A',
      after: 'B',
    });
    expect(compareLookup(before, redirect).routes).toContainEqual({
      name: 'shared',
      before: 'A',
      after: 'B',
    });
    expect(compareLookup(before, collision).newAmbiguity).toContainEqual({
      name: 'shared',
      before: [],
      after: ['A', 'B'],
    });
  });
});
