"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MS = 520;
const GAP = 200;

type Tab = "dns" | "snmp" | "file";

type Leg = "idle" | "out" | "in";

function xPos(leg: Leg, motion: boolean): string {
  const L = "14%";
  const R = "86%";
  if (leg === "idle") return L;
  if (leg === "out") return motion ? R : L;
  return motion ? L : R;
}

export function UdpProtocolsLab() {
  const [tab, setTab] = useState<Tab>("dns");
  const [busy, setBusy] = useState(false);
  const [leg, setLeg] = useState<Leg>("idle");
  const [motion, setMotion] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [fileStep, setFileStep] = useState(0);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const push = useCallback((line: string) => {
    setLog((prev) => [...prev.slice(-18), line]);
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
      }, MS)
    );
    timers.current.push(
      window.setTimeout(() => {
        setMotion(false);
        setLeg("idle");
        after();
      }, MS * 2 + GAP)
    );
  };

  const runDns = () => {
    if (busy) return;
    clearTimers();
    setBusy(true);
    setLog([]);
    push("[DNS*] UDP :5353 (text demo, not RFC1035)");
    timers.current.push(
      window.setTimeout(() => {
        trip(() => {
          push("[CLIENT] sendto('example.lab')");
          push("[SERVER] ANSWER example.lab A 203.0.113.10");
          setBusy(false);
        });
      }, 100)
    );
  };

  const runSnmp = () => {
    if (busy) return;
    clearTimers();
    setBusy(true);
    setLog([]);
    push("[SNMP*] UDP :1161 (text demo, not BER)");
    timers.current.push(
      window.setTimeout(() => {
        trip(() => {
          push("[MANAGER] sendto OID 1.3.6.1.2.1.1.1.0");
          push("[AGENT] 1.3.6.1.2.1.1.1.0 = Lab Simulated Device");
          setBusy(false);
        });
      }, 100)
    );
  };

  const runFile = () => {
    if (busy) return;
    clearTimers();
    setBusy(true);
    setLog([]);
    setFileStep(0);
    push("[UDP FILE] seq|LAST|payload ... stop-and-wait ACK per chunk");
    let n = 0;
    const next = () => {
      n += 1;
      setFileStep(n);
      push(`[SEND] datagram seq=${n - 1} last=${n === 3 ? 1 : 0}`);
      push(`[RECV] ACK seq=${n - 1}`);
      if (n < 3) timers.current.push(window.setTimeout(next, 450));
      else {
        timers.current.push(
          window.setTimeout(() => {
            push("[UDP FILE] recv wrote out.bin");
            setFileStep(0);
            setBusy(false);
          }, 300)
        );
      }
    };
    timers.current.push(window.setTimeout(next, 150));
  };

  const left = tab === "dns" ? "Resolver" : tab === "snmp" ? "Manager" : "file-send";
  const right = tab === "dns" ? "DNS* server" : tab === "snmp" ? "Agent" : "file-recv";
  const label = tab === "dns" ? "UDP" : tab === "snmp" ? "SNMP" : "DG";

  return (
    <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-8">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["dns", "DNS*"] as const,
            ["snmp", "SNMP*"] as const,
            ["file", "UDP file"] as const,
          ] as const
        ).map(([k, lab]) => (
          <button
            key={k}
            type="button"
            disabled={busy}
            onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === k ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-900"
            } disabled:opacity-50`}
          >
            {lab}
          </button>
        ))}
      </div>

      <div className="min-w-0 overflow-x-auto rounded-2xl border border-neutral-200 bg-amber-50/40 p-4 dark:border-neutral-700 dark:bg-amber-950/20 [-webkit-overflow-scrolling:touch] sm:p-5 md:p-6">
        <div className="relative mb-6 min-h-[6rem] min-w-[260px]">
          <div className="absolute left-[10%] right-[10%] top-[2rem] border-t-2 border-dashed border-amber-400/80 dark:border-amber-700" />
          {tab === "file" && (
            <div className="absolute bottom-0 left-[10%] right-[10%] flex justify-center gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-12 rounded-full transition-colors ${fileStep >= s ? "bg-amber-500" : "bg-neutral-200 dark:bg-neutral-700"}`}
                />
              ))}
            </div>
          )}
          <div className="relative flex justify-between pt-1">
            <div className="rounded-lg border-2 border-amber-700 bg-white px-2 py-2 text-center text-[10px] font-semibold dark:border-amber-500 dark:bg-neutral-950">
              {left}
            </div>
            <div className="rounded-lg border-2 border-amber-700 bg-white px-2 py-2 text-center text-[10px] font-semibold dark:border-amber-500 dark:bg-neutral-950">
              {right}
            </div>
          </div>
          {leg !== "idle" && tab !== "file" && (
            <div
              className={`pointer-events-none absolute top-12 z-10 -translate-x-1/2 rounded-md border-2 border-amber-600 bg-amber-100 px-2 py-0.5 font-mono text-[9px] font-bold shadow transition-[left] duration-500 ease-out dark:border-amber-400 dark:bg-amber-950 ${
                leg === "in" ? "animate-packet-pulse" : ""
              }`}
              style={{ left: xPos(leg, motion) }}
            >
              {label}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={tab === "dns" ? runDns : tab === "snmp" ? runSnmp : runFile}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {busy ? "Running…" : "Run flow"}
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Output</h3>
        <ul className="mt-3 max-h-52 space-y-1 overflow-y-auto font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
          {log.length === 0 && <li className="text-neutral-400">Run flow.</li>}
          {log.map((line, i) => (
            <li key={`${String(i)}-${line.slice(0, 16)}`} className="border-l-2 border-amber-200 pl-2 dark:border-amber-900">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
