"use client";

import { useEffect, useRef, useState } from "react";

const WINDOW = 3;
const TOTAL_FRAMES = 7;
const FRAME_MS = 650;

type WireItem =
  | { kind: "data"; seq: number; progress: number; lane: number }
  | { kind: "ack"; upto: number; progress: number };

type Keyframe = {
  sendBase: number;
  nextSeq: number;
  windowEnd: number;
  wire: WireItem[];
  rxHighlight: number | null;
  txHighlight: "slide" | "send" | null;
  log: string;
};

function buildTimeline(): Keyframe[] {
  const kf: Keyframe[] = [];
  const add = (k: Keyframe) => kf.push(k);

  add({
    sendBase: 0,
    nextSeq: 0,
    windowEnd: WINDOW - 1,
    wire: [],
    rxHighlight: null,
    txHighlight: null,
    log: `Sender window [0..${WINDOW - 1}] (size ${WINDOW}). Ready to pipeline.`,
  });

  add({
    sendBase: 0,
    nextSeq: 1,
    windowEnd: WINDOW - 1,
    wire: [{ kind: "data", seq: 0, progress: 0.15, lane: 0 }],
    rxHighlight: null,
    txHighlight: "send",
    log: "Send DATA(0) — first slot in window.",
  });
  add({
    sendBase: 0,
    nextSeq: 2,
    windowEnd: WINDOW - 1,
    wire: [
      { kind: "data", seq: 0, progress: 0.45, lane: 0 },
      { kind: "data", seq: 1, progress: 0.18, lane: 1 },
    ],
    rxHighlight: null,
    txHighlight: "send",
    log: "Send DATA(1) while 0 is still on the link (pipelining).",
  });
  add({
    sendBase: 0,
    nextSeq: 3,
    windowEnd: WINDOW - 1,
    wire: [
      { kind: "data", seq: 0, progress: 0.78, lane: 0 },
      { kind: "data", seq: 1, progress: 0.52, lane: 1 },
      { kind: "data", seq: 2, progress: 0.22, lane: 2 },
    ],
    rxHighlight: null,
    txHighlight: "send",
    log: `Send DATA(2) — window full (${WINDOW} frames in flight max).`,
  });
  add({
    sendBase: 0,
    nextSeq: 3,
    windowEnd: WINDOW - 1,
    wire: [
      { kind: "data", seq: 0, progress: 1, lane: 0 },
      { kind: "data", seq: 1, progress: 0.82, lane: 1 },
      { kind: "data", seq: 2, progress: 0.55, lane: 2 },
    ],
    rxHighlight: 0,
    txHighlight: null,
    log: "Receiver gets DATA(0) in order — will cumulative-ACK through 0.",
  });
  add({
    sendBase: 0,
    nextSeq: 3,
    windowEnd: WINDOW - 1,
    wire: [
      { kind: "data", seq: 1, progress: 0.92, lane: 1 },
      { kind: "data", seq: 2, progress: 0.68, lane: 2 },
      { kind: "ack", upto: 0, progress: 0.2 },
    ],
    rxHighlight: null,
    txHighlight: null,
    log: "ACK(0) returns: “got through frame 0.” Sender cannot send new data until window slides.",
  });
  add({
    sendBase: 1,
    nextSeq: 4,
    windowEnd: Math.min(TOTAL_FRAMES - 1, 1 + WINDOW - 1),
    wire: [
      { kind: "data", seq: 1, progress: 1, lane: 1 },
      { kind: "data", seq: 2, progress: 0.88, lane: 2 },
      { kind: "ack", upto: 0, progress: 0.75 },
    ],
    rxHighlight: 1,
    txHighlight: "slide",
    log: "ACK(0) arrived — window slides to [1..3]. Receiver takes DATA(1).",
  });
  add({
    sendBase: 1,
    nextSeq: 4,
    windowEnd: Math.min(TOTAL_FRAMES - 1, 1 + WINDOW - 1),
    wire: [
      { kind: "data", seq: 2, progress: 1, lane: 2 },
      { kind: "data", seq: 3, progress: 0.35, lane: 0 },
      { kind: "ack", upto: 1, progress: 0.25 },
    ],
    rxHighlight: 2,
    txHighlight: "send",
    log: "Send DATA(3) into freed slot. ACK(1) on the way back.",
  });
  add({
    sendBase: 2,
    nextSeq: 5,
    windowEnd: Math.min(TOTAL_FRAMES - 1, 2 + WINDOW - 1),
    wire: [
      { kind: "data", seq: 3, progress: 0.72, lane: 0 },
      { kind: "data", seq: 4, progress: 0.28, lane: 1 },
      { kind: "ack", upto: 2, progress: 0.4 },
    ],
    rxHighlight: null,
    txHighlight: "slide",
    log: "Sliding continues: base=2, new frames enter the window as ACKs advance.",
  });
  add({
    sendBase: 3,
    nextSeq: 6,
    windowEnd: Math.min(TOTAL_FRAMES - 1, 3 + WINDOW - 1),
    wire: [
      { kind: "data", seq: 4, progress: 0.75, lane: 1 },
      { kind: "data", seq: 5, progress: 0.38, lane: 2 },
      { kind: "ack", upto: 3, progress: 0.55 },
    ],
    rxHighlight: null,
    txHighlight: "slide",
    log: `Higher throughput than stop-and-wait: several frames overlap on the channel.`,
  });
  add({
    sendBase: 4,
    nextSeq: 7,
    windowEnd: Math.min(TOTAL_FRAMES - 1, 4 + WINDOW - 1),
    wire: [
      { kind: "data", seq: 5, progress: 0.85, lane: 2 },
      { kind: "data", seq: 6, progress: 0.45, lane: 0 },
      { kind: "ack", upto: 4, progress: 0.65 },
    ],
    rxHighlight: null,
    txHighlight: null,
    log: "Cumulative ACKs move the left edge of the window; seq advances in lockstep.",
  });
  add({
    sendBase: 5,
    nextSeq: 7,
    windowEnd: TOTAL_FRAMES - 1,
    wire: [{ kind: "data", seq: 6, progress: 0.95, lane: 0 }, { kind: "ack", upto: 5, progress: 0.5 }],
    rxHighlight: null,
    txHighlight: "slide",
    log: "Tail of transfer: fewer in-flight frames as stream finishes.",
  });
  add({
    sendBase: 6,
    nextSeq: 7,
    windowEnd: TOTAL_FRAMES - 1,
    wire: [{ kind: "ack", upto: 6, progress: 0.85 }],
    rxHighlight: null,
    txHighlight: "slide",
    log: "Final ACK clears the last outstanding frame — transfer complete.",
  });
  add({
    sendBase: 7,
    nextSeq: 7,
    windowEnd: TOTAL_FRAMES - 1,
    wire: [],
    rxHighlight: null,
    txHighlight: null,
    log: "Looping demo — compare link utilization with Stop-and-Wait.",
  });

  return kf;
}

