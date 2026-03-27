#!/usr/bin/env python3
"""
Exp 8: TCP socket applications — (a) Echo (b) Chat (c) File transfer.

(a) Echo server / client:
    python3 tcp_applications.py echo-server --port 9100
    python3 tcp_applications.py echo-client --port 9100

(b) Chat — line-at-a-time (server echoes to show relay; use two clients with netcat for real chat):
    python3 tcp_applications.py chat-server --port 9101
    python3 tcp_applications.py chat-client --port 9101

(c) File send / receive:
    python3 tcp_applications.py file-recv --port 9102 -o received.dat
    python3 tcp_applications.py file-send --port 9102 -f README.md
"""

from __future__ import annotations

import argparse
import socket
import sys
import threading


def echo_server(port: int) -> None:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(("0.0.0.0", port))
    s.listen(1)
    print(f"[ECHO SERVER] {port}")
    conn, addr = s.accept()
    with conn:
        print(f"[ECHO SERVER] from {addr}")
        while True:
            data = conn.recv(4096)
            if not data:
                break
            conn.sendall(data)
    s.close()


def echo_client(port: int, host: str) -> None:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, port))
    msg = b"Echo client hello\n"
    s.sendall(msg)
    print("[ECHO CLIENT] sent:", msg[:40])
    print("[ECHO CLIENT] recv:", s.recv(4096))
    s.close()


def chat_server(port: int) -> None:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(("0.0.0.0", port))
    s.listen(1)
    print(f"[CHAT SERVER] port {port} — type lines, server prefixes with [relay]")
    conn, addr = s.accept()
    with conn:
        print(f"[CHAT SERVER] peer {addr}")
        while True:
            data = conn.recv(4096)
            if not data:
                break
            line = data.decode("utf-8", errors="replace").strip()
            reply = f"[relay] {line}\n".encode("utf-8")
            conn.sendall(reply)
    s.close()


def chat_client(port: int, host: str) -> None:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, port))
    t = threading.Thread(target=_pump_in, args=(s,), daemon=True)
    t.start()
    try:
        for line in sys.stdin:
            s.sendall(line.encode("utf-8"))
    except BrokenPipeError:
        pass
    s.close()


def _pump_in(sock: socket.socket) -> None:
    while True:
        data = sock.recv(4096)
        if not data:
            break
        sys.stdout.write(data.decode("utf-8", errors="replace"))
        sys.stdout.flush()


def file_recv(port: int, out_path: str) -> None:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(("0.0.0.0", port))
    s.listen(1)
    print(f"[FILE RECV] waiting on {port} -> {out_path}")
    conn, addr = s.accept()
    with conn, open(out_path, "wb") as f:
        print(f"[FILE RECV] from {addr}")
        while True:
            chunk = conn.recv(65536)
            if not chunk:
                break
            f.write(chunk)
    s.close()
    print("[FILE RECV] done")


def file_send(host: str, port: int, path: str) -> None:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, port))
    with open(path, "rb") as f:
        while True:
            chunk = f.read(65536)
            if not chunk:
                break
            s.sendall(chunk)
    s.close()
    print("[FILE SEND] done")


def main() -> int:
    p = argparse.ArgumentParser(description="TCP echo, chat, file transfer")
    sub = p.add_subparsers(dest="cmd", required=True)

    es = sub.add_parser("echo-server")
    es.add_argument("--port", type=int, default=9100)

    ec = sub.add_parser("echo-client")
    ec.add_argument("--host", default="127.0.0.1")
    ec.add_argument("--port", type=int, default=9100)

    cs = sub.add_parser("chat-server")
    cs.add_argument("--port", type=int, default=9101)

    cc = sub.add_parser("chat-client")
    cc.add_argument("--host", default="127.0.0.1")
    cc.add_argument("--port", type=int, default=9101)

    fr = sub.add_parser("file-recv")
    fr.add_argument("--port", type=int, default=9102)
    fr.add_argument("-o", "--output", required=True)

    fs = sub.add_parser("file-send")
    fs.add_argument("--host", default="127.0.0.1")
    fs.add_argument("--port", type=int, default=9102)
    fs.add_argument("-f", "--file", required=True)

    args = p.parse_args()
    if args.cmd == "echo-server":
        echo_server(args.port)
    elif args.cmd == "echo-client":
        echo_client(args.port, args.host)
    elif args.cmd == "chat-server":
        chat_server(args.port)
    elif args.cmd == "chat-client":
        chat_client(args.port, args.host)
    elif args.cmd == "file-recv":
        file_recv(args.port, args.output)
    elif args.cmd == "file-send":
        file_send(args.host, args.port, args.file)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
