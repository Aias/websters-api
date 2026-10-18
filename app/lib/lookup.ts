export function normalizeLookup(value: string): string {
  return value
    .normalize('NFC')
    .trim()
    .replace(/[‘’]/g, "'")
    .replace(/\{\d+\}$/, '')
    .toLowerCase();
}
