"use client";

import type { Experiment } from "@/lib/experiments";

export function PlaceholderExperimentLab({ experiment }: { experiment: Experiment }) {
  return (
    <div className="min-w-0 p-3 sm:p-4 md:p-6">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgb(37_99_235/0.08),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgb(16_185_129/0.06),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_30%_20%,rgb(96_165_250/0.12),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgb(52_211_153/0.08),transparent_45%)]" />
        <pre className="relative whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-neutral-800 dark:text-neutral-200 md:text-xs">
          {experiment.diagram}
        </pre>
      </div>
    </div>
  );
}
