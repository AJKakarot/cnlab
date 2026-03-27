#!/usr/bin/env python3
"""
Exp 6: Remote Procedure Call — XML-RPC (Python stdlib).

Terminal 1 — server:
  python3 rpc_lab.py server --port 8000

Terminal 2 — client (add/multiply remote calls):
  python3 rpc_lab.py client --port 8000

XML-RPC maps a function call to HTTP POST with XML payload — good teaching bridge
between sockets and higher-level APIs.
"""

from __future__ import annotations

import argparse
import sys
from xmlrpc.client import ServerProxy
from xmlrpc.server import SimpleXMLRPCServer


def add(a: int, b: int) -> int:
    return a + b


def multiply(a: int, b: int) -> int:
    return a * b


def greet(name: str) -> str:
    return f"Hello, {name} (from RPC server)"


def run_server(host: str, port: int) -> None:
    srv = SimpleXMLRPCServer((host, port), logRequests=True, allow_none=True)
    srv.register_function(add, "add")
    srv.register_function(multiply, "multiply")
    srv.register_function(greet, "greet")
    print(f"[RPC] XML-RPC server at http://{host}:{port}/")
    print("[RPC] Registered: add, multiply, greet")
    srv.serve_forever()


def run_client(host: str, port: int) -> None:
    url = f"http://{host}:{port}/"
    p = ServerProxy(url)
    print(f"[RPC] proxy -> {url}")
    print("[RPC] add(40, 2)     =", p.add(40, 2))
    print("[RPC] multiply(6, 7) =", p.multiply(6, 7))
    print("[RPC] greet('lab')   =", p.greet("lab"))


def main() -> int:
    ap = argparse.ArgumentParser(description="XML-RPC demo")
    sub = ap.add_subparsers(dest="role", required=True)

    s = sub.add_parser("server")
    s.add_argument("--host", default="127.0.0.1")
    s.add_argument("--port", type=int, default=8000)

    c = sub.add_parser("client")
    c.add_argument("--host", default="127.0.0.1")
    c.add_argument("--port", type=int, default=8000)

    args = ap.parse_args()
    if args.role == "server":
        run_server(args.host, args.port)
        return 0
    if args.role == "client":
        try:
            run_client(args.host, args.port)
        except OSError as e:
            print(f"[RPC] {e} — is the server running?", file=sys.stderr)
            return 1
        return 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
