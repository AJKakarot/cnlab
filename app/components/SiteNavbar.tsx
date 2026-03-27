"use client";

import Link from "next/link";
import { useSelectedExperiment } from "../context/experiment-context";
import { useThemeMode } from "../context/theme-context";

export function SiteNavbar() {
  const { experimentId } = useSelectedExperiment();
  const { theme, toggleTheme } = useThemeMode();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="mx-auto flex h-11 max-w-4xl items-center justify-between gap-4 px-4 md:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-neutral-900 transition hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
        >
          Computer Program Lab
        </Link>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 sm:px-3 sm:text-xs"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <Link
            href={`/docs/${experimentId}`}
            className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 sm:px-3 sm:text-xs"
          >
            Docs
          </Link>
        </div>
      </div>
    </header>
  );
}
