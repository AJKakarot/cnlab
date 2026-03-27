"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TRAVEL_MS = 700;
const PAUSE_MS = 280;

type Leg = "idle" | "out" | "in";

function probeLeft(leg: Leg, motion: boolean): string {
  const L = "12%";
  const R = "88%";
  if (leg === "idle") return L;
  if (leg === "out") return motion ? R : L;
  return motion ? L : R;
}

type CallSpec = { name: string; args: string; result: string; xmlOut: string; xmlIn: string };

const CALLS: CallSpec[] = [
  { name: "add", args: "40, 2", result: "42", xmlOut: "<methodCall><methodName>add</methodName>…</methodCall>", xmlIn: "<methodResponse><value><i4>42</i4></value>…" },
  { name: "multiply", args: "6, 7", result: "42", xmlOut: "<methodCall><methodName>multiply</methodName>…</methodCall>", xmlIn: "<methodResponse><value><i4>42</i4></value>…" },
  { name: "greet", args: "'lab'", result: "Hello, lab (from RPC server)", xmlOut: "<methodCall><methodName>greet</methodName>…</methodCall>", xmlIn: "<methodResponse><value><string>Hello…</string></value>…" },
];

export function RpcXmlLab() {
  const [busy, setBusy] = useState(false);
  const [leg, setLeg] = useState<Leg>("idle");
  const [motion, setMotion] = useState(false);
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const push = useCallback((line: string) => {
    setLog((prev) => [...prev.slice(-16), line]);
  }, []);

  useEffect(() => () => clearTimers(), []);

  const runLeg = (callIdx: number, onDone: () => void) => {
    const c = CALLS[callIdx];
    setIdx(callIdx);
    push(`[CLIENT] proxy.${c.name}(${c.args})`);
    setLeg("out");
    setMotion(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setMotion(true)));
    const t1 = window.setTimeout(() => {
      setMotion(false);
      setLeg("in");
      requestAnimationFrame(() => requestAnimationFrame(() => setMotion(true)));
    }, TRAVEL_MS);
    timers.current.push(t1);
    const t2 = window.setTimeout(() => {
      setMotion(false);
      setLeg("idle");
      push(`[HTTP] POST /  ${c.xmlOut.slice(0, 48)}…`);
      push(`[SERVER] dispatch ${c.name}(${c.args})`);
      push(`[HTTP] 200  ${c.xmlIn.slice(0, 48)}…`);
      push(`[CLIENT]  → ${c.result}`);
      onDone();
    }, TRAVEL_MS * 2 + PAUSE_MS);
    timers.current.push(t2);
  };

  const runAll = () => {
    if (busy) return;
    clearTimers();
    setBusy(true);
    setLog([]);
    setLeg("idle");
    setMotion(false);
    push("[CLIENT] ServerProxy('http://127.0.0.1:8000/')");
    runLeg(0, () => {
      runLeg(1, () => {
        runLeg(2, () => setBusy(false));
      });
    });
  };

  const pos = probeLeft(leg, motion);
  const c = CALLS[idx];
  const bubbleLabel = leg === "out" ? "XML call" : leg === "in" ? "XML reply" : "";

  return (
    <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-8">
      <div className="min-w-0 overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/40 [-webkit-overflow-scrolling:touch] sm:p-5 md:p-6">
        <div className="relative mb-6 min-h-[7rem] min-w-[260px]">
          <div className="absolute left-[10%] right-[10%] top-[2.25rem] h-1.5 rounded-full bg-gradient-to-r from-pink-200 via-neutral-200 to-emerald-200 dark:from-pink-950 dark:via-neutral-700 dark:to-emerald-950" />
          <div className="relative flex justify-between">
            <div
              className={`z-10 flex max-w-[6.5rem] flex-col rounded-xl border-2 bg-white px-2 py-3 text-center dark:bg-neutral-950 ${
                leg === "out" && !motion ? "border-pink-400 ring-2 ring-pink-100 dark:border-pink-500 dark:ring-pink-900/40" : "border-neutral-200 dark:border-neutral-600"
              }`}
            >
              <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">Stub</span>
              <span className="text-[9px] text-pink-700 dark:text-pink-300">XML-RPC</span>
            </div>
            <div
              className={`z-10 flex max-w-[6.5rem] flex-col rounded-xl border-2 bg-white px-2 py-3 text-center dark:bg-neutral-950 ${
                leg === "in" && !motion ? "border-emerald-400 ring-2 ring-emerald-100 dark:border-emerald-500 dark:ring-emerald-900/40" : "border-neutral-200 dark:border-neutral-600"
              }`}
            >
              <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">Server</span>
              <span className="text-[9px] text-emerald-700 dark:text-emerald-300">:8000</span>
            </div>
          </div>
          {leg !== "idle" && (
            <div
              className={`pointer-events-none absolute top-10 z-20 -translate-x-1/2 rounded-lg border px-2 py-1 font-mono text-[9px] font-bold shadow-md transition-[left] duration-700 ease-in-out dark:text-neutral-100 ${
                leg === "out" ? "border-pink-300 bg-pink-50 text-pink-950 dark:border-pink-600 dark:bg-pink-950" : "border-emerald-300 bg-emerald-50 text-emerald-950 animate-packet-pulse dark:border-emerald-600 dark:bg-emerald-950"
              }`}
              style={{ left: pos }}
            >
              {bubbleLabel}
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={runAll}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
        >
          {busy ? "Running add → multiply → greet…" : "Run three RPC calls"}
        </button>
        {busy && c && (
          <p className="mt-2 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
            Now: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{c.name}</span>({c.args})
          </p>
        )}
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Output</h3>
        <ul className="mt-3 max-h-52 space-y-1 overflow-y-auto font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
          {log.length === 0 && <li className="text-neutral-400">Run the demo to see stub → HTTP+XML → server → result.</li>}
          {log.map((line, i) => (
            <li key={`${String(i)}-${line.slice(0, 20)}`} className="animate-log-line border-l-2 border-neutral-200 pl-2 dark:border-neutral-600">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
