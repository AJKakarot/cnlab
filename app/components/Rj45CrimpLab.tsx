"use client";

import { useState } from "react";

/** T568B front view — pin 1 left when latch is away from you (wire side toward you). */
const T568B = [
  { pin: 1, label: "white–orange", pair: 1, bar: "#fff", stripe: "#f97316" },
  { pin: 2, label: "orange", pair: 1, bar: "#f97316", stripe: "#f97316" },
  { pin: 3, label: "white–green", pair: 2, bar: "#fff", stripe: "#22c55e" },
  { pin: 4, label: "blue", pair: 3, bar: "#3b82f6", stripe: "#3b82f6" },
  { pin: 5, label: "white–blue", pair: 3, bar: "#fff", stripe: "#3b82f6" },
  { pin: 6, label: "green", pair: 2, bar: "#22c55e", stripe: "#22c55e" },
  { pin: 7, label: "white–brown", pair: 4, bar: "#fff", stripe: "#78350f" },
  { pin: 8, label: "brown", pair: 4, bar: "#78350f", stripe: "#78350f" },
] as const;

const STEPS = [
  "Strip ~2.5 cm jacket; do not nick pairs.",
  "Untwist only near the plug; keep twists tight until the plug.",
  "Order conductors W-O, O, W-G, Bl, W-Bl, G, W-Br, Br (T568B).",
  "Cut flush; conductors reach pin gold; jacket enters strain relief.",
  "Crimp once; clip should seat; tug test gently.",
] as const;

export function Rj45CrimpLab() {
  const [hiPair, setHiPair] = useState<number | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  return (
    <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-8">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Straight-through: <strong className="text-neutral-800 dark:text-neutral-200">same</strong> order on both ends
        (T568B ↔ T568B). Visual only — real lab uses crimp tool + tester.
      </p>

      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/25 sm:p-4 md:p-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-amber-900/80 dark:text-amber-200/90">
          RJ‑45 plug — wire end (T568B)
        </p>
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-1.5">
          {T568B.map((p) => {
            const on = hiPair === null || hiPair === p.pair;
            return (
              <button
                key={p.pin}
                type="button"
                onClick={() => setHiPair((v) => (v === p.pair ? null : p.pair))}
                className={`flex min-h-[4.25rem] flex-col items-center rounded-lg border-2 px-0.5 py-1.5 text-[8px] font-medium transition sm:min-h-0 sm:w-[4.75rem] sm:px-1 sm:py-2 sm:text-[9px] ${
                  on ? "border-amber-600 opacity-100 dark:border-amber-400" : "border-neutral-200 opacity-45 dark:border-neutral-600"
                }`}
                style={{
                  background: `linear-gradient(180deg, ${p.bar} 0%, ${p.bar} 42%, ${p.stripe} 42%, ${p.stripe} 100%)`,
                }}
              >
                <span className="font-mono text-[10px] font-bold text-neutral-900 dark:text-neutral-100">{p.pin}</span>
                <span className="mt-1 line-clamp-2 text-center leading-tight text-neutral-800 dark:text-neutral-200">{p.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[10px] text-neutral-500">Tap a pair to dim others (pairs share twist).</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Checklist</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-neutral-700 dark:text-neutral-300">
          {STEPS.map((s, i) => (
            <li key={s.slice(0, 12)} className={i === stepIdx ? "font-semibold text-amber-800 dark:text-amber-300" : ""}>
              {s}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStepIdx((i) => (i <= 0 ? STEPS.length - 1 : i - 1))}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStepIdx((i) => (i >= STEPS.length - 1 ? 0 : i + 1))}
            className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            Next step
          </button>
        </div>
      </div>
    </div>
  );
}
