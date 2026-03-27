"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TRAVEL_MS = 650;
const PAUSE_MS = 260;

type Tab = "echo" | "chat" | "file";

type Leg = "idle" | "out" | "in";

function probeLeft(leg: Leg, motion: boolean): string {
  const L = "11%";
  const R = "89%";
  if (leg === "idle") return L;
  if (leg === "out") return motion ? R : L;
  return motion ? L : R;
}

export function TcpSocketAppsLab() {
  const [tab, setTab] = useState<Tab>("echo");
  const [busy, setBusy] = useState(false);
  const [leg, setLeg] = useState<Leg>("idle");
  const [motion, setMotion] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [fileChunk, setFileChunk] = useState(0);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const push = useCallback((line: string) => {
    setLog((prev) => [...prev.slice(-16), line]);
  }, []);

  useEffect(() => () => clearTimers(), []);

  const trip = (after: () => void) => {
    setLeg("out");
    setMotion(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setMotion(true)));
    timers.current.push(
      window.setTimeout(() => {
        setMotion(false);
        setLeg("in");
        requestAnimationFrame(() => requestAnimationFrame(() => setMotion(true)));
      }, TRAVEL_MS)
    );
    timers.current.push(
      window.setTimeout(() => {
        setMotion(false);
        setLeg("idle");
        after();
      }, TRAVEL_MS * 2 + PAUSE_MS)
    );
  };

  const runEcho = () => {
    if (busy) return;
    clearTimers();
    setBusy(true);
    setLog([]);
    push("[ECHO] client :9100 → server");
    timers.current.push(
      window.setTimeout(() => {
        trip(() => {
          push("[CLIENT] send: Echo client hello\\n");
          push("[SERVER] recv / sendall echo");
          push("[CLIENT] recv echoed line");
          setBusy(false);
        });
      }, 120)
    );
  };

  const runChat = () => {
    if (busy) return;
    clearTimers();
    setBusy(true);
    setLog([]);
    push("[CHAT] line-at-a-time on :9101");
    timers.current.push(
      window.setTimeout(() => {
        trip(() => {
          push("[CLIENT→] hi lab");
          push("[SERVER→] [relay] hi lab");
          trip(() => {
            push("[CLIENT→] quit");
            push("[SERVER→] [relay] quit");
            setBusy(false);
          });
        });
      }, 120)
    );
  };

  const runFile = () => {
    if (busy) return;
    clearTimers();
    setBusy(true);
    setLog([]);
    setFileChunk(0);
    setLeg("idle");
    setMotion(false);
    push("[FILE] file-recv waits; file-send streams bytes");
    let step = 0;
    const next = () => {
      step += 1;
      setFileChunk(step);
      push(`[STREAM] chunk ${step}/4 (~64 KiB each)`);
      if (step < 4) timers.current.push(window.setTimeout(next, 320));
      else {
        timers.current.push(
          window.setTimeout(() => {
            push("[FILE RECV] wrote out.bin");
            push("[FILE SEND] done");
            setFileChunk(0);
            setBusy(false);
          }, 400)
        );
      }
    };
    timers.current.push(window.setTimeout(next, 200));
  };

  const leftLabel = tab === "echo" ? "Echo\nclient" : tab === "chat" ? "Chat\nclient" : "file-send";
  const rightLabel = tab === "echo" ? "Echo\nserver" : tab === "chat" ? "Chat\nserver" : "file-recv";
  const pos = probeLeft(leg, motion);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["echo", "Echo"] as const,
            ["chat", "Chat"] as const,
            ["file", "File"] as const,
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
                : "border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-900"
            } disabled:opacity-50`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900/40 md:p-6">
        <div className="relative mb-8 min-h-[6.5rem]">
          <div className="absolute left-[10%] right-[10%] top-[2.25rem] h-1.5 rounded-full bg-gradient-to-r from-blue-200 via-neutral-200 to-teal-200 dark:from-blue-950 dark:via-neutral-700 dark:to-teal-950" />
          {tab === "file" && (
            <div className="absolute bottom-1 left-[10%] right-[10%] h-2 rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div className="h-full rounded-full bg-teal-500 transition-[width]" style={{ width: `${fileChunk * 25}%` }} />
            </div>
          )}
          <div className="relative flex justify-between">
            <div
              className={`z-10 whitespace-pre-line rounded-xl border-2 bg-white px-2 py-3 text-center text-[10px] font-semibold dark:bg-neutral-950 ${
                leg === "out" && !motion ? "border-blue-400 ring-2 ring-blue-100 dark:border-blue-500" : "border-neutral-200 dark:border-neutral-600"
              }`}
            >
              {leftLabel}
            </div>
            <div
              className={`z-10 whitespace-pre-line rounded-xl border-2 bg-white px-2 py-3 text-center text-[10px] font-semibold dark:bg-neutral-950 ${
                leg === "in" && !motion ? "border-teal-400 ring-2 ring-teal-100 dark:border-teal-500" : "border-neutral-200 dark:border-neutral-600"
              }`}
            >
              {rightLabel}
            </div>
          </div>
          {leg !== "idle" && tab !== "file" && (
            <div
              className={`pointer-events-none absolute top-10 z-20 -translate-x-1/2 rounded-lg border px-2 py-1 font-mono text-[9px] font-bold shadow-md transition-[left] duration-700 ease-in-out ${
                leg === "out" ? "border-blue-300 bg-blue-50 dark:bg-blue-950" : "border-teal-300 bg-teal-50 animate-packet-pulse dark:bg-teal-950"
              }`}
              style={{ left: pos }}
            >
              bytes
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={tab === "echo" ? runEcho : tab === "chat" ? runChat : runFile}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {busy ? "Running…" : "Run flow"}
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Output</h3>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
          {log.length === 0 && <li className="text-neutral-400">Run flow for this mode.</li>}
          {log.map((line, i) => (
            <li key={`${String(i)}-${line.slice(0, 18)}`} className="border-l-2 border-neutral-200 pl-2 dark:border-neutral-600">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
