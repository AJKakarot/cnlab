"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase =
  | "idle"
  | "handshake"
  | "payload_to_server"
  | "server_processing"
  | "echo_to_client"
  | "done";

const HANDSHAKE_MS = 380;
const TRAVEL_MS = 1200;
const PAUSE_SERVER_MS = 450;

export function TcpEchoLab() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [input, setInput] = useState("Hello, TCP!");
  const [payload, setPayload] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [handshakeStep, setHandshakeStep] = useState(0);
  const [payloadMoving, setPayloadMoving] = useState(false);
  const [echoMoving, setEchoMoving] = useState(false);
  const timers = useRef<number[]>([]);

  const pushLog = useCallback((line: string) => {
    setLog((prev) => [...prev.slice(-16), line]);
  }, []);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const busy = phase !== "idle" && phase !== "done";

  const runSequence = useCallback(
    (text: string) => {
      const line = text.trim() || "(empty line)";
      clearTimers();
      setPayloadMoving(false);
      setEchoMoving(false);
      setPayload(line.length > 40 ? `${line.slice(0, 37)}…` : line);
      setPhase("handshake");
      setHandshakeStep(0);
      setConnected(false);
      pushLog("[CLIENT] socket(), connect(server:9000)…");

      const hs1 = window.setTimeout(() => {
        setHandshakeStep(1);
        pushLog("[WIRE]  SYN  ————————————————>");
      }, 80);
      timers.current.push(hs1);

      const hs2 = window.setTimeout(() => {
        setHandshakeStep(2);
        pushLog("[WIRE]  <————————————————  SYN-ACK");
      }, HANDSHAKE_MS * 0.55);
      timers.current.push(hs2);

      const hs3 = window.setTimeout(() => {
        setHandshakeStep(3);
        pushLog("[WIRE]  ACK  ————————————————>");
        setConnected(true);
      }, HANDSHAKE_MS * 1.1);
      timers.current.push(hs3);

      const afterHs = window.setTimeout(() => {
        setPhase("payload_to_server");
        setPayloadMoving(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setPayloadMoving(true));
        });
        pushLog(`[CLIENT] sendall(${JSON.stringify(line.slice(0, 32) + (line.length > 32 ? "…" : ""))})`);
      }, HANDSHAKE_MS * 1.65);
      timers.current.push(afterHs);

      const atServer = window.setTimeout(() => {
        setPhase("server_processing");
        setPayloadMoving(false);
        pushLog(`[SERVER] recv() → ${JSON.stringify(line.slice(0, 28) + (line.length > 28 ? "…" : ""))}`);
      }, HANDSHAKE_MS * 1.65 + TRAVEL_MS);
      timers.current.push(atServer);

      const echoing = window.setTimeout(() => {
        setPhase("echo_to_client");
        setEchoMoving(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setEchoMoving(true));
        });
        pushLog("[SERVER] sendall(echo) — same bytes");
      }, HANDSHAKE_MS * 1.65 + TRAVEL_MS + PAUSE_SERVER_MS);
      timers.current.push(echoing);

      const atClient = window.setTimeout(() => {
        setPhase("done");
        pushLog("[CLIENT] recv() → echo received ✓");
      }, HANDSHAKE_MS * 1.65 + TRAVEL_MS + PAUSE_SERVER_MS + TRAVEL_MS);
      timers.current.push(atClient);

      const reset = window.setTimeout(() => {
        setPhase("idle");
        setHandshakeStep(0);
        setConnected(false);
        setPayloadMoving(false);
        setEchoMoving(false);
      }, HANDSHAKE_MS * 1.65 + TRAVEL_MS + PAUSE_SERVER_MS + TRAVEL_MS + 900);
      timers.current.push(reset);
    },
    [pushLog]
  );

  useEffect(() => () => clearTimers(), []);

  const serverHot = phase === "server_processing" || phase === "echo_to_client";
  const clientHot = phase === "echo_to_client" || phase === "done";

  const showForward =
    phase === "payload_to_server" || phase === "server_processing" || phase === "echo_to_client" || phase === "done";
  const forwardVisible = phase === "payload_to_server" || phase === "server_processing";

  const showReturn = phase === "echo_to_client" || phase === "done";
  const returnLeaveServer = phase === "echo_to_client" || phase === "done";

  return (
    <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-8">
      <div className="min-w-0 overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-4 [-webkit-overflow-scrolling:touch] dark:border-neutral-700 dark:bg-neutral-900/40 sm:p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <label htmlFor="tcp-echo-msg" className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Message (UTF-8 line)
            </label>
            <input
              id="tcp-echo-msg"
              type="text"
              value={input}
              disabled={busy}
              onChange={(e) => setInput(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm shadow-inner outline-none ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-950 dark:ring-neutral-600"
              placeholder="Type a line…"
              maxLength={200}
            />
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => runSequence(input)}
              className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            >
              Send &amp; animate
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setInput("Demo: echo over TCP");
                runSequence("Demo: echo over TCP");
              }}
              className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-neutral-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              Quick demo
            </button>
          </div>
        </div>

        <div className="flex min-w-[260px] items-start gap-2 md:gap-4">
          <div
            className={`flex w-[5.5rem] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-4 transition-all duration-300 md:w-28 md:py-6 ${
              serverHot
                ? "border-violet-400 bg-white shadow-lg shadow-violet-200/50 ring-2 ring-violet-100 dark:border-violet-500 dark:bg-neutral-950 dark:shadow-violet-950/40 dark:ring-violet-900/50"
                : "border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-950"
            }`}
          >
            <span className="text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400">Server</span>
            <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">
              {connected || phase === "idle" ? (connected ? "ESTAB" : "LISTEN") : "…"}
            </span>
          </div>

          <div className="relative min-h-[128px] min-w-0 flex-1 pt-7">
            <div
              className={`pointer-events-none absolute left-0 right-0 top-[2.25rem] h-2 rounded-full transition-all duration-500 ${
                connected || busy
                  ? "bg-gradient-to-r from-violet-200 via-neutral-100 to-sky-200 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)] dark:from-violet-950 dark:via-neutral-800 dark:to-sky-950"
                  : "bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] dark:bg-neutral-900"
              }`}
            />
            {phase === "handshake" && (
              <div className="pointer-events-none absolute left-[10%] right-[10%] top-8 flex justify-between gap-1">
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                      handshakeStep >= n
                        ? "bg-gradient-to-r from-amber-400 to-orange-400 opacity-100 shadow-[0_0_12px_rgba(251,191,36,0.55)]"
                        : "scale-x-50 bg-neutral-200 opacity-30 dark:bg-neutral-600"
                    }`}
                  />
                ))}
              </div>
            )}

            {showForward && payload && (
              <div
                className={`pointer-events-none absolute top-5 z-20 max-w-[85%] truncate rounded-full border border-sky-300 bg-gradient-to-br from-sky-50 to-blue-100 px-3 py-2 font-mono text-[10px] font-semibold text-sky-950 shadow-md transition-[left,opacity] duration-[1200ms] ease-in-out dark:border-sky-700 dark:from-sky-950 dark:to-blue-950 dark:text-sky-100 ${
                  payloadMoving ? "left-0 animate-packet-pulse" : "left-[calc(100%-11rem)]"
                } ${forwardVisible ? "opacity-100" : "opacity-0"}`}
                title={payload}
              >
                → {payload}
              </div>
            )}

            {showReturn && payload && (
              <div
                className={`pointer-events-none absolute top-[3.6rem] z-20 max-w-[85%] truncate rounded-full border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-100 px-3 py-2 font-mono text-[10px] font-semibold text-emerald-950 shadow-md transition-[left,opacity] duration-[1200ms] ease-in-out dark:border-emerald-700 dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-100 ${
                  echoMoving ? "left-[calc(100%-11rem)] animate-packet-pulse" : "left-0"
                } ${returnLeaveServer ? "opacity-100" : "opacity-0"}`}
                title={payload}
              >
                ← echo
              </div>
            )}
          </div>

          <div
            className={`flex w-[5.5rem] shrink-0 flex-col justify-center gap-1 rounded-xl border-2 px-2 py-4 transition-all duration-300 md:w-28 md:py-6 ${
              clientHot
                ? "border-sky-400 bg-white shadow-lg shadow-sky-200/50 ring-2 ring-sky-100 dark:border-sky-500 dark:bg-neutral-950 dark:shadow-sky-950/40 dark:ring-sky-900/50"
                : "border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-950"
            }`}
          >
            <span className="text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400">Client</span>
            <span className="text-center text-[10px] font-medium text-sky-600 dark:text-sky-400">
              {connected ? "connected" : busy ? "…" : "idle"}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-600 dark:bg-neutral-950">
            <p className="text-xs font-medium text-neutral-500">Client → server (payload)</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-[width] duration-[1200ms] ease-out"
                style={{
                  width:
                    phase === "payload_to_server" && payloadMoving
                      ? "100%"
                      : phase === "server_processing" || phase === "echo_to_client" || phase === "done"
                        ? "100%"
                        : "0%",
                }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-600 dark:bg-neutral-950">
            <p className="text-xs font-medium text-neutral-500">Server → client (echo)</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="ml-auto h-full rounded-full bg-gradient-to-l from-emerald-400 to-teal-600 transition-[width] duration-[1200ms] ease-out"
                style={{
                  width:
                    phase === "echo_to_client" && echoMoving
                      ? "100%"
                      : phase === "done"
                        ? "100%"
                        : "0%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Event log</h3>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {log.length === 0 && (
            <li className="pl-2 text-neutral-400">Press “Send &amp; animate” or “Quick demo” to see the flow.</li>
          )}
          {log.map((line, i) => (
            <li
              key={`${i}-${line.slice(0, 28)}`}
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
