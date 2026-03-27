"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Matches experiments/ping_traceroute_sim.py DEFAULT_PATH for 203.0.113.50 */
const PATH_SEGS = [
  { ip: "192.168.1.1", segMs: 1.8 },
  { ip: "10.5.0.1", segMs: 4.2 },
  { ip: "203.0.113.1", segMs: 6.5 },
  { ip: "203.0.113.50", segMs: 3.1 },
] as const;

const NODES = ["You", ...PATH_SEGS.map((p) => p.ip)] as const;

const TRAVEL_MS = 750;
const STEP_PAUSE_MS = 280;

function rttBase(): number {
  return 2 * PATH_SEGS.reduce((s, p) => s + p.segMs, 0);
}

function traceRttToHop(ttl: number): number {
  let c = 0;
  for (let i = 0; i < ttl; i += 1) c += PATH_SEGS[i].segMs * 2;
  return Math.max(0.15, c);
}

type Tab = "ping" | "trace";

type Leg = "idle" | "out" | "in";

function pingLeft(leg: Leg, motion: boolean): string {
  if (leg === "idle") return "0%";
  if (leg === "out") return motion ? "100%" : "0%";
  return motion ? "0%" : "100%";
}

function traceLeft(leg: Leg, motion: boolean, targetIdx: number): string {
  const pct = (100 * targetIdx) / (NODES.length - 1);
  const t = `${pct}%`;
  if (leg === "idle") return "0%";
  if (leg === "out") return motion ? t : "0%";
  return motion ? "0%" : t;
}

