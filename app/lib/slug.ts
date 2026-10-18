export function slugify(value: string): string {
  return value
    .normalize('NFC')
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/_/g, ' ')
    .replace(/[^\p{L}0-9\s'.-]/gu, '')
    .trim()
    .replace(/\s+/g, '_');
}
