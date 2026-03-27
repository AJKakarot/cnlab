"use client";

import { useMemo, useState } from "react";
import { analyzeCidr } from "@/lib/subnet-calc";

const PRESETS = ["192.168.1.50/26", "10.0.0.0/24", "172.16.0.0/20"];

export function SubnettingInteractiveLab() {
  const [cidr, setCidr] = useState("192.168.1.50/26");
  const result = useMemo(() => analyzeCidr(cidr), [cidr]);

  const hostFraction =
    result.totalAddrs > 0 && result.assignableHosts > 0 ? result.assignableHosts / result.totalAddrs : 0;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="cidr-in" className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            CIDR
          </label>
          <input
            id="cidr-in"
            value={cidr}
            onChange={(e) => setCidr(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-950"
            placeholder="192.168.1.0/24"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCidr(p)}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-neutral-600 dark:bg-neutral-900"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {result.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">{result.error}</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/40">
              <p className="text-[10px] font-bold uppercase tracking-wide text-sky-800 dark:text-sky-300">Network</p>
              <p className="mt-1 font-mono text-lg font-semibold text-sky-950 dark:text-sky-100">{result.network}</p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/40">
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-800 dark:text-violet-300">Broadcast</p>
              <p className="mt-1 font-mono text-lg font-semibold text-violet-950 dark:text-violet-100">{result.broadcast}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
              <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Netmask</p>
              <p className="mt-1 font-mono text-sm text-neutral-900 dark:text-neutral-100">{result.netmask}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
              <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Wildcard</p>
              <p className="mt-1 font-mono text-sm text-neutral-900 dark:text-neutral-100">{result.wildcard}</p>
            </div>
          </div>

          {result.firstHost && result.lastHost && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Usable host range</p>
              <p className="mt-1 font-mono text-sm text-emerald-950 dark:text-emerald-100">
                {result.firstHost} – {result.lastHost}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
            <div className="mb-2 flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
              <span>Assignable hosts (excl. net/broadcast, classful view)</span>
              <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">{result.assignableHosts}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(4, hostFraction * 100))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">Total addresses in prefix: {result.totalAddrs}</p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Python-style log</h3>
            <pre className="mt-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-neutral-800 dark:text-neutral-200">
              {`Network:     ${result.network}
Netmask:     ${result.netmask}
Wildcard:    ${result.wildcard}
Broadcast:   ${result.broadcast}
${result.firstHost ? `First host:  ${result.firstHost}\nLast host:   ${result.lastHost}\n` : ""}Assign. hosts: ${result.assignableHosts}  (excluding net/broadcast on classful view)
Total addrs:   ${result.totalAddrs}`}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
