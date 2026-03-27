"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  NODE_POS,
  ROUTING_GRAPH,
  dijkstraWithOrder,
  distanceVectorFinal,
  floodingSteps,
} from "@/lib/routing-graph";

type Tab = "flood" | "dv" | "ls";

const EDGES: [string, string, number][] = [
  ["A", "B", 2],
  ["A", "C", 5],
  ["B", "C", 1],
  ["B", "D", 4],
  ["C", "D", 1],
];

export function RoutingAlgorithmsLab() {
  const [tab, setTab] = useState<Tab>("flood");
  const [floodIdx, setFloodIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const floodSteps = useMemo(() => floodingSteps("A", "D"), []);
  const dvFinal = useMemo(() => distanceVectorFinal(), []);
  const { visitOrder, finalDist } = useMemo(() => dijkstraWithOrder("A"), []);

  const highlighted = useMemo(() => {
    if (tab !== "flood") return new Set<string>();
    const s = new Set<string>();
    for (let i = 0; i <= floodIdx; i += 1) {
      for (const n of floodSteps[i]?.reached ?? []) s.add(n);
    }
    return s;
  }, [tab, floodIdx, floodSteps]);

  useEffect(() => {
    if (!playing || tab !== "flood") return;
    const id = window.setInterval(() => {
      setFloodIdx((i) => (i >= floodSteps.length - 1 ? 0 : i + 1));
    }, 900);
    return () => window.clearInterval(id);
  }, [playing, tab, floodSteps.length]);

  const onTab = useCallback((t: Tab) => {
    setTab(t);
    setPlaying(false);
    setFloodIdx(0);
  }, []);

  return (
    <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-8">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["flood", "Flooding"] as const,
            ["dv", "Distance vector"] as const,
            ["ls", "Link-state SPF"] as const,
          ] as const
        ).map(([k, lab]) => (
          <button
            key={k}
            type="button"
            onClick={() => onTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === k ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-900"
            }`}
          >
            {lab}
          </button>
        ))}
      </div>

      <div className="min-w-0 rounded-2xl border border-neutral-200 bg-indigo-50/30 p-3 dark:border-neutral-700 dark:bg-indigo-950/20 sm:p-4">
        <div className="min-w-0 overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <svg viewBox="0 0 720 280" className="h-auto w-full min-w-[560px] max-w-none sm:min-w-0 sm:max-w-3xl" role="img" aria-label="topology A B C D">
          <rect width="720" height="280" rx="12" fill="#fafafa" className="dark:fill-neutral-950" />
          {EDGES.map(([a, b, w]) => {
            const pa = NODE_POS[a];
            const pb = NODE_POS[b];
            return (
              <g key={`${a}-${b}`}>
                <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#94a3b8" strokeWidth="3" />
                <text x={(pa.x + pb.x) / 2} y={(pa.y + pb.y) / 2 - 6} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600">
                  {w}
                </text>
              </g>
            );
          })}
          {(["A", "B", "C", "D"] as const).map((id) => {
            const { x, y } = NODE_POS[id];
            const on = highlighted.has(id);
            return (
              <g key={id}>
                <circle
                  cx={x}
                  cy={y}
                  r={28}
                  fill={on ? "#a5b4fc" : "#e0e7ff"}
                  stroke={on ? "#4338ca" : "#6366f1"}
                  strokeWidth={on ? 3 : 2}
                />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="16" fontWeight="700" fill="#312e81">
                  {id}
                </text>
              </g>
            );
          })}
        </svg>
        </div>

        {tab === "flood" && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setFloodIdx((i) => Math.max(0, i - 1))}
              className="rounded-lg border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-600"
            >
              Step back
            </button>
            <button
              type="button"
              onClick={() => setFloodIdx((i) => Math.min(floodSteps.length - 1, i + 1))}
              className="rounded-lg border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-600"
            >
              Step
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="rounded-lg bg-neutral-900 px-3 py-1 text-sm text-white dark:bg-neutral-100 dark:text-neutral-900"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              Hop {floodSteps[floodIdx]?.hop ?? 0}: {floodSteps[floodIdx]?.reached.join(", ")}
            </span>
          </div>
        )}

        {tab === "dv" && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.keys(ROUTING_GRAPH)
      .sort()
      .map((u) => (
              <div key={u} className="rounded-lg border border-neutral-200 bg-white p-3 font-mono text-[11px] dark:border-neutral-700 dark:bg-neutral-950">
                <p className="mb-2 font-sans text-xs font-bold text-indigo-800 dark:text-indigo-300">Router {u}</p>
                {Object.keys(dvFinal[u] ?? {})
                  .sort()
                  .map((d) => (
                    <div key={d} className="flex justify-between border-t border-neutral-100 py-0.5 dark:border-neutral-800">
                      <span>{d}</span>
                      <span className="text-neutral-600 dark:text-neutral-400">{dvFinal[u][d]}</span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}

        {tab === "ls" && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Dijkstra from <strong>A</strong> on the diagram: visit order{" "}
              <span className="break-all font-mono text-xs sm:text-sm">{visitOrder.join(" → ")}</span>
            </p>
            <div className="rounded-lg border border-neutral-200 bg-white p-3 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-950">
              {Object.keys(finalDist)
                .sort()
                .map((k) => (
                  <div key={k} className="flex justify-between py-0.5">
                    <span>{k}</span>
                    <span className="text-emerald-700 dark:text-emerald-400">{finalDist[k]}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <p className="break-words text-xs text-neutral-500">
        CLI: python3 experiments/routing_algorithms_lab.py demo | dijkstra
      </p>
    </div>
  );
}
