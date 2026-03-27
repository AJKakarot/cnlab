#!/usr/bin/env python3
"""
Exp 11: Routing concepts — flooding, distance-vector style Bellman-Ford step, link-state Dijkstra.

Usage:
  python3 routing_algorithms_lab.py demo
  python3 routing_algorithms_lab.py dijkstra
"""

from __future__ import annotations

import argparse
import heapq
from collections import defaultdict
from typing import Dict, List, Set, Tuple

# Undirected weighted graph: node -> [(neighbor, cost)]
GRAPH: Dict[str, List[Tuple[str, int]]] = {
    "A": [("B", 2), ("C", 5)],
    "B": [("A", 2), ("C", 1), ("D", 4)],
    "C": [("A", 5), ("B", 1), ("D", 1)],
    "D": [("B", 4), ("C", 1)],
}


def demo_flooding(source: str, dest: str) -> None:
    print(f"[FLOODING] broadcast from {source}; each node re-floods once (except incoming port).")
    seen: Set[str] = set()
    frontier = {source}
    hop = 0
    while frontier:
        hop += 1
        nxt: Set[str] = set()
        for u in frontier:
            if u in seen:
                continue
            seen.add(u)
            print(f"  hop {hop}: reach {u}")
            for v, _ in GRAPH.get(u, []):
                if v not in seen:
                    nxt.add(v)
        frontier = nxt
        if dest in seen:
            print(f"  destination {dest} reached (redundant copies still propagate in plain flooding).")
            break


def demo_distance_vector() -> None:
    print("[DISTANCE VECTOR] one synchronous Bellman-Ford-style round from each node (toy).")
    nodes = list(GRAPH)
    dist: Dict[str, Dict[str, int]] = {u: {u: 0} for u in nodes}
    for u in nodes:
        for v, w in GRAPH[u]:
            dist[u][v] = w

    for _ in range(len(nodes)):
        newd = {u: dict(dist[u]) for u in nodes}
        for u in nodes:
            for v, wuv in GRAPH[u]:
                for dest, dv in dist[v].items():
                    cand = wuv + dv
                    if cand < newd[u].get(dest, 10**9):
                        newd[u][dest] = cand
        dist = newd

    for u in sorted(nodes):
        row = ", ".join(f"{d}:{dist[u][d]}" for d in sorted(dist[u]))
        print(f"  {u}:  {row}")


def dijkstra_link_state(src: str) -> Dict[str, int]:
    dist = {src: 0}
    pq: List[Tuple[int, str]] = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d != dist[u]:
            continue
        for v, w in GRAPH[u]:
            if d + w < dist.get(v, 10**9):
                dist[v] = d + w
                heapq.heappush(pq, (dist[v], v))
    return dist


def demo_link_state() -> None:
    print("[LINK STATE] run Dijkstra SPF from each node using same topology snapshot:")
    for src in sorted(GRAPH):
        d = dijkstra_link_state(src)
        print(f"  from {src}: {dict(sorted(d.items()))}")


def main() -> int:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=False)

    sub.add_parser("demo")

    sub.add_parser("dijkstra")

    args = p.parse_args()
    if args.cmd is None or args.cmd == "demo":
        demo_flooding("A", "D")
        print()
        demo_distance_vector()
        print()
        demo_link_state()
    elif args.cmd == "dijkstra":
        print(dijkstra_link_state("A"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
