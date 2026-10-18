'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function Masonry({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const items = [...grid.children].filter((child) => child instanceof HTMLElement);
    const observer = new ResizeObserver(() => {
      const gap = parseFloat(getComputedStyle(grid).rowGap);
      const bottoms = new Map<number, number>();
      const offsets = items.map((item) => {
        const top = bottoms.get(item.offsetLeft) ?? 0;
        bottoms.set(item.offsetLeft, top + item.offsetHeight + gap);
        return top - item.offsetTop;
      });
      items.forEach((item, i) => {
        item.style.translate = `0 ${offsets[i]}px`;
      });
      grid.style.height = `${Math.max(...bottoms.values()) - gap}px`;
    });
    for (const element of [grid, ...items]) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] items-start gap-4"
    >
      {children}
    </div>
  );
}
