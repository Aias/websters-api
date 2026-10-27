import { describe, expect, test } from 'bun:test';
import { rankHeadwords } from './lookup.ts';

describe('rankHeadwords', () => {
  test('ranks completions ahead of corrections, nearest first', () => {
    expect(rankHeadwords('rec', ['wreck', 'rack', 'recall', 'reck'], 10)).toEqual([
      'reck',
      'recall',
      'rack',
      'wreck',
    ]);
  });

  test('corrects transposed, substituted, missing, and extra letters', () => {
    const headwords = ['accommodate', 'pronunciation', 'receive', 'rhythm', 'separate'];
    expect(rankHeadwords('recieve', headwords, 1)).toEqual(['receive']);
    expect(rankHeadwords('seperate', headwords, 1)).toEqual(['separate']);
    expect(rankHeadwords('accomodate', headwords, 1)).toEqual(['accommodate']);
    expect(rankHeadwords('pronounciation', headwords, 1)).toEqual(['pronunciation']);
    expect(rankHeadwords('rythm', headwords, 1)).toEqual(['rhythm']);
  });

  test('allows no edits below three letters, one through five, and two beyond', () => {
    expect(rankHeadwords('ox', ['ax', 'ox', 'oxen'], 10)).toEqual(['ox', 'oxen']);
    expect(rankHeadwords('oxen', ['ox', 'omen', 'open', 'oxen'], 10)).toEqual([
      'oxen',
      'omen',
      'open',
    ]);
    expect(rankHeadwords('definately', ['definitely', 'delicately', 'definitive'], 10)).toEqual([
      'definitely',
      'delicately',
    ]);
  });
});
