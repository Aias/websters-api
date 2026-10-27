'use client';

import { CircleHalfIcon } from '@phosphor-icons/react/CircleHalf';
import { MoonIcon } from '@phosphor-icons/react/Moon';
import { SunIcon } from '@phosphor-icons/react/Sun';

const themes = ['auto', 'light', 'dark'];

export function ThemeToggle() {
  function cycleTheme() {
    const root = document.documentElement;
    const theme = themes[(themes.findIndex((t) => t === root.dataset.theme) + 1) % themes.length];
    root.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="absolute top-2 right-2 rounded-md p-2 text-muted-foreground hover:text-foreground sm:top-4 sm:right-4"
    >
      <CircleHalfIcon
        role="img"
        alt="Auto theme"
        className="hidden size-5 in-data-[theme=auto]:block"
      />
      <SunIcon role="img" alt="Light theme" className="hidden size-5 in-data-[theme=light]:block" />
      <MoonIcon role="img" alt="Dark theme" className="hidden size-5 in-data-[theme=dark]:block" />
    </button>
  );
}
