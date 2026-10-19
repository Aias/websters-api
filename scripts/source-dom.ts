import type * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';

export function isElement(node: AnyNode): node is Element {
  return node.type === 'tag';
}

export function hasClass(node: AnyNode, cls: string): boolean {
  if (!isElement(node)) return false;
  const classes = node.attribs['class'];
  if (!classes) return false;
  if (classes === cls) return true;
  return ` ${classes} `.includes(` ${cls} `);
}

export function isTag(node: AnyNode, tag: string): boolean {
  return isElement(node) && node.tagName === tag;
}

export function isBr(node: AnyNode): boolean {
  return isTag(node, 'br');
}

export function getText($: cheerio.CheerioAPI, node: AnyNode): string {
  return $(node).text().trim();
}

export function getHtml($: cheerio.CheerioAPI, node: AnyNode): string {
  return $(node).html() ?? '';
}

export function getOuterHtml($: cheerio.CheerioAPI, node: AnyNode, contentsOnly = false): string {
  const $clone = $(node).clone();
  $clone.find('h2').each((_, child) => {
    child.tagName = 'strong';
  });
  return contentsOnly ? ($clone.html() ?? '') : $clone.toString();
}
