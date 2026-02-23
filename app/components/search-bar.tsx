'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') ?? '';
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const abortRef = useRef<AbortController>(null);
  const [results, setResults] = useState<Array<{ key: string; partOfSpeech: string | null }>>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Sync input value when URL changes (adjust state during render, not effect)
  const [query, setQuery] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setQuery(q);
  }

  // Global `/` shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;

      if (!(e.target instanceof HTMLElement)) return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  function fetchResults(value: string) {
    abortRef.current?.abort();

    if (!value) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    fetch(`/api/search?q=${encodeURIComponent(value)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: Array<{ key: string; partOfSpeech: string | null }>) => {
        setResults(data);
        setActiveIndex(-1);
      })
      .catch(() => {});
  }

  function navigate(key: string) {
    setOpen(false);
    inputRef.current?.blur();
    router.push(`/entry/${encodeURIComponent(key)}`);
  }

  function scrollToIndex(index: number) {
    const item = listRef.current?.children.item(index);
    if (item instanceof HTMLElement) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = activeIndex < results.length - 1 ? activeIndex + 1 : 0;
        setActiveIndex(next);
        scrollToIndex(next);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = activeIndex > 0 ? activeIndex - 1 : results.length - 1;
        setActiveIndex(prev);
        scrollToIndex(prev);
        break;
      }
      case 'Enter':
        if (activeIndex >= 0) {
          e.preventDefault();
          navigate(results[activeIndex].key);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        inputRef.current?.blur();
        break;
    }
  }

  const showDropdown = open && query && results.length > 0;

  return (
    <search>
      <form action="/" method="get" className="relative">
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            fetchResults(e.target.value);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so clicks on results register
            setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Look up a word…"
          aria-label="Search dictionary"
          aria-keyshortcuts="/"
          aria-expanded={!!showDropdown}
          aria-controls="search-results"
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          className="w-full rounded-lg border border-input bg-background px-4 py-2 font-sans text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        />
        {!open && !query && (
          <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
            /
          </kbd>
        )}
        {showDropdown && (
          <ul
            ref={listRef}
            id="search-results"
            role="listbox"
            className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto overscroll-contain rounded-lg border border-border bg-background py-1 shadow-lg"
          >
            {results.map((result, i) => (
              <li
                key={result.key}
                id={`search-result-${i}`}
                role="option"
                aria-selected={i === activeIndex}
              >
                <Link
                  href={`/entry/${encodeURIComponent(result.key)}`}
                  tabIndex={-1}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    navigate(result.key);
                  }}
                  className={`flex items-baseline gap-2 px-4 py-1.5 ${i === activeIndex ? 'bg-accent text-accent-foreground' : 'text-foreground/80 hover:bg-accent/50'}`}
                >
                  {result.key}
                  {result.partOfSpeech && (
                    <span className="text-sm text-muted-foreground italic">
                      {result.partOfSpeech}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </form>
    </search>
  );
}
