"use client";

import { useCallback, useState } from "react";

type Mode = "hub" | "switch" | "router";

export function LanDevicesLab() {
  const [mode, setMode] = useState<Mode>("switch");
  const [phase, setPhase] = useState<"idle" | "send" | "done">("idle");
  const [log, setLog] = useState<string[]>([]);

  const push = useCallback((line: string) => {
    setLog((prev) => [...prev.slice(-14), line]);
  }, []);

  const runDemo = () => {
    setPhase("send");
    setLog([]);
    const done = (ms: number) => {
      window.setTimeout(() => setPhase("done"), ms);
    };
    if (mode === "hub") {
      push("[PC1 → HUB] unicast dest MAC = PC2 (hub repeats to all ports)");
      window.setTimeout(() => {
        push("[PC2] accepts frame");
        push("[PC3] NIC discards (wrong MAC)");
        push("[others] every port receives electrical copy");
      }, 400);
      done(1200);
    } else if (mode === "switch") {
      push("[SW] MAC table: fa0/1→AA, fa0/2→BB, fa0/3→CC");
      push("[PC1 → SW] dest BB — learned unicast out fa0/2 only");
      window.setTimeout(() => {
        push("[PC2] receives; per-port collision domain");
      }, 400);
      done(900);
    } else {
      push("[PC1 192.168.1.10] → 10.0.0.5 via gw 192.168.1.1");
      push("[RTR] decap IP; forward to 10.0.0.0/24");
      window.setTimeout(() => {
        push("[RTR] new L2 hop toward PC4");
        push("[PC4] reply symmetric");
      }, 450);
      done(1000);
    }
  };

  return (
    <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-8">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["hub", "Hub (L1 repeat)"] as const,
            ["switch", "Switch (L2 MAC)"] as const,
            ["router", "Router (L3 IP)"] as const,
          ] as const
        ).map(([k, lab]) => (
          <button
            key={k}
            type="button"
            disabled={phase === "send"}
            onClick={() => {
              setMode(k);
              setPhase("idle");
              setLog([]);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              mode === k ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-900"
            } disabled:opacity-50`}
          >
            {lab}
          </button>
        ))}
      </div>

      <div className="relative min-w-0 rounded-2xl border border-sky-200/80 bg-sky-50/40 p-3 dark:border-sky-900/50 dark:bg-sky-950/20 sm:p-4 md:p-6">
        <div className="min-w-0 overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <svg viewBox="0 0 640 260" className="h-auto w-full min-w-[520px] max-w-none sm:min-w-0 sm:max-w-3xl" role="img" aria-label="LAN topology">
          <rect width="640" height="260" rx="14" fill="#f8fafc" className="dark:fill-neutral-950" />
          {/* links */}
          <line x1="132" y1="126" x2="250" y2="128" stroke="#94a3b8" strokeWidth="3" />
          <line x1="390" y1="128" x2="420" y2="126" stroke="#94a3b8" strokeWidth="3" />
          <line x1="320" y1="165" x2="316" y2="200" stroke="#94a3b8" strokeWidth="3" />
          {mode === "router" && (
            <>
              <line x1="390" y1="128" x2="536" y2="126" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 4" />
              <text x="470" y="118" fontSize="9" fill="#64748b">
                other subnet
              </text>
            </>
          )}

          {/* center device */}
          <rect
            x="250"
            y="95"
            width="140"
            height="70"
            rx="10"
            fill={mode === "hub" ? "#fde68a" : mode === "switch" ? "#bae6fd" : "#c4b5fd"}
            stroke="#475569"
            strokeWidth="2"
          />
          <text x="320" y="128" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1e293b">
            {mode === "hub" ? "HUB" : mode === "switch" ? "SW" : "RTR"}
          </text>
          <text x="320" y="148" textAnchor="middle" fontSize="9" fill="#64748b">
            {mode === "hub" ? "L1 repeat" : mode === "switch" ? "L2 forward" : "L3 route"}
          </text>

          {/* PCs */}
          {[
            { x: 60, y: 100, id: "PC1", sub: "192.168.1.10" },
            { x: 420, y: 100, id: "PC2", sub: "192.168.1.20" },
            { x: 280, y: 205, id: "PC3", sub: "192.168.1.30" },
            ...(mode === "router" ? ([{ x: 500, y: 100, id: "PC4", sub: "10.0.0.5" }] as const) : []),
          ].map((pc) => (
            <g key={pc.id}>
              <rect x={pc.x} y={pc.y} width="72" height="52" rx="6" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
              <text x={pc.x + 36} y={pc.y + 22} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">
                {pc.id}
              </text>
              <text x={pc.x + 36} y={pc.y + 38} textAnchor="middle" fontSize="7" fill="#64748b">
                {pc.sub}
              </text>
            </g>
          ))}

          {/* animated packet */}
          {phase === "send" && (
            <circle r="9" fill="#22c55e" opacity="0.95" cx="96" cy="126">
              {mode === "hub" && (
      <>
                <animate attributeName="cx" dur="1.1s" fill="freeze" values="96;320;456;320;316" />
                <animate attributeName="cy" dur="1.1s" fill="freeze" values="126;130;126;130;231" />
      </>
              )}
              {mode === "switch" && (
                <>
                  <animate attributeName="cx" dur="0.85s" fill="freeze" values="96;320;456" />
                  <animate attributeName="cy" dur="0.85s" fill="freeze" values="126;128;126" />
                </>
              )}
              {mode === "router" && (
                <>
                  <animate attributeName="cx" dur="1s" fill="freeze" values="96;320;456;536" />
                  <animate attributeName="cy" dur="1s" fill="freeze" values="126;128;126;126" />
                </>
              )}
            </circle>
          )}
        </svg>
        </div>

        <button
          type="button"
          disabled={phase === "send"}
          onClick={runDemo}
          className="mt-4 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {phase === "send" ? "Sending…" : "Send demo frame / flow"}
        </button>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">What changed</h3>
        <ul className="mt-3 max-h-44 space-y-1 overflow-y-auto font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
          {log.length === 0 && <li className="text-neutral-400">Run the demo.</li>}
          {log.map((line, i) => (
            <li key={`${String(i)}-${line.slice(0, 20)}`} className="border-l-2 border-sky-200 pl-2 dark:border-sky-900">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
