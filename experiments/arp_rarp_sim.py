#!/usr/bin/env python3
"""
Educational simulation of ARP (Address Resolution Protocol) and RARP (Reverse ARP).

ARP:   resolve IPv4 -> MAC on a LAN using broadcast WHO-HAS / unicast IS-AT.
RARP:  resolve MAC -> IPv4 (historically for diskless boot; largely replaced by DHCP/BOOTP).

Usage:
  python3 arp_rarp_sim.py              # run default demo (ARP then RARP)
  python3 arp_rarp_sim.py arp A 192.168.1.1
  python3 arp_rarp_sim.py rarp bb:bb:bb:bb:bb:02

This is a message-flow simulation, not raw Ethernet frames.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


# Simulated hosts on one broadcast domain: name -> (IPv4, MAC)
LAN_HOSTS: Dict[str, Tuple[str, str]] = {
    "A": ("192.168.1.10", "aa:aa:aa:aa:aa:01"),
    "B": ("192.168.1.20", "bb:bb:bb:bb:bb:02"),
    "GW": ("192.168.1.1", "cc:cc:cc:cc:cc:03"),
}


def _mac_for_ip(ip: str) -> Optional[str]:
    for _name, (h_ip, mac) in LAN_HOSTS.items():
        if h_ip == ip:
            return mac
    return None


def _owner_name_for_ip(ip: str) -> Optional[str]:
    for name, (h_ip, _mac) in LAN_HOSTS.items():
        if h_ip == ip:
            return name
    return None


@dataclass
class ArpCache:
    """Per-host IP -> MAC learned entries (simplified, no TTL expiry)."""

    entries: Dict[str, str] = field(default_factory=dict)

    def lookup(self, ip: str) -> Optional[str]:
        return self.entries.get(ip)

    def learn(self, ip: str, mac: str) -> None:
        self.entries[ip] = mac


# One cache per simulated station (by host name)
_CACHES: Dict[str, ArpCache] = {}


def _cache_for(node: str) -> ArpCache:
    if node not in _CACHES:
        _CACHES[node] = ArpCache()
    return _CACHES[node]


def log(lines: List[str], msg: str) -> None:
    lines.append(msg)


def simulate_arp(node: str, target_ip: str) -> List[str]:
    """
    Node wants target_ip's MAC: check cache, else broadcast ARP request, get ARP reply.
    """
    out: List[str] = []
    if node not in LAN_HOSTS:
        log(out, f"[ERR] Unknown host {node!r}. Known: {', '.join(LAN_HOSTS)}")
        return out

    src_ip, src_mac = LAN_HOSTS[node]
    tgt_mac = _mac_for_ip(target_ip)
    if tgt_mac is None:
        log(out, f"[ARP] No host owns {target_ip} on this simulated LAN.")
        return out

    cache = _cache_for(node)
    hit = cache.lookup(target_ip)
    if hit:
        log(out, f"[ARP] {node} ({src_ip}): cache HIT  {target_ip} -> {hit}")
        return out

    log(out, f"[ARP] {node} ({src_ip}): cache MISS for {target_ip}")
    log(
        out,
        f"  >> BROADCAST  WHO-HAS {target_ip}?  TELL {src_ip}  "
        f"(sender MAC {src_mac}, ethertype ARP)",
    )
    owner = _owner_name_for_ip(target_ip)
    assert owner is not None
    log(
        out,
        f"  << UNICAST   IS-AT {target_ip} {tgt_mac}  "
        f"(from {owner}, targetting {node}'s MAC {src_mac})",
    )
    cache.learn(target_ip, tgt_mac)
    log(out, f"[ARP] {node}: installed {target_ip} -> {tgt_mac} in ARP cache")
    return out


def simulate_rarp(requester_mac: str) -> List[str]:
    """
    Diskless-style: station knows only its MAC; RARP server maps MAC -> assigned IPv4.
    """
    out: List[str] = []
    owner: Optional[str] = None
    assigned_ip: Optional[str] = None
    for name, (ip, mac) in LAN_HOSTS.items():
        if mac.lower() == requester_mac.lower():
            owner = name
            assigned_ip = ip
            break

    if owner is None or assigned_ip is None:
        log(out, f"[RARP] Unknown MAC {requester_mac} — not in server's mapping table.")
        return out

    log(out, f"[RARP] Station booting with MAC {requester_mac} only (no IP configured yet).")
    log(
        out,
        "  >> BROADCAST  RARP REQUEST  who-is "
        f"{requester_mac}?  (sender MAC = requester)",
    )
    log(
        out,
        f"  << UNICAST   RARP REPLY  {requester_mac} is {assigned_ip}  "
        f"(from RARP server / {owner})",
    )
    log(out, f"[RARP] Station now configures IPv4 {assigned_ip}")
    return out


def run_demo() -> None:
    print("=== Simulated LAN ===")
    for name, (ip, mac) in LAN_HOSTS.items():
        print(f"  {name:4}  {ip:15}  {mac}")
    print()

    print("--- ARP: host A resolves gateway 192.168.1.1 ---")
    for line in simulate_arp("A", "192.168.1.1"):
        print(line)
    print()
    print("--- ARP again (should hit cache) ---")
    for line in simulate_arp("A", "192.168.1.1"):
        print(line)
    print()
    print("--- RARP: host B learns its IP from MAC bb:bb:bb:bb:bb:02 ---")
    for line in simulate_rarp("bb:bb:bb:bb:bb:02"):
        print(line)


def main(argv: Optional[List[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Simulate ARP / RARP message exchanges")
    sub = p.add_subparsers(dest="cmd", required=False)

    pa = sub.add_parser("arp", help="Simulate ARP resolution from a host to target IP")
    pa.add_argument("node", help=f"Source host name ({', '.join(LAN_HOSTS)})")
    pa.add_argument("target_ip", help="Target IPv4 to resolve")

    pr = sub.add_parser("rarp", help="Simulate RARP reply for a MAC on this LAN")
    pr.add_argument("mac", help="MAC address of requesting station")

    args = p.parse_args(argv)

    if args.cmd is None:
        run_demo()
        return 0
    if args.cmd == "arp":
        for line in simulate_arp(args.node, args.target_ip):
            print(line)
        return 0
    if args.cmd == "rarp":
        for line in simulate_rarp(args.mac):
            print(line)
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
