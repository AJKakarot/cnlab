"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TRAVEL_MS = 780;
const PAUSE_MS = 320;

type Tab = "get" | "post";

type Leg = "idle" | "out" | "in";

function probeLeft(leg: Leg, motion: boolean): string {
  const L = "12%";
  const R = "88%";
  if (leg === "idle") return L;
  if (leg === "out") return motion ? R : L;
  return motion ? L : R;
}

export function HttpSocketLab() {
  const [tab, setTab] = useState<Tab>("get");
  const [busy, setBusy] = useState(false);

  const [leg, setLeg] = useState<Leg>("idle");
  const [motion, setMotion] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const push = useCallback((line: string) => {
    setLog((prev) => [...prev.slice(-14), line]);
  }, []);

  useEffect(() => () => clearTimers(), []);

  const runGet = () => {
    if (busy) return;
    clearTimers();
    setBusy(true);
    setLog([]);
    setLeg("idle");
    setMotion(false);

    push("[TCP] connect → example.com:443 (TLS, simplified)");
    const t0 = window.setTimeout(() => {
      setLeg("out");
      setMotion(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setMotion(true)));
      push("[REQ] GET / HTTP/1.1");
      push("      Host: example.com");
      push("      User-Agent: NetworkLab-HTTP/1.0");
    }, 200);
    timers.current.push(t0);

    const t1 = window.setTimeout(() => {
      setMotion(false);
      setLeg("in");
      requestAnimationFrame(() => requestAnimationFrame(() => setMotion(true)));
    }, 200 + TRAVEL_MS);
    timers.current.push(t1);

    const t2 = window.setTimeout(() => {
      setMotion(false);
      setLeg("idle");
      push("[RESP] HTTP/1.1 200 OK");
      push("       Content-Type: text/html");
      push("[BODY] <!doctype html>… (resource bytes)");
      setBusy(false);
    }, 200 + TRAVEL_MS * 2 + PAUSE_MS);
    timers.current.push(t2);
  };

  const runPost = () => {
    if (busy) return;
    clearTimers();
    setBusy(true);
    setLog([]);
    setLeg("idle");
    setMotion(false);

    push("[TCP] connect → 127.0.0.1:8080");
    const t0 = window.setTimeout(() => {
      setLeg("out");
      setMotion(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setMotion(true)));
      push("[REQ] POST /upload HTTP/1.1");
      push("      Host: 127.0.0.1:8080");
      push('      Content-Type: application/octet-stream');
      push("      Content-Length: 128");
      push("[BODY] … 128 octets …");
    }, 200);
    timers.current.push(t0);

    const t1 = window.setTimeout(() => {
      setMotion(false);
      setLeg("in");
      requestAnimationFrame(() => requestAnimationFrame(() => setMotion(true)));
    }, 200 + TRAVEL_MS);
    timers.current.push(t1);

    const t2 = window.setTimeout(() => {
      setMotion(false);
      setLeg("idle");
      push("[RESP] HTTP/1.1 200 OK (or 501 if server rejects POST)");
      setBusy(false);
    }, 200 + TRAVEL_MS * 2 + PAUSE_MS);
    timers.current.push(t2);
  };

  const pos = probeLeft(leg, motion);
  const showBubble = leg !== "idle";

  const outbound = tab === "get" ? "GET" : "POST";
  const inbound = "200";
  const clientLabel = tab === "get" ? "Client\n(urllib)" : "Client\n(http.client)";
  const serverLabel = tab === "get" ? "example.com\n:443" : "127.0.0.1\n:8080";

  return (
    <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-8">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["get", "GET"] as const,
            ["post", "POST"] as const,
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            disabled={busy}
            onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === k
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            } disabled:opacity-50`}
          >
            HTTP {label}
          </button>
        ))}
      </div>

      <div className="min-w-0 overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/40 [-webkit-overflow-scrolling:touch] sm:p-5 md:p-6">
        <div className="relative mb-4 min-h-[6.5rem] min-w-[260px]">
          <div className="absolute left-[10%] right-[10%] top-[2.25rem] h-1.5 rounded-full bg-gradient-to-r from-orange-200/90 via-neutral-200 to-violet-200/90 dark:from-orange-950 dark:via-neutral-700 dark:to-violet-950" />
          <div className="relative flex justify-between gap-2">
            <div
              className={`z-10 flex max-w-[7rem] flex-col items-center rounded-xl border-2 bg-white px-2 py-3 text-center dark:bg-neutral-950 ${
                leg === "out" && !motion ? "border-orange-400 ring-2 ring-orange-100 dark:border-orange-500 dark:ring-orange-900/40" : "border-neutral-200 dark:border-neutral-600"
              }`}
            >
              <span className="whitespace-pre-line text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                {clientLabel}
              </span>
            </div>
            <div
              className={`z-10 flex max-w-[7rem] flex-col items-center rounded-xl border-2 bg-white px-2 py-3 text-center dark:bg-neutral-950 ${
                leg === "in" && !motion ? "border-violet-400 ring-2 ring-violet-100 dark:border-violet-500 dark:ring-violet-900/40" : "border-neutral-200 dark:border-neutral-600"
              }`}
            >
              <span className="whitespace-pre-line text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                {serverLabel}
              </span>
            </div>
          </div>

          {showBubble && (
            <div
              className={`pointer-events-none absolute top-8 z-20 -translate-x-1/2 rounded-lg border px-2 py-1 font-mono text-[9px] font-bold shadow-md transition-[left] duration-700 ease-in-out md:text-[10px] ${
                leg === "out"
                  ? "border-orange-300 bg-orange-50 text-orange-950 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-100"
                  : "border-violet-300 bg-violet-50 text-violet-950 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-100 animate-packet-pulse"
              }`}
              style={{ left: pos }}
            >
              {leg === "out" ? `${outbound} →` : `← ${inbound}`}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={tab === "get" ? runGet : runPost}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            {busy ? "Running…" : "Run flow"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Output</h3>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {log.length === 0 && <li className="text-neutral-400">Run flow to step through request / response.</li>}
          {log.map((line, i) => (
            <li
              key={`${String(i)}-${line.slice(0, 24)}`}
              className="animate-log-line border-l-2 border-neutral-200 pl-2 dark:border-neutral-600"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
