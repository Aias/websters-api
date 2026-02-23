/**
 * Porter stemming algorithm for English.
 * M.F. Porter, "An algorithm for suffix stripping", Program 14(3), 1980, pp. 130–137.
 *
 * Expects lowercase ASCII input. Returns the stemmed form.
 */
export function porterStem(word: string): string {
  if (word.length < 3) return word;

  function cons(w: string, i: number): boolean {
    switch (w[i]) {
      case 'a':
      case 'e':
      case 'i':
      case 'o':
      case 'u':
        return false;
      case 'y':
        return i === 0 || !cons(w, i - 1);
      default:
        return true;
    }
  }

  function measure(s: string): number {
    let n = 0;
    let i = 0;
    while (i < s.length && cons(s, i)) i++;
    while (i < s.length) {
      while (i < s.length && !cons(s, i)) i++;
      if (i >= s.length) break;
      n++;
      while (i < s.length && cons(s, i)) i++;
    }
    return n;
  }

  function hasVowel(s: string): boolean {
    for (let i = 0; i < s.length; i++) {
      if (!cons(s, i)) return true;
    }
    return false;
  }

  function endsWithDouble(s: string): boolean {
    const j = s.length - 1;
    return j >= 1 && s[j] === s[j - 1] && cons(s, j);
  }

  function endsCVC(s: string): boolean {
    const j = s.length - 1;
    if (j < 2) return false;
    if (!cons(s, j) || cons(s, j - 1) || !cons(s, j - 2)) return false;
    return s[j] !== 'w' && s[j] !== 'x' && s[j] !== 'y';
  }

  let w = word;

  // ── Step 1a: plurals ──

  if (w.endsWith('sses')) {
    w = w.slice(0, -2);
  } else if (w.endsWith('ies')) {
    w = w.slice(0, -2);
  } else if (!w.endsWith('ss') && w.endsWith('s')) {
    w = w.slice(0, -1);
  }

  // ── Step 1b: past tense / progressive ──

  let step1bExtra = false;

  if (w.endsWith('eed')) {
    const stem = w.slice(0, -3);
    if (measure(stem) > 0) w = w.slice(0, -1);
  } else if (w.endsWith('ed')) {
    const stem = w.slice(0, -2);
    if (hasVowel(stem)) {
      w = stem;
      step1bExtra = true;
    }
  } else if (w.endsWith('ing')) {
    const stem = w.slice(0, -3);
    if (hasVowel(stem)) {
      w = stem;
      step1bExtra = true;
    }
  }

  if (step1bExtra) {
    if (w.endsWith('at') || w.endsWith('bl') || w.endsWith('iz')) {
      w += 'e';
    } else if (endsWithDouble(w) && !w.endsWith('l') && !w.endsWith('s') && !w.endsWith('z')) {
      w = w.slice(0, -1);
    } else if (measure(w) === 1 && endsCVC(w)) {
      w += 'e';
    }
  }

  // ── Step 1c: y → i ──

  if (w.endsWith('y') && hasVowel(w.slice(0, -1))) {
    w = w.slice(0, -1) + 'i';
  }

  // ── Step 2: double suffixes ──

  const step2: [string, string][] = [
    ['ational', 'ate'],
    ['tional', 'tion'],
    ['enci', 'ence'],
    ['anci', 'ance'],
    ['izer', 'ize'],
    ['abli', 'able'],
    ['alli', 'al'],
    ['entli', 'ent'],
    ['eli', 'e'],
    ['ousli', 'ous'],
    ['ization', 'ize'],
    ['ation', 'ate'],
    ['ator', 'ate'],
    ['alism', 'al'],
    ['iveness', 'ive'],
    ['fulness', 'ful'],
    ['ousness', 'ous'],
    ['aliti', 'al'],
    ['iviti', 'ive'],
    ['biliti', 'ble'],
  ];

  for (const [suffix, repl] of step2) {
    if (w.endsWith(suffix)) {
      const stem = w.slice(0, -suffix.length);
      if (measure(stem) > 0) w = stem + repl;
      break;
    }
  }

  // ── Step 3: further reductions ──

  const step3: [string, string][] = [
    ['icate', 'ic'],
    ['ative', ''],
    ['alize', 'al'],
    ['iciti', 'ic'],
    ['ical', 'ic'],
    ['ful', ''],
    ['ness', ''],
  ];

  for (const [suffix, repl] of step3) {
    if (w.endsWith(suffix)) {
      const stem = w.slice(0, -suffix.length);
      if (measure(stem) > 0) w = stem + repl;
      break;
    }
  }

  // ── Step 4: strip residual suffixes (higher m threshold) ──

  const step4 = [
    'al',
    'ance',
    'ence',
    'er',
    'ic',
    'able',
    'ible',
    'ant',
    'ement',
    'ment',
    'ent',
    'ion',
    'ou',
    'ism',
    'ate',
    'iti',
    'ous',
    'ive',
    'ize',
  ];

  for (const suffix of step4) {
    if (w.endsWith(suffix)) {
      const stem = w.slice(0, -suffix.length);
      if (suffix === 'ion') {
        if (measure(stem) > 1 && (stem.endsWith('s') || stem.endsWith('t'))) {
          w = stem;
        }
      } else if (measure(stem) > 1) {
        w = stem;
      }
      break;
    }
  }

  // ── Step 5a: tidy trailing -e ──

  if (w.endsWith('e')) {
    const stem = w.slice(0, -1);
    if (measure(stem) > 1 || (measure(stem) === 1 && !endsCVC(stem))) {
      w = stem;
    }
  }

  // ── Step 5b: tidy -ll ──

  if (w.endsWith('ll') && measure(w) > 1) {
    w = w.slice(0, -1);
  }

  return w;
}
