import * as cheerio from 'cheerio';
import { entryReferenceSlug, type EntryResolver } from './entry-references';
import { getText, hasClass, isElement } from './source-dom';
import { normalizeSourceTypography } from './source-typography';

export function loadPreprocessedDocument(
  html: string,
  resolve?: EntryResolver
): cheerio.CheerioAPI {
  const $ = cheerio.load(
    html,
    { xml: { xmlMode: false, recognizeSelfClosing: true, encodeEntities: 'utf8' } },
    false
  );

  // Drop executable containers from trusted source before extracting any HTML fragments.
  $('script,style,iframe,object,embed,template').remove();
  $('.ver').remove();

  $('*').each((_, el) => {
    if (!isElement(el)) return;

    if (el.tagName === 'b') {
      el.tagName = 'strong';
    } else if (el.tagName === 'i') {
      el.tagName = 'em';
    } else if (el.tagName === 'div') {
      el.tagName = hasClass(el, 'q') ? 'blockquote' : 'span';
    }

    if (hasClass(el, 'er')) {
      if (
        $(el).closest('.ety').length &&
        /^\p{Script=Greek}[\p{Script=Greek}\p{M}]*$/u.test(getText($, el))
      ) {
        $(el).removeClass('er').addClass('grk');
      } else {
        const slug = entryReferenceSlug($(el).text(), resolve);
        if (slug) {
          el.tagName = 'a';
          el.attribs['href'] = `/entry/${slug}`;
        }
      }
    }

    for (const [attributeName, attributeValue] of Object.entries(el.attribs)) {
      const normalizedName = attributeName.toLowerCase();

      if (normalizedName === 'class') continue;
      if (normalizedName === 'data-headword' && hasClass(el, 'col')) continue;
      if (normalizedName === 'data-role' && attributeValue === 'definition' && hasClass(el, 'sd'))
        continue;
      if (
        el.tagName === 'img' &&
        (normalizedName === 'alt' ||
          (normalizedName === 'src' && /^\/illustrations\/[a-z0-9-]+\.png$/.test(attributeValue)) ||
          (['width', 'height'].includes(normalizedName) && /^[1-9]\d*$/.test(attributeValue)))
      )
        continue;
      if (
        normalizedName === 'data-scope' &&
        (attributeValue === 'homograph' || attributeValue === 'sense') &&
        (hasClass(el, 'syn') ||
          hasClass(el, 'note') ||
          (hasClass(el, 'cs') && attributeValue === 'sense'))
      )
        continue;
      if (
        normalizedName === 'data-scope' &&
        hasClass(el, 'note') &&
        /^sense:\d+$/.test(attributeValue)
      )
        continue;
      if (
        normalizedName === 'colspan' &&
        /^(?:[1-9]\d*)$/.test(attributeValue) &&
        (hasClass(el, 'td') || hasClass(el, 'th') || el.tagName === 'td' || el.tagName === 'th')
      )
        continue;
      if (normalizedName === 'href' && typeof attributeValue === 'string') {
        if (attributeValue.startsWith('/entry/')) continue;
      }
      delete el.attribs[attributeName];
    }
  });

  $('.pr').each((_, node) => {
    const placeholder =
      /^\(\s*[#?�](?:\s*or\s*[#?�])*\s*(?:[;,]\s*(\d+(?:\s*,\s*\d+)*)\s*)?\)$/.exec(
        getText($, node)
      );
    if (placeholder?.[1]) $(node).text(`(${placeholder[1]})`);
    else if (placeholder) $(node).remove();
  });
  $('.vmorph .conjf').each((_, node) => {
    const next = node.nextSibling;
    if (next?.type === 'text')
      next.data = next.data.replace(/^(\s*)\([#?�]\)(?=\s|[,;.\]]|$)/, '$1');
  });
  $('h2.hw, .col').each((_, node) => {
    const previous = node.previousSibling;
    if (previous?.type === 'text' && /‖\s*$/.test(previous.data)) {
      previous.data = previous.data.replace(/‖\s*$/, '');
      $(node).prepend('‖');
    }
  });

  normalizeSourceTypography($);

  // Normalize whitespace: move leading/trailing spaces outside inline elements
  // so CSS decorations (underlines, etc.) don't extend over whitespace.
  // Merge into adjacent text nodes rather than creating whitespace-only nodes
  // (which get filtered by parsers that skip empty text).
  // Process in reverse document order so nested elements propagate outward.
  const inlineElements = $('em, span, strong, a').toArray().reverse();
  for (const el of inlineElements) {
    const { children } = el;
    if (children.length === 0) continue;

    const last = children[children.length - 1];
    if (last.type === 'text') {
      const trailing = last.data.match(/(\s+)$/);
      if (trailing) {
        last.data = last.data.slice(0, -trailing[1].length);
        const next = el.nextSibling;
        if (next?.type === 'text') {
          next.data = trailing[1] + next.data;
        } else {
          $(el).after(trailing[1]);
        }
      }
    }

    const first = children[0];
    if (first.type === 'text') {
      const leading = first.data.match(/^(\s+)/);
      if (leading) {
        first.data = first.data.slice(leading[1].length);
        const prev = el.previousSibling;
        if (prev?.type === 'text') {
          prev.data += leading[1];
        } else {
          $(el).before(leading[1]);
        }
      }
    }
  }

  $.root()
    .find('*')
    .addBack()
    .contents()
    .each((_, node) => {
      if (node.type === 'text' && $(node).parents('pre,table').length === 0) {
        const previous = node.prev;
        if (previous && isElement(previous) && /\p{L}$/u.test($(previous).text()))
          node.data = node.data.replace(/^\{\d+\}/, '');
        node.data = node.data
          .replace(/(?<=\p{L})\{\d+\}/gu, '')
          .replace(/(?<!\.)[ \t]+([,;:!?)]|\.(?![\s.]*\.|\d))/g, '$1');
      }
    });

  return $;
}