export function PingTracerouteLab() {
  const [tab, setTab] = useState<Tab>("ping");
  const [busy, setBusy] = useState(false);

  const [pingLeg, setPingLeg] = useState<Leg>("idle");
  const [pingMotion, setPingMotion] = useState(false);
  const [pingLog, setPingLog] = useState<string[]>([]);

  const [traceHop, setTraceHop] = useState(-1);
  const [traceTtl, setTraceTtl] = useState(0);
  const [traceLeg, setTraceLeg] = useState<Leg>("idle");
  const [traceMotion, setTraceMotion] = useState(false);
  const [traceLog, setTraceLog] = useState<string[]>([]);

  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const pushPing = useCallback((line: string) => {
    setPingLog((prev) => [...prev.slice(-12), line]);
  }, []);

  const pushTrace = useCallback((line: string) => {
    setTraceLog((prev) => [...prev.slice(-14), line]);
  }, []);

  useEffect(() => () => clearTimers(), []);

  const runPing = () => {
    if (busy) return;
    clearTimers();
    setBusy(true);
    setPingLog([]);
    setPingLeg("idle");
    setPingMotion(false);

    const dest = PATH_SEGS[PATH_SEGS.length - 1].ip;
    const payload = 56;
    const ttlVal = Math.max(64 - PATH_SEGS.length + 1, 48);
    const base = rttBase();
    const times: number[] = [];
    pushPing(`PING 203.0.113.50 (${dest}): ${payload} data bytes`);

    const finishStats = () => {
      if (times.length === 0) return;
      const min = Math.min(...times);
      const max = Math.max(...times);
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      pushPing(`--- 203.0.113.50 ping statistics ---`);
      pushPing(`4 packets transmitted, 4 received, 0% packet loss (simulated)`);
      pushPing(`rtt min/avg/max = ${min.toFixed(1)}/${avg.toFixed(1)}/${max.toFixed(1)} ms`);
    };

    const runSeq = (seq: number) => {
      if (seq > 4) {
        setPingLeg("idle");
        setPingMotion(false);
        setBusy(false);
        finishStats();
        return;
      }

      const jitter = 0.94 + Math.random() * 0.14;
      const ms = base * jitter;
      times.push(ms);

      setPingLeg("out");
      setPingMotion(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPingMotion(true));
      });

      const tMid = window.setTimeout(() => {
        setPingMotion(false);
        setPingLeg("in");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setPingMotion(true));
        });
      }, TRAVEL_MS);
      timers.current.push(tMid);

      const tEnd = window.setTimeout(() => {
        setPingMotion(false);
        setPingLeg("idle");
        pushPing(
          `${payload + 8} bytes from ${dest}: icmp_seq=${seq} ttl=${ttlVal} time=${ms.toFixed(1)} ms (simulated)`
        );
        const tNext = window.setTimeout(() => runSeq(seq + 1), 140);
        timers.current.push(tNext);
      }, TRAVEL_MS * 2 + STEP_PAUSE_MS);
      timers.current.push(tEnd);
    };

    const start = window.setTimeout(() => runSeq(1), 80);
    timers.current.push(start);
  };

  const runTrace = () => {
    if (busy) return;
    clearTimers();
    setBusy(true);
    setTraceLog([]);
    setTraceHop(-1);
    setTraceTtl(0);
    setTraceLeg("idle");
    setTraceMotion(false);

    const finalIp = PATH_SEGS[PATH_SEGS.length - 1].ip;
    pushTrace(`traceroute to 203.0.113.50 (${finalIp}), 16 hops max (simulated)`);

    const doHop = (hop: number) => {
      if (hop >= PATH_SEGS.length) {
        setTraceLeg("idle");
        setTraceMotion(false);
        setTraceHop(-1);
        setTraceTtl(0);
        setBusy(false);
        return;
      }

      const ttl = hop + 1;
      const ip = PATH_SEGS[hop].ip;
      const isLast = hop === PATH_SEGS.length - 1;
      const tMs = traceRttToHop(ttl);

      setTraceHop(hop);
      setTraceTtl(ttl);
      setTraceLeg("out");
      setTraceMotion(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTraceMotion(true));
      });

      const tMid = window.setTimeout(() => {
        setTraceMotion(false);
        setTraceLeg("in");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setTraceMotion(true));
        });
      }, TRAVEL_MS);
      timers.current.push(tMid);

      const tEnd = window.setTimeout(() => {
        setTraceMotion(false);
        setTraceLeg("idle");
        if (isLast) {
          pushTrace(
            ` ${String(ttl).padStart(2, " ")}  ${ip}  ${tMs.toFixed(2)} ms  (ICMP echo reply — destination)`
          );
        } else {
          pushTrace(
            ` ${String(ttl).padStart(2, " ")}  ${ip}  ${tMs.toFixed(2)} ms  (ICMP time exceeded — ttl=${ttl})`
          );
        }
        const tNext = window.setTimeout(() => doHop(hop + 1), 420);
        timers.current.push(tNext);
      }, TRAVEL_MS * 2 + STEP_PAUSE_MS);
      timers.current.push(tEnd);
    };

    const start = window.setTimeout(() => doHop(0), 60);
    timers.current.push(start);
  };

  const pingPos = pingLeft(pingLeg, pingMotion);
  const traceTargetIdx = traceHop >= 0 ? traceHop + 1 : 0;
  const tracePos = traceLeft(traceLeg, traceMotion, traceTargetIdx);

  const showPingBubble = tab === "ping" && pingLeg !== "idle";
  const showTraceBubble = tab === "trace" && traceHop >= 0 && traceLeg !== "idle";

  return (
    <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-8">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["ping", "Ping"] as const,
            ["trace", "Traceroute"] as const,
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
            {label}
          </button>
        ))}
      </div>

      <div className="min-w-0 overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/40 [-webkit-overflow-scrolling:touch] sm:p-5 md:p-6">
        <div className="relative mb-14 min-h-[3.5rem] min-w-[280px]">
          <div className="absolute left-[6%] right-[6%] top-7 h-1 rounded-full bg-gradient-to-r from-cyan-200/80 via-neutral-200 to-teal-200/80 dark:from-cyan-900/50 dark:via-neutral-700 dark:to-teal-900/50" />
          <div className="relative flex justify-between gap-1">
            {NODES.map((label, i) => {
              const traceLit =
                tab === "trace" && traceHop >= 0 && traceLeg !== "idle" && i === traceHop + 1;
              const pingLit = tab === "ping" && pingLeg !== "idle" && (i === 0 || i === NODES.length - 1);
              return (
                <div key={`${label}-${String(i)}`} className="flex w-0 flex-1 flex-col items-center">
                  <div
                    className={`z-10 flex max-w-[4.5rem] flex-col items-center rounded-lg border-2 bg-white px-1 py-2 transition-all dark:bg-neutral-950 ${
                      traceLit || pingLit
                        ? "border-cyan-400 shadow-md ring-2 ring-cyan-100 dark:border-cyan-500 dark:ring-cyan-900/40"
                        : "border-neutral-200 dark:border-neutral-600"
                    }`}
                  >
                    <span className="text-center font-mono text-[9px] font-bold leading-tight text-neutral-800 dark:text-neutral-100 md:text-[10px]">
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {showPingBubble && (
            <div
              className={`pointer-events-none absolute top-4 z-20 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-cyan-400 bg-cyan-100 text-[8px] font-bold text-cyan-900 shadow-lg transition-[left] duration-700 ease-in-out dark:border-cyan-500 dark:bg-cyan-950 dark:text-cyan-100 ${
                pingLeg === "in" ? "animate-packet-pulse" : ""
              }`}
              style={{ left: pingPos }}
            >
              ICMP
            </div>
          )}

          {showTraceBubble && (
            <div
              className={`pointer-events-none absolute top-3 z-20 flex -translate-x-1/2 flex-col items-center transition-[left] duration-700 ease-in-out ${
                traceLeg === "in" ? "animate-packet-pulse" : ""
              }`}
              style={{ left: tracePos }}
            >
              <span className="whitespace-nowrap rounded-md border border-amber-300 bg-amber-100 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-950 shadow dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
                TTL={traceTtl}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {tab === "ping" ? (
            <button
              type="button"
              disabled={busy}
              onClick={runPing}
              className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            >
              Run 4 echoes
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={runTrace}
              className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            >
              Run trace
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Output</h3>
        <ul className="mt-3 max-h-52 space-y-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {tab === "ping" ? (
            <>
              {pingLog.length === 0 && (
                <li className="text-neutral-400">Simulated ping output appears here.</li>
              )}
              {pingLog.map((line, i) => (
                <li
                  key={`p-${String(i)}-${line.slice(0, 20)}`}
                  className="animate-log-line border-l-2 border-neutral-200 pl-2 dark:border-neutral-600"
                >
                  {line}
                </li>
              ))}
            </>
          ) : (
            <>
              {traceLog.length === 0 && (
                <li className="text-neutral-400">Simulated traceroute output appears here.</li>
              )}
              {traceLog.map((line, i) => (
                <li
                  key={`t-${String(i)}-${line.slice(0, 20)}`}
                  className="animate-log-line border-l-2 border-neutral-200 pl-2 dark:border-neutral-600"
                >
                  {line}
                </li>
              ))}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
