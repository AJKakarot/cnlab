"use client";

import { useState } from "react";
import { SlidingWindowLab } from "./SlidingWindowLab";
import { StopAndWaitLab } from "./StopAndWaitLab";

/** Syllabus experiment 1 — stop-and-wait + sliding window in one place. */
export function ArqProtocolsLab() {
  const [mode, setMode] = useState<"stopwait" | "sliding">("stopwait");

  return (
    <div>
      <div
        className="flex flex-wrap gap-2 border-b border-neutral-200 bg-neutral-50/90 px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-950/80"
        role="tablist"
        aria-label="ARQ mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "stopwait"}
          onClick={() => setMode("stopwait")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            mode === "stopwait"
              ? "bg-neutral-900 text-white shadow dark:bg-neutral-100 dark:text-neutral-900"
              : "text-neutral-600 hover:bg-white hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          }`}
        >
          Part A — Stop-and-wait
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sliding"}
          onClick={() => setMode("sliding")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            mode === "sliding"
              ? "bg-neutral-900 text-white shadow dark:bg-neutral-100 dark:text-neutral-900"
              : "text-neutral-600 hover:bg-white hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          }`}
        >
          Part B — Sliding window
        </button>
      </div>
      {mode === "stopwait" ? <StopAndWaitLab /> : <SlidingWindowLab />}
    </div>
  );
}
