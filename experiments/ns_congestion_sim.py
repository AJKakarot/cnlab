#!/usr/bin/env python3
"""
Exp 10: Toy simulation of congestion window (AIMD-style) — not real NS-2/NS-3.

Models additive increase on RTT and multiplicative decrease on "loss" events so you can
relate the printed table to TCP Reno ideas. For real NS labs use ns2/ns3 scripts separately.

Usage:
  python3 ns_congestion_sim.py
  python3 ns_congestion_sim.py --rtt 10 --rounds 40
"""

from __future__ import annotations

import argparse


def run_aimd(ssthresh: float, rounds: int, rtt_ms: int) -> None:
    cwnd = 2.0
    print("RTT(ms)  cwnd(segments)  event")
    for r in range(1, rounds + 1):
        event = "AI +1/cwnd"
        if cwnd >= ssthresh * 1.2 and r % 11 == 0:
            ssthresh = cwnd / 2.0
            cwnd = max(1.0, cwnd * 0.5)
            event = f"MD loss -> ssthresh={ssthresh:.1f}"
        else:
            cwnd += 1.0 / max(cwnd, 1e-6)
        print(f"{r * rtt_ms:4}     {cwnd:8.3f}        {event}")
    print("\nNote: Real NS-2/NS-3 use discrete-event sim + queue models; this table is pedagogical only.")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rtt", type=int, default=10, help="RTT in ms per row step (label only)")
    ap.add_argument("--rounds", type=int, default=35)
    ap.add_argument("--ssthresh", type=float, default=16.0)
    args = ap.parse_args()
    run_aimd(args.ssthresh, args.rounds, args.rtt)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
