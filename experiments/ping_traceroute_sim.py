#!/usr/bin/env python3
"""
Educational simulation of PING (ICMP echo request/reply) and TRACEROUTE (TTL-expired path).

Not raw sockets: prints realistic-looking output so the lab works without root / ICMP caps.

Usage:
  python3 ping_traceroute_sim.py                  # run both demos
  python3 ping_traceroute_sim.py ping             # ICMP echo to default host
  python3 ping_traceroute_sim.py traceroute       # hop-by-hop path
  python3 ping_traceroute_sim.py ping 203.0.113.50
"""

from __future__ import annotations

import argparse
import random
import time
from typing import List, Tuple

# Simulated route: each tuple is (hop_ip, one-way latency ms to NEXT hop segment).
# End host is last; "segment" delay accumulates for RTT and traceroute timings.
DEFAULT_PATH: List[Tuple[str, float]] = [
    ("192.168.1.1", 1.8),      # default gateway
    ("10.5.0.1", 4.2),
    ("203.0.113.1", 6.5),
    ("203.0.113.50", 3.1),     # "destination"
]

KNOWN_DESTS = {
    "example.lab": DEFAULT_PATH,
    "203.0.113.50": DEFAULT_PATH,
    "8.8.8.8": [
        ("192.168.1.1", 1.5),
        ("10.0.0.1", 3.0),
        ("172.16.0.2", 5.0),
        ("8.8.8.8", 4.0),
    ],
}


def path_for(host: str) -> List[Tuple[str, float]]:
    if host in KNOWN_DESTS:
        return KNOWN_DESTS[host]
    return DEFAULT_PATH


def rtt_ms_to_final(path: List[Tuple[str, float]]) -> float:
    return 2.0 * sum(seg for _, seg in path)


def simulate_ping(dest: str, count: int = 4, payload: int = 56) -> None:
    path = path_for(dest)
    final_ip = path[-1][0]
    ttl = max(64 - len(path) + 1, 48)
    base = rtt_ms_to_final(path)

    print(f"PING {dest} ({final_ip}): {payload} data bytes")
    times: List[float] = []
    for seq in range(1, count + 1):
        time.sleep(0.05)  # small pacing so output feels "live"
        jitter = random.uniform(0.94, 1.08)
        ms = base * jitter
        times.append(ms)
        print(
            f"{payload + 8} bytes from {final_ip}: icmp_seq={seq} ttl={ttl} "
            f"time={ms:.1f} ms (simulated)"
        )

    if times:
        avg = sum(times) / len(times)
        print(f"\n--- {dest} ping statistics ---")
        print(f"{count} packets transmitted, {count} received, 0% packet loss, time 0ms")
        print(f"rtt min/avg/max = {min(times):.1f}/{avg:.1f}/{max(times):.1f} ms")


def simulate_traceroute(dest: str, max_hops: int = 16) -> None:
    path = path_for(dest)
    final_ip = path[-1][0]
    psize = 40

    print(f"traceroute to {dest} ({final_ip}), {max_hops} hops max, {psize} byte packets (simulated)")
    cumulative = 0.0

    for hop_idx, (hop_ip, seg_ms) in enumerate(path, start=1):
        if hop_idx > max_hops:
            break
        cumulative += seg_ms * 2.0  # RTT to this hop
        jitter = random.uniform(-0.35, 0.35)
        t = max(0.1, cumulative + jitter)

        if hop_ip == final_ip and hop_idx == len(path):
            print(f" {hop_idx:2}  {hop_ip}  {t:.2f} ms  (ICMP echo reply — destination reached)")
        else:
            print(f" {hop_idx:2}  {hop_ip}  {t:.2f} ms  (ICMP time exceeded — ttl={hop_idx})")


def run_demo() -> None:
    d = "203.0.113.50"
    print("=== PING (ICMP echo request / reply) ===\n")
    simulate_ping(d, count=4)
    print("\n=== TRACEROUTE (successive TTL, ICMP errors from each hop) ===\n")
    simulate_traceroute(d)


def main() -> int:
    p = argparse.ArgumentParser(description="Simulate PING and traceroute output")
    sub = p.add_subparsers(dest="cmd", required=False)

    pp = sub.add_parser("ping", help="Simulated ICMP echo")
    pp.add_argument("host", nargs="?", default="203.0.113.50", help="Destination host/IP label")
    pp.add_argument("-c", "--count", type=int, default=4, dest="count")

    pt = sub.add_parser("traceroute", help="Simulated TTL-based trace")
    pt.add_argument("host", nargs="?", default="203.0.113.50", help="Destination host/IP label")

    args = p.parse_args()

    if args.cmd is None:
        run_demo()
    elif args.cmd == "ping":
        simulate_ping(args.host, count=args.count)
    elif args.cmd == "traceroute":
        simulate_traceroute(args.host)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
