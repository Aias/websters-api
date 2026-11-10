import { expect, test } from 'bun:test';
import { changeBetween, decodeFragment, encodeEdit, passageAround, tagsOf } from './review-text';

test('decodes entities and keeps tags', () => {
  expect(decodeFragment('<div class="ets">spe&#x304;dig</div> &#x2014; a')).toBe(
    '<div class="ets">spēdig</div> — a'
  );
});

test('an unedited fragment encodes back to itself', () => {
  const base = 'Cac&#x153;cia rosaceana &amp; kin';
  expect(encodeEdit(base, decodeFragment(base))).toBe(base);
});

test('an edit keeps the encoding around it and encodes what was typed', () => {
  const base = '<div class="ets">sno&#x308;g </div>neat, Sw. snugg';
  expect(encodeEdit(base, '<div class="ets">snög </div>neat, Sw. snygg')).toBe(
    '<div class="ets">sno&#x308;g </div>neat, Sw. snygg'
  );
  expect(encodeEdit('Cacaecia', 'Cacœcia')).toBe('Cac&#x153;cia');
});

test('tags are compared as a sequence', () => {
  expect(tagsOf('<b>a</b> c')).toBe('<b></b>');
});

test('a change is the differing middle of the visible text', () => {
  expect(changeBetween('never <i>became</i> detached', 'never <i>become</i> detached')).toEqual({
    prefix: 'never bec',
    removed: 'a',
    added: 'o',
    suffix: 'me detached',
  });
});

test('a passage is the visible text on either side of a fragment', () => {
  const html =
    '<div class="cd">made of olive oil and soda; &#x2014; called also <div class="altname">Venetian soap</div>. </div>&#x2014; <div class="col"><b>Hard soap</b></div>';
  expect(passageAround(html, '<div class="altname">Venetian soap</div>')).toEqual({
    before: 'made of olive oil and soda; — called also ',
    after: '. — Hard soap',
  });
  expect(passageAround(html, 'Castile')).toEqual({ before: '', after: '' });
});
