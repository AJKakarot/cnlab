"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase =
  | "data_go"
  | "data_there"
  | "ack_go"
  | "ack_there";

const D_DATA = 1600;
const D_ACK = 1400;
const D_PAUSE = 450;

export function StopAndWaitLab() {
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("data_go");
  const [dataMoving, setDataMoving] = useState(false);
  const [ackMoving, setAckMoving] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const seq = round % 2;

  const pushLog = useCallback((line: string) => {
    setLog((prev) => [...prev.slice(-14), line]);
  }, []);

  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => {
    if (!running) {
      clearTimers();
      return;
    }

    setPhase("data_go");
    setDataMoving(false);
    setAckMoving(false);
    queueMicrotask(() => requestAnimationFrame(() => setDataMoving(true)));
    pushLog(`Sender sends DATA (${seq})`);

    const t1 = window.setTimeout(() => {
      setPhase("data_there");
      pushLog(`Receiver accepted DATA (${seq})`);
    }, D_DATA);
    timers.current.push(t1);

    const t2 = window.setTimeout(() => {
      setPhase("ack_go");
      setAckMoving(false);
      requestAnimationFrame(() => setAckMoving(true));
      pushLog(`Receiver sends ACK (${seq})`);
    }, D_DATA + D_PAUSE);
    timers.current.push(t2);

    const t3 = window.setTimeout(() => {
      setPhase("ack_there");
      pushLog(`Sender got ACK (${seq}) — next sequence`);
      setRound((r) => r + 1);
    }, D_DATA + D_PAUSE + D_ACK);
    timers.current.push(t3);

    return () => clearTimers();
  }, [running, round, seq, pushLog]);

  const showData =
    phase === "data_go" || phase === "data_there" || (phase === "ack_go" && !ackMoving);
  const showAck = phase === "ack_go" || phase === "ack_there";

  return (
    <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-8">
      <div className="min-w-0 overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-4 [-webkit-overflow-scrolling:touch] sm:p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Frame seq (this round)
            </span>
            <span className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-1 font-mono text-lg font-bold tabular-nums text-neutral-950 shadow-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-50">
              {seq}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm transition active:scale-[0.98] ${
              running
                ? "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
                : "border border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            }`}
          >
            {running ? "Pause" : "Play"}
          </button>
        </div>

        {!running && log.length === 0 ? (
          <p className="mb-2 text-xs text-neutral-500">
            Click Play to run the stop-and-wait DATA and ACK animation; the event log fills as each step runs.
          </p>
        ) : null}

        <div className="flex min-w-[260px] items-start gap-2 md:gap-4">
          <div
            className={`flex w-24 shrink-0 flex-col items-center justify-center rounded-xl border-2 bg-white px-2 py-4 md:w-28 md:py-6 ${
              phase === "ack_there" ? "border-emerald-300 shadow-md ring-2 ring-emerald-100" : "border-neutral-200"
            }`}
          >
            <span className="text-center text-xs font-semibold text-neutral-500">Sender</span>
          </div>

          <div className="relative min-h-[100px] min-w-0 flex-1 pt-6">
            <div className="pointer-events-none absolute left-0 right-0 top-[2.25rem] h-2 rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]" />

            {showData && (
              <div
                className={`pointer-events-none absolute top-5 z-10 flex h-9 min-w-[4.25rem] items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 font-mono text-xs font-bold text-blue-950 shadow-md transition-[left] duration-[1600ms] ease-in-out dark:border-blue-600 dark:bg-blue-950 dark:text-blue-100 ${
                  dataMoving ? "animate-packet-pulse left-[calc(100%-4.5rem)]" : "left-0"
                }`}
              >
                DATA {seq}
              </div>
            )}

            {showAck && (
              <div
                className={`pointer-events-none absolute top-[3.5rem] z-10 flex h-9 min-w-[4.25rem] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 font-mono text-xs font-bold text-emerald-950 shadow-md transition-[right] duration-[1400ms] ease-in-out dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-100 ${
                  ackMoving ? "right-[calc(100%-4.5rem)]" : "right-0"
                }`}
              >
                ACK {seq}
              </div>
            )}
          </div>

          <div
            className={`flex w-24 shrink-0 flex-col items-center justify-center rounded-xl border-2 bg-white px-2 py-4 md:w-28 md:py-6 ${
              phase === "data_there" || phase === "ack_go"
                ? "border-blue-300 shadow-md ring-2 ring-blue-100"
                : "border-neutral-200"
            }`}
          >
            <span className="text-center text-xs font-semibold text-neutral-500">Receiver</span>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            <p className="text-xs font-medium text-neutral-500">Forward (data)</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-[width] duration-[1600ms] ease-out"
                style={{
                  width:
                    phase === "data_go" && !dataMoving
                      ? "0%"
                      : phase === "data_go" && dataMoving
                        ? "100%"
                        : phase === "data_there" || phase === "ack_go" || phase === "ack_there"
                          ? "100%"
                          : "0%",
                }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            <p className="text-xs font-medium text-neutral-500">Reverse (ACK)</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="ml-auto h-full rounded-full bg-gradient-to-l from-emerald-400 to-emerald-600 transition-[width] duration-[1400ms] ease-out"
                style={{
                  width:
                    phase === "ack_go" && !ackMoving
                      ? "0%"
                      : phase === "ack_go" && ackMoving
                        ? "100%"
                        : phase === "ack_there"
                          ? "100%"
                          : "0%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Event log</h3>
        <ul className="mt-3 max-h-44 space-y-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {log.map((line, i) => (
            <li key={`${i}-${line.slice(0, 24)}`} className="animate-log-line border-l-2 border-neutral-200 pl-2 dark:border-neutral-600">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
