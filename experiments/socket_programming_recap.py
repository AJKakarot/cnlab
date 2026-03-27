#!/usr/bin/env python3
"""
Experiment 17 recap: TCP sockets — day/time server, iterative vs threaded echo.

Terminal A (time server):
  python3 socket_programming_recap.py time-server --port 9900
Terminal B:
  python3 socket_programming_recap.py time-client --port 9900

Iterative echo (one client at a time):
  python3 socket_programming_recap.py echo-server --port 9911
Threaded echo (many clients):
  python3 socket_programming_recap.py echo-server-threaded --port 9910
Client (any echo server):
  python3 socket_programming_recap.py echo-client --port 9910
"""

from __future__ import annotations

import argparse
import socket
import sys
import threading
from datetime import datetime, timezone


def _send_time(conn: socket.socket) -> None:
    line = datetime.now(timezone.utc).strftime("%a %b %d %H:%M:%S %Y UTC\n").encode("utf-8")
    conn.sendall(line)


def run_time_server(host: str, port: int) -> None:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as srv:
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        srv.bind((host, port))
        srv.listen(5)
        print(f"[TIME SERVER] listening on {host}:{port} (one response per connect)")
        while True:
            conn, addr = srv.accept()
            with conn:
                print(f"[TIME SERVER] peer {addr}")
                _send_time(conn)


def run_time_client(host: str, port: int) -> None:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as cl:
        cl.connect((host, port))
        data = cl.recv(4096)
        print("[TIME CLIENT]", data.decode("utf-8", errors="replace"), end="")


def _echo_handle(conn: socket.socket, peer: str, label: str) -> None:
    with conn:
        print(f"{label} handling {peer}")
        while True:
            chunk = conn.recv(4096)
            if not chunk:
                break
            conn.sendall(chunk)


def run_echo_server_iterative(host: str, port: int) -> None:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as srv:
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        srv.bind((host, port))
        srv.listen(1)
        print(f"[ECHO iter] {host}:{port} — one client at a time")
        while True:
            conn, addr = srv.accept()
            _echo_handle(conn, str(addr), "[ECHO iter]")


def run_echo_server_threaded(host: str, port: int) -> None:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as srv:
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        srv.bind((host, port))
        srv.listen(16)
        print(f"[ECHO threaded] {host}:{port}")
        while True:
            conn, addr = srv.accept()
            t = threading.Thread(
                target=_echo_handle,
                args=(conn, str(addr), "[ECHO threaded]"),
                daemon=True,
            )
            t.start()


def run_echo_client(host: str, port: int) -> None:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as cl:
        cl.connect((host, port))
        print(f"[ECHO CLIENT] connected to {host}:{port} — type lines, empty line to quit")
        try:
            for line in sys.stdin:
                if line == "\n" or line == "\r\n":
                    break
                cl.sendall(line.encode("utf-8"))
                reply = cl.recv(4096)
                if not reply:
                    break
                sys.stdout.write(reply.decode("utf-8", errors="replace"))
        except BrokenPipeError:
            pass


def main() -> int:
    p = argparse.ArgumentParser(description="TCP day/time and echo — iterative vs threaded servers")
    sub = p.add_subparsers(dest="cmd", required=True)

    ts = sub.add_parser("time-server", help="Send one UTC timestamp line per accepted connection")
    ts.add_argument("--host", default="0.0.0.0")
    ts.add_argument("--port", type=int, default=9900)

    tc = sub.add_parser("time-client", help="Connect once and print the time line")
    tc.add_argument("--host", default="127.0.0.1")
    tc.add_argument("--port", type=int, default=9900)

    ei = sub.add_parser("echo-server", help="Iterative echo server (backlog 1)")
    ei.add_argument("--host", default="0.0.0.0")
    ei.add_argument("--port", type=int, default=9911)

    et = sub.add_parser("echo-server-threaded", help="Concurrent echo (thread per connection)")
    et.add_argument("--host", default="0.0.0.0")
    et.add_argument("--port", type=int, default=9910)

    ec = sub.add_parser("echo-client", help="Line-at-a-time echo client")
    ec.add_argument("--host", default="127.0.0.1")
    ec.add_argument("--port", type=int, default=9910)

    args = p.parse_args()
    if args.cmd == "time-server":
        run_time_server(args.host, args.port)
    elif args.cmd == "time-client":
        run_time_client(args.host, args.port)
    elif args.cmd == "echo-server":
        run_echo_server_iterative(args.host, args.port)
    elif args.cmd == "echo-server-threaded":
        run_echo_server_threaded(args.host, args.port)
    else:
        run_echo_client(args.host, args.port)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
