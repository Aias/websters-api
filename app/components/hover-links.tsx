'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// ─── Lookup cache ────────────────────────────────────────

/** normalized word → canonical key (or null if not found) */
const cache = new Map<string, string | null>();

async function lookupWord(word: string, signal: AbortSignal): Promise<string | null> {
  const normalized = word.toLowerCase();

  const cached = cache.get(normalized);
  if (cached !== undefined) return cached;

  try {
    const res = await fetch(`/api/lookup/${encodeURIComponent(normalized)}`, {
      signal,
    });
    if (!res.ok) return null;
    const data: { exists: boolean; key?: string } = await res.json();
    const key = data.exists && data.key ? data.key : null;
    cache.set(normalized, key);
    return key;
  } catch {
    // Aborted or network error — don't cache
    return null;
  }
}

// ─── Word detection ──────────────────────────────────────

interface WordAtPoint {
  word: string;
  range: Range;
}

function getWordAtPoint(x: number, y: number): WordAtPoint | null {
  const pos = document.caretPositionFromPoint(x, y);
  if (!pos || pos.offsetNode.nodeType !== Node.TEXT_NODE) return null;
  const textNode = pos.offsetNode;
  const offset = pos.offset;

  // Skip text inside existing links
  if (textNode.parentElement?.closest('a')) return null;

  const text = textNode.textContent ?? '';
  if (offset >= text.length) return null;

  // Find word boundaries around the offset
  let start = offset;
  let end = offset;

  const isWordChar = (ch: string) => /[a-zA-Z]/.test(ch);

  if (!isWordChar(text[offset])) return null;

  while (start > 0 && isWordChar(text[start - 1])) start--;
  while (end < text.length && isWordChar(text[end])) end++;

  const word = text.slice(start, end);
  if (word.length < 2) return null;

  const range = document.createRange();
  range.setStart(textNode, start);
  range.setEnd(textNode, end);

  return { word, range };
}

// ─── Highlight management ────────────────────────────────

function createHighlight(range: Range, key: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = `/entry/${encodeURIComponent(key)}`;
  link.setAttribute('data-hover-link', '');
  range.surroundContents(link);

  // Trigger fade-in on next frame
  requestAnimationFrame(() => link.classList.add('visible'));

  return link;
}

function removeHighlight(link: HTMLAnchorElement) {
  const parent = link.parentNode;
  if (!parent) return;
  const text = document.createTextNode(link.textContent ?? '');
  parent.replaceChild(text, link);
  parent.normalize();
}

// ─── Component ───────────────────────────────────────────

const HOVER_DELAY_MS = 300;

export function HoverLinks({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let currentWord = '';
    let activeLink: HTMLAnchorElement | null = null;
    let delayTimer: ReturnType<typeof setTimeout> | null = null;
    let abortController: AbortController | null = null;
    let rafId: number | null = null;

    function cleanup() {
      if (delayTimer !== null) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
      abortController?.abort();
      abortController = null;
      if (activeLink) {
        removeHighlight(activeLink);
        activeLink = null;
      }
      currentWord = '';
    }

    function onPointerMove(e: PointerEvent) {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        handlePointer(e);
      });
    }

    function handlePointer(e: PointerEvent) {
      const { target } = e;
      if (!(target instanceof Element)) {
        if (currentWord) cleanup();
        return;
      }

      // Pointer is over the active hover-link — keep it alive
      if (activeLink?.contains(target)) return;

      // Skip if hovering over other excluded elements
      if (target.closest('a, h2')) {
        if (currentWord) cleanup();
        return;
      }

      const hit = getWordAtPoint(e.clientX, e.clientY);

      if (!hit) {
        if (currentWord) cleanup();
        return;
      }

      // Same word — nothing to do
      if (hit.word === currentWord) return;

      // Different word — reset and start new timer
      cleanup();
      currentWord = hit.word;

      abortController = new AbortController();
      const { signal } = abortController;
      const range = hit.range;

      delayTimer = setTimeout(() => {
        delayTimer = null;
        void lookupWord(currentWord, signal).then((key) => {
          if (signal.aborted || !key) return;

          // Verify the range is still valid (DOM hasn't changed)
          try {
            activeLink = createHighlight(range, key);
          } catch {
            // Range invalid — DOM changed during delay
          }
        });
      }, HOVER_DELAY_MS);
    }

    function onPointerLeave() {
      cleanup();
    }

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    return () => {
      cleanup();
      if (rafId !== null) cancelAnimationFrame(rafId);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
