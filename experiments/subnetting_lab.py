#!/usr/bin/env python3
"""
Exp 7: IPv4 subnetting — network address, broadcast, host range, counts (stdlib).

Usage:
  python3 subnetting_lab.py 192.168.1.50/26
  python3 subnetting_lab.py 10.0.0.0/24
"""


from __future__ import annotations

import argparse
import ipaddress


def analyze(cidr: str) -> None:
    net = ipaddress.ip_network(cidr, strict=False)
    hosts = list(net.hosts())
    n_host = len(hosts)
    print(f"Network:     {net.network_address}/{net.prefixlen}")
    print(f"Netmask:     {net.netmask}")
    print(f"Wildcard:    {net.hostmask}")
    print(f"Broadcast:   {net.broadcast_address}")
    if n_host:
        print(f"First host:  {hosts[0]}")
        print(f"Last host:   {hosts[-1]}")
    print(f"Assign. hosts: {n_host}  (excluding net/broadcast on classful view)")
    print(f"Total addrs:   {net.num_addresses}")


def main() -> int:
    p = argparse.ArgumentParser(description="IPv4 CIDR subnet calculator")
    p.add_argument("cidr", help="e.g. 192.168.1.0/24")
    args = p.parse_args()
    try:
        analyze(args.cidr)
    except ValueError as e:
        print("Error:", e)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