const TIMELINE = buildTimeline();

export function SlidingWindowLab() {
  const [running, setRunning] = useState(false);
  const [fi, setFi] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const prevRunning = useRef(false);
  const prevFi = useRef<number | null>(null);
  const frame = TIMELINE[fi % TIMELINE.length];

  useEffect(() => {
    const wasRunning = prevRunning.current;
    prevRunning.current = running;

    if (prevFi.current === null && fi === 0 && !running) {
      prevFi.current = 0;
      return;
    }

    const fiChanged = prevFi.current !== fi;
    prevFi.current = fi;

    if (wasRunning && !running) return;
    if (!fiChanged && !(running && !wasRunning && fi === 0)) return;

    const line = TIMELINE[fi % TIMELINE.length].log;
    setLog((prev) => [...prev.slice(-16), line]);
  }, [fi, running]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setFi((i) => i + 1), FRAME_MS);
    return () => window.clearInterval(id);
  }, [running]);

  const numbers = Array.from({ length: TOTAL_FRAMES }, (_, i) => i);

  return (
    <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-8">
      <div className="min-w-0 overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-6 md:p-8 [-webkit-overflow-scrolling:touch]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 text-xs text-neutral-600">
            <span>
              <span className="font-semibold text-neutral-900">send_base:</span> {Math.min(frame.sendBase, TOTAL_FRAMES)}
            </span>
            <span>
              <span className="font-semibold text-neutral-900">next_seq:</span> {Math.min(frame.nextSeq, TOTAL_FRAMES)}
            </span>
            <span>
              <span className="font-semibold text-neutral-900">window:</span> [{frame.sendBase}…{frame.windowEnd}]
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFi((i) => i + 1)}
              className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium shadow-sm transition hover:bg-neutral-50"
            >
              Step
            </button>
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm transition active:scale-[0.98] ${
                running
                  ? "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50"
                  : "border border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
              }`}
            >
              {running ? "Pause" : "Play"}
            </button>
          </div>
        </div>

        <div className="mb-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Sequence space</p>
          <div className="flex min-w-max gap-1.5">
            {numbers.map((n) => {
              const inWindow = n >= frame.sendBase && n <= frame.windowEnd && frame.sendBase < TOTAL_FRAMES;
              const sent = n < frame.nextSeq && n >= 0;
              return (
                <div
                  key={n}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border font-mono text-sm font-bold transition-all duration-500 ${
                    inWindow
                      ? "border-blue-400 bg-blue-50 text-blue-900 shadow-md ring-2 ring-blue-100"
                      : sent
                        ? "border-neutral-200 bg-neutral-100 text-neutral-500"
                        : "border-neutral-200 bg-white text-neutral-400"
                  }`}
                >
                  {n}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-neutral-500">Legend: window · sent</p>
        </div>

        <div className="flex min-w-[260px] items-start gap-2 md:gap-4">
          <div
            className={`flex w-20 shrink-0 flex-col items-center justify-center rounded-xl border-2 bg-white px-1 py-4 md:w-24 ${
              frame.txHighlight === "slide"
                ? "border-violet-400 shadow-md ring-2 ring-violet-100"
                : frame.txHighlight === "send"
                  ? "border-blue-400 ring-2 ring-blue-100"
                  : "border-neutral-200"
            }`}
          >
            <span className="text-center text-[10px] font-semibold uppercase text-neutral-500">Sender</span>
          </div>

          <div className="relative min-h-[120px] min-w-0 flex-1">
            <div className="pointer-events-none absolute left-0 right-0 top-10 h-2 rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]" />
            {frame.wire.map((w, idx) => {
              if (w.kind === "data") {
                const top = 16 + w.lane * 22;
                const leftPct = w.progress * 100;
                return (
                  <div
                    key={`d-${w.seq}-${idx}-${fi}`}
                    className="pointer-events-none absolute z-10 flex h-8 min-w-[3.25rem] items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-2 font-mono text-[11px] font-bold text-blue-900 shadow transition-all duration-700 ease-out animate-packet-pulse"
                    style={{
                      left: `calc(${leftPct}% - ${leftPct * 0.04}rem)`,
                      top,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {w.seq}
                  </div>
                );
              }
              const leftPct = (1 - w.progress) * 100;
              return (
                <div
                  key={`a-${w.upto}-${idx}-${fi}`}
                  className="pointer-events-none absolute z-10 flex h-8 min-w-[3.75rem] items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-2 font-mono text-[11px] font-bold text-violet-900 shadow transition-all duration-700 ease-out"
                  style={{
                    left: `calc(${leftPct}% - ${leftPct * 0.04}rem)`,
                    top: 88,
                    transform: "translateX(-50%)",
                  }}
                >
                  ACK≤{w.upto}
                </div>
              );
            })}
          </div>

          <div
            className={`flex w-20 shrink-0 flex-col items-center justify-center rounded-xl border-2 bg-white px-1 py-4 md:w-24 ${
              frame.rxHighlight != null ? "border-emerald-400 shadow-md ring-2 ring-emerald-100" : "border-neutral-200"
            }`}
          >
            <span className="text-center text-[10px] font-semibold uppercase text-neutral-500">Receiver</span>
            {frame.rxHighlight != null && (
              <span className="mt-1 font-mono text-[10px] text-emerald-700">exp {frame.rxHighlight}</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Timeline</h3>
        <ul className="mt-3 max-h-52 space-y-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-neutral-700">
          {log.map((line, i) => (
            <li key={`${i}-${line.slice(0, 24)}`} className="animate-log-line border-l-2 border-neutral-200 pl-2">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
