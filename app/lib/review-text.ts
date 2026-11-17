const ENTITY = /&(?:#x([0-9a-fA-F]+)|#(\d+)|(amp|lt|gt|quot|apos|nbsp));/y;
const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

type Unit = { raw: string; text: string };

function units(fragment: string): Unit[] {
  const out: Unit[] = [];
  let index = 0;
  while (index < fragment.length) {
    ENTITY.lastIndex = index;
    const match = ENTITY.exec(fragment);
    if (match) {
      const [raw, hex, decimal, name] = match;
      const text = hex
        ? String.fromCodePoint(parseInt(hex, 16))
        : decimal
          ? String.fromCodePoint(Number(decimal))
          : (NAMED[name ?? ''] ?? raw);
      out.push({ raw, text });
      index += raw.length;
    } else {
      const character = String.fromCodePoint(fragment.codePointAt(index) ?? 0);
      out.push({ raw: character, text: character });
      index += character.length;
    }
  }
  return out;
}

export function decodeFragment(fragment: string): string {
  return units(fragment)
    .map((unit) => unit.text)
    .join('');
}

export function tagsOf(fragment: string): string {
  return (fragment.match(/<[^>]*>/g) ?? []).join('');
}

function encode(character: string): string {
  const code = character.codePointAt(0) ?? 0;
  return code > 0x7e ? `&#x${code.toString(16).toUpperCase()};` : character;
}

function sharedEnds(before: string[], after: string[]): { prefix: number; suffix: number } {
  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix])
    prefix++;
  let suffix = 0;
  while (
    suffix < before.length - prefix &&
    suffix < after.length - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  )
    suffix++;
  return { prefix, suffix };
}

export function encodeEdit(base: string, edited: string): string {
  const parts = units(base);
  const after = Array.from(edited);
  const { prefix, suffix } = sharedEnds(
    parts.map((unit) => unit.text),
    after
  );
  const raw = (slice: Unit[]) => slice.map((unit) => unit.raw).join('');
  return (
    raw(parts.slice(0, prefix)) +
    after
      .slice(prefix, after.length - suffix)
      .map(encode)
      .join('') +
    raw(parts.slice(parts.length - suffix))
  );
}

function plainText(fragment: string): string {
  return decodeFragment(fragment.replace(/<[^>]*>/g, ''));
}

export type Change = { prefix: string; removed: string; added: string; suffix: string };

export function changeBetween(ours: string, theirs: string): Change {
  const before = Array.from(plainText(ours));
  const after = Array.from(plainText(theirs));
  const { prefix, suffix } = sharedEnds(before, after);
  return {
    prefix: before.slice(0, prefix).join(''),
    removed: before.slice(prefix, before.length - suffix).join(''),
    added: after.slice(prefix, after.length - suffix).join(''),
    suffix: before.slice(before.length - suffix).join(''),
  };
}

export type Passage = { before: string; after: string };

const PASSAGE_REACH = 200;

export function passageAround(html: string, fragment: string): Passage {
  const index = html.indexOf(fragment);
  if (index < 0) return { before: '', after: '' };
  const before = plainText(html.slice(0, index)).replace(/\s+/g, ' ');
  const after = plainText(html.slice(index + fragment.length)).replace(/\s+/g, ' ');
  return {
    before:
      before.length > PASSAGE_REACH
        ? `…${before.slice(before.indexOf(' ', before.length - PASSAGE_REACH))}`
        : before,
    after:
      after.length > PASSAGE_REACH
        ? `${after.slice(0, after.lastIndexOf(' ', PASSAGE_REACH))}…`
        : after,
  };
}
