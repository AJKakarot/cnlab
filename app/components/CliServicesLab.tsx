"use client";

import { useCallback, useState } from "react";

type Tab = "ping" | "trace" | "nslookup" | "arp" | "telnet" | "ftp";

export function CliServicesLab() {
  const [tab, setTab] = useState<Tab>("ping");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const push = useCallback((line: string) => {
    setLog((prev) => [...prev.slice(-22), line]);
  }, []);

  const run = () => {
    setBusy(true);
    setLog([]);
    const finish = () => setBusy(false);

    if (tab === "ping") {
      push("PING 203.0.113.50 (203.0.113.50): 56 data bytes");
      window.setTimeout(() => push("64 bytes from 203.0.113.50: icmp_seq=1 ttl=54 time=18.2 ms"), 80);
      window.setTimeout(() => push("64 bytes from 203.0.113.50: icmp_seq=2 ttl=54 time=17.9 ms"), 160);
      window.setTimeout(() => push("64 bytes from 203.0.113.50: icmp_seq=3 ttl=54 time=18.1 ms"), 240);
      window.setTimeout(() => push("64 bytes from 203.0.113.50: icmp_seq=4 ttl=54 time=18.0 ms"), 320);
      window.setTimeout(() => {
        push("--- 203.0.113.50 ping statistics ---");
        push("4 packets transmitted, 4 received, 0% packet loss");
        finish();
      }, 420);
    } else if (tab === "trace") {
      push("traceroute to lab.example (203.0.113.50), 30 hops max");
      window.setTimeout(() => push(" 1  192.168.1.1  1.234 ms"), 100);
      window.setTimeout(() => push(" 2  10.5.0.1     5.102 ms"), 200);
      window.setTimeout(() => push(" 3  203.0.113.1  11.840 ms"), 300);
      window.setTimeout(() => push(" 4  203.0.113.50 15.205 ms"), 400);
      window.setTimeout(finish, 480);
    } else if (tab === "nslookup") {
      push("> example.lab");
      window.setTimeout(() => {
        push("Server:\t\t127.0.0.1");
        push("Address:\t127.0.0.1#53");
        push("");
        push("Name:\texample.lab");
        push("Address: 203.0.113.10");
        finish();
      }, 120);
    } else if (tab === "arp") {
      push("? (192.168.1.1) at aa:bb:cc:00:00:01 on en0 ifscope [ethernet]");
      push("? (192.168.1.10) at aa:bb:cc:00:00:0a on en0 ifscope [ethernet]");
      push("? (192.168.1.20) at aa:bb:cc:00:00:14 on en0 ifscope [ethernet]");
      push("3 entries — L2↔L3 binding on LAN only");
      window.setTimeout(finish, 80);
    } else if (tab === "telnet") {
      push("Trying 203.0.113.10...");
      window.setTimeout(() => push("Connected to 203.0.113.10."), 150);
      window.setTimeout(() => push("Escape character is '^]'."), 220);
      window.setTimeout(() => {
        push("220 lab ESMTP (simulated — cleartext deprecated for login)");
        finish();
      }, 320);
    } else {
      push("Connected to lab.example.edu.");
      window.setTimeout(() => push("220 Welcome to lab FTP (anonymous OK — demo text)."), 80);
      window.setTimeout(() => push("USER anonymous"), 140);
      window.setTimeout(() => push("331 Guest login OK."), 200);
      window.setTimeout(() => {
        push("230 Login successful.");
        push("--- control channel :21; data :20 active/passive in real FTP ---");
        finish();
      }, 280);
    }
  };

  return (
    <div className="min-w-0 space-y-4 p-3 sm:space-y-6 sm:p-5 md:p-8">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto overflow-y-hidden px-1 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {(
          [
            ["ping", "ping"] as const,
            ["trace", "traceroute"] as const,
            ["nslookup", "nslookup"] as const,
            ["arp", "arp"] as const,
            ["telnet", "telnet"] as const,
            ["ftp", "ftp"] as const,
          ] as const
        ).map(([k, lab]) => (
          <button
            key={k}
            type="button"
            disabled={busy}
            onClick={() => {
              setTab(k);
              setLog([]);
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium sm:shrink sm:text-sm ${
              tab === k ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-900"
            } disabled:opacity-50`}
          >
            {lab}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-4 font-mono text-[11px] text-emerald-400 shadow-inner md:p-5 md:text-xs">
        <div className="mb-2 flex items-center justify-between text-neutral-500">
          <span>terminal (simulated I/O)</span>
          <button
            type="button"
            disabled={busy}
            onClick={run}
            className="rounded-md bg-emerald-900/50 px-2 py-1 text-emerald-200 hover:bg-emerald-800/50 disabled:opacity-40"
          >
            {busy ? "…" : "Run"}
          </button>
        </div>
        <div className="max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
          {log.length === 0 ? <span className="text-neutral-600">Click Run.</span> : log.join("\n")}
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Real CLI: ping -c 4, traceroute, nslookup, arp -a; prefer SSH/SFTP over telnet/FTP on live systems.
      </p>
    </div>
  );
}
