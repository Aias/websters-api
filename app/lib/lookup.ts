export function normalizeLookup(value: string): string {
  return value
    .normalize('NFC')
    .trim()
    .replace(/[‘’]/g, "'")
    .replace(/\{\d+\}$/, '')
    .toLowerCase();
}

export function rankHeadwords(
  query: string,
  headwords: ReadonlyArray<string>,
  limit: number
): Array<string> {
  const maxEdits = query.length < 3 ? 0 : query.length < 6 ? 1 : 2;
  const stride = query.length + maxEdits + 1;
  const cells = new Int32Array((query.length + 1) * stride);
  for (let j = 0; j < stride; j++) cells[j] = j;
  for (let i = 0; i <= query.length; i++) cells[i * stride] = i;
  const matches: Array<{ headword: string; prefixEdits: number; edits: number }> = [];
  scan: for (const headword of headwords) {
    const width = Math.min(headword.length, stride - 1);
    for (let i = 1; i <= query.length; i++) {
      let rowMin = i;
      for (let j = 1; j <= width; j++) {
        const at = i * stride + j;
        cells[at] = Math.min(
          cells[at - stride] + 1,
          cells[at - 1] + 1,
          cells[at - stride - 1] + (query[i - 1] === headword[j - 1] ? 0 : 1),
          i > 1 && j > 1 && query[i - 1] === headword[j - 2] && query[i - 2] === headword[j - 1]
            ? cells[at - 2 * stride - 2] + 1
            : Infinity
        );
        rowMin = Math.min(rowMin, cells[at]);
      }
      if (rowMin > maxEdits) continue scan;
    }
    const lastRow = cells.subarray(query.length * stride, query.length * stride + width + 1);
    matches.push({
      headword,
      prefixEdits: Math.min(...lastRow),
      edits: width === headword.length ? lastRow[width] : maxEdits + 1,
    });
  }
  return matches
    .sort(
      (a, b) =>
        a.prefixEdits - b.prefixEdits || a.edits - b.edits || (a.headword < b.headword ? -1 : 1)
    )
    .slice(0, limit)
    .map(({ headword }) => headword);
}
