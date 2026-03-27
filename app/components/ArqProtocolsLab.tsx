"use client";

import { useState } from "react";
import { SlidingWindowLab } from "./SlidingWindowLab";
import { StopAndWaitLab } from "./StopAndWaitLab";

/** Syllabus experiment 1 — stop-and-wait + sliding window in one place. */
export function ArqProtocolsLab() {
  const [mode, setMode] = useState<"stopwait" | "sliding">("stopwait");

  return (
    <div className="min-w-0">
      <div
        className="flex flex-wrap gap-2 border-b border-neutral-200 bg-neutral-100 px-3 py-3"
        role="tablist"
        aria-label="ARQ mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "stopwait"}
          onClick={() => setMode("stopwait")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            mode === "stopwait"
              ? "bg-neutral-900 text-white shadow-sm"
              : "border border-transparent text-neutral-600 hover:border-neutral-200 hover:bg-white"
          }`}
        >
          Part A — Stop-and-wait
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sliding"}
          onClick={() => setMode("sliding")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            mode === "sliding"
              ? "bg-neutral-900 text-white shadow-sm"
              : "border border-transparent text-neutral-600 hover:border-neutral-200 hover:bg-white"
          }`}
        >
          Part B — Sliding window
        </button>
      </div>
      {mode === "stopwait" ? <StopAndWaitLab /> : <SlidingWindowLab />}
    </div>
  );
}
