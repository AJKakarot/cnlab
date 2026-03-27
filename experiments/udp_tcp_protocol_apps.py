#!/usr/bin/env python3
"""
Exp 9: TCP vs UDP style apps — toy DNS (UDP), toy SNMP (UDP), file over UDP (chunked).

(d) DNS*: UDP text query -> text answer (not wire-format DNS).
(e) SNMP*: UDP OID string -> toy response (not BER encoding).
(f) File: UDP datagrams with seq + ACK (small files; lab LAN only).

Usage:
  python3 udp_tcp_protocol_apps.py dns-server --port 5353
  python3 udp_tcp_protocol_apps.py dns-client --port 5353 example.lab

  python3 udp_tcp_protocol_apps.py snmp-server --port 1161
  python3 udp_tcp_protocol_apps.py snmp-client --port 1161

  python3 udp_tcp_protocol_apps.py udp-file-recv --port 9400 -o out.bin
  python3 udp_tcp_protocol_apps.py udp-file-send --port 9400 -f README.md
"""

from __future__ import annotations

import argparse
import socket
import struct
import sys

DNS_DB = {"example.lab": "203.0.113.10", "router.local": "192.168.1.1"}


def dns_server(port: int) -> None:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind(("0.0.0.0", port))
    print(f"[DNS*] UDP {port} (text demo, not RFC1035 wire format)")
    while True:
        data, addr = s.recvfrom(2048)
        q = data.decode("utf-8", errors="replace").strip()
        ip = DNS_DB.get(q.lower(), "0.0.0.0")
        s.sendto(f"ANSWER {q} A {ip}".encode(), addr)


def dns_client(port: int, host: str, name: str) -> None:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.settimeout(5)
    s.sendto(name.encode(), (host, port))
    ans, _ = s.recvfrom(2048)
    print("[DNS*]", ans.decode())
    s.close()


SNMP_DB = {
    "1.3.6.1.2.1.1.1.0": "Lab Simulated Device",
    "1.3.6.1.2.1.1.3.0": "12345",
}


def snmp_server(port: int) -> None:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind(("0.0.0.0", port))
    print(f"[SNMP*] UDP {port} (text demo, not SNMP BER)")
    while True:
        data, addr = s.recvfrom(2048)
        oid = data.decode("utf-8", errors="replace").strip()
        val = SNMP_DB.get(oid, "UNKNOWN-OID")
        s.sendto(f"{oid} = {val}".encode(), addr)


def snmp_client(port: int, host: str) -> None:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.settimeout(5)
    oid = "1.3.6.1.2.1.1.1.0"
    s.sendto(oid.encode(), (host, port))
    ans, _ = s.recvfrom(2048)
    print("[SNMP*]", ans.decode())
    s.close()


def udp_file_recv(port: int, out_path: str) -> None:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind(("0.0.0.0", port))
    print(f"[UDP FILE] recv on {port} -> {out_path}")
    expected = 0
    peer = None
    with open(out_path, "wb") as f:
        while True:
            data, addr = s.recvfrom(65507)
            peer = addr
            if len(data) < 5:
                continue
            seq, last = struct.unpack("!IB", data[:5])
            payload = data[5:]
            if seq != expected:
                continue
            f.write(payload)
            s.sendto(struct.pack("!I", seq), addr)
            expected += 1
            if last == 1:
                break
    s.close()
    print("[UDP FILE] recv done")


def udp_file_send(host: str, port: int, path: str) -> None:
    raw = open(path, "rb").read()
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.settimeout(5)
    chunk_size = 1000
    seq = 0
    offset = 0
    while offset < len(raw):
        end = min(offset + chunk_size, len(raw))
        chunk = raw[offset:end]
        offset = end
        is_last = 1 if offset >= len(raw) else 0
        pkt = struct.pack("!IB", seq, is_last) + chunk
        s.sendto(pkt, (host, port))
        ack, _ = s.recvfrom(64)
        (aseq,) = struct.unpack("!I", ack[:4])
        if aseq != seq:
            print("ACK mismatch", file=sys.stderr)
            return
        seq += 1
    s.close()
    print("[UDP FILE] send done")


def main() -> int:
    p = argparse.ArgumentParser(description="UDP DNS/SNMP/file demos")
    sub = p.add_subparsers(dest="cmd", required=True)

    ds = sub.add_parser("dns-server")
    ds.add_argument("--port", type=int, default=5353)

    dc = sub.add_parser("dns-client")
    dc.add_argument("--host", default="127.0.0.1")
    dc.add_argument("--port", type=int, default=5353)
    dc.add_argument("name")

    ss = sub.add_parser("snmp-server")
    ss.add_argument("--port", type=int, default=1161)

    sc = sub.add_parser("snmp-client")
    sc.add_argument("--host", default="127.0.0.1")
    sc.add_argument("--port", type=int, default=1161)

    ur = sub.add_parser("udp-file-recv")
    ur.add_argument("--port", type=int, default=9400)
    ur.add_argument("-o", "--output", required=True)

    us = sub.add_parser("udp-file-send")
    us.add_argument("--host", default="127.0.0.1")
    us.add_argument("--port", type=int, default=9400)
    us.add_argument("-f", "--file", required=True)

    args = p.parse_args()
    if args.cmd == "dns-server":
        dns_server(args.port)
    elif args.cmd == "dns-client":
        dns_client(args.port, args.host, args.name)
    elif args.cmd == "snmp-server":
        snmp_server(args.port)
    elif args.cmd == "snmp-client":
        snmp_client(args.port, args.host)
    elif args.cmd == "udp-file-recv":
        udp_file_recv(args.port, args.output)
    elif args.cmd == "udp-file-send":
        udp_file_send(args.host, args.port, args.file)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
