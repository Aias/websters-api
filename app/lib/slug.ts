export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}
