#!/usr/bin/env python3
"""
Experiment 2: TCP socket programming — client–server (echo demo).

Run server (terminal 1):
  python3 socket_client_server.py server --host 0.0.0.0 --port 9000

Run client (terminal 2):
  python3 socket_client_server.py client --host 127.0.0.1 --port 9000

Type a line on the client; server echoes it back until you send an empty line or EOF.
"""

from __future__ import annotations

import argparse
import socket


def run_server(host: str, port: int) -> None:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as srv:
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        srv.bind((host, port))
        srv.listen(1)
        print(f"[SERVER] listening on {host}:{port}")
        conn, addr = srv.accept()
        with conn:
            print(f"[SERVER] connected from {addr}")
            while True:
                data = conn.recv(1024)
                if not data:
                    break
                print(f"[SERVER] received {data!r}")
                conn.sendall(data)
                if data in (b"\n", b"\r\n", b""):
                    break
        print("[SERVER] connection closed")


def run_client(host: str, port: int) -> None:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as cl:
        cl.connect((host, port))
        print(f"[CLIENT] connected to {host}:{port}")
        line = input("[CLIENT] message: ").encode("utf-8") + b"\n"
        cl.sendall(line)
        reply = cl.recv(1024)
        print(f"[CLIENT] echo: {reply.decode('utf-8', errors='replace')!r}")
    print("[CLIENT] done")


def main() -> int:
    p = argparse.ArgumentParser(description="TCP echo client/server")
    sub = p.add_subparsers(dest="role", required=True)

    ps = sub.add_parser("server", help="Listen for one client and echo")
    ps.add_argument("--host", default="127.0.0.1")
    ps.add_argument("--port", type=int, default=9000)

    pc = sub.add_parser("client", help="Send one line and print echo")
    pc.add_argument("--host", default="127.0.0.1")
    pc.add_argument("--port", type=int, default=9000)

    args = p.parse_args()
    if args.role == "server":
        run_server(args.host, args.port)
    else:
        run_client(args.host, args.port)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
