"use client";

import { useMemo, useState } from "react";
import { runAimd } from "@/lib/aimd-sim";

export function NsCongestionLab() {
  const [rtt, setRtt] = useState(10);
  const [rounds, setRounds] = useState(24);
  const [ssthresh, setSsthresh] = useState(16);
  const rows = useMemo(() => runAimd(ssthresh, rounds, rtt), [ssthresh, rounds, rtt]);

  const maxCwnd = useMemo(() => Math.max(...rows.map((r) => r.cwnd), 1), [rows]);
  const points = useMemo(() => {
    if (rows.length === 0) return "";
    const w = 640;
    const h = 180;
    const pad = 24;
    const denom = rows.length > 1 ? rows.length - 1 : 1;
    return rows
      .map((row, i) => {
        const x = pad + (i / denom) * (w - pad * 2);
        const y = pad + (1 - row.cwnd / maxCwnd) * (h - pad * 2);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [rows, maxCwnd]);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-xs font-medium text-neutral-500">
          RTT label (ms/step)
          <input
            type="number"
            min={1}
            max={500}
            value={rtt}
            onChange={(e) => setRtt(Number(e.target.value) || 10)}
            className="ml-2 w-20 rounded-lg border border-neutral-200 px-2 py-1 dark:border-neutral-600 dark:bg-neutral-950"
          />
        </label>
        <label className="text-xs font-medium text-neutral-500">
          Rounds
          <input
            type="number"
            min={5}
            max={80}
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value) || 24)}
            className="ml-2 w-20 rounded-lg border border-neutral-200 px-2 py-1 dark:border-neutral-600 dark:bg-neutral-950"
          />
        </label>
        <label className="text-xs font-medium text-neutral-500">
          ssthresh
          <input
            type="number"
            min={2}
            max={64}
            step={0.5}
            value={ssthresh}
            onChange={(e) => setSsthresh(Number(e.target.value) || 16)}
            className="ml-2 w-20 rounded-lg border border-neutral-200 px-2 py-1 dark:border-neutral-600 dark:bg-neutral-950"
          />
        </label>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-950 p-4 dark:border-neutral-700">
        <p className="text-[11px] text-neutral-400">cwnd vs round (same rule as ns_congestion_sim.py)</p>
        <svg viewBox="0 0 640 200" className="mt-2 w-full max-w-2xl" role="img" aria-label="cwnd over time">
          <rect width="640" height="200" fill="#0c0a09" rx="8" />
          <path d={points} fill="none" stroke="#34d399" strokeWidth="2.5" transform="" />
          <text x="320" y="24" textAnchor="middle" fill="#a8a29e" fontSize="11">
            AIMD toy (not NS-3)
          </text>
        </svg>
      </div>

      <div className="max-h-64 overflow-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-950">
        <table className="w-full font-mono text-[11px]">
          <thead className="sticky top-0 bg-neutral-100 dark:bg-neutral-900">
            <tr>
              <th className="px-2 py-2 text-left text-neutral-600">RTT(ms)</th>
              <th className="px-2 py-2 text-left text-neutral-600">cwnd</th>
              <th className="px-2 py-2 text-left text-neutral-600">event</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.round}
                className={row.event.includes("MD") ? "bg-red-500/10 dark:bg-red-950/30" : "border-t border-neutral-100 dark:border-neutral-800"}
              >
                <td className="px-2 py-1 text-neutral-800 dark:text-neutral-200">{row.rttMs}</td>
                <td className="px-2 py-1 text-emerald-700 dark:text-emerald-400">{row.cwnd.toFixed(3)}</td>
                <td className="px-2 py-1 text-neutral-600 dark:text-neutral-400">{row.event}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500">
        Match CLI: python3 experiments/ns_congestion_sim.py --rtt {rtt} --rounds {rounds} --ssthresh {ssthresh}
      </p>
    </div>
  );
}
