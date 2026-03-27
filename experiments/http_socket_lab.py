#!/usr/bin/env python3
"""
Exp 5: HTTP via sockets (stdlib) — download a web resource and POST upload (small body).

Download (GET):
  python3 http_socket_lab.py get https://example.com/

Upload (POST body to a server you control):
  python3 http_socket_lab.py post 127.0.0.1 8080 /upload myfile.bin

For POST demo, run in another terminal:  python3 -m http.server 8080
(simple http.server only serves GET; for real POST use Flask or the RPC lab server.)
This POST uses raw http.client — your receiver must accept HTTP/1.1 POST.

Uses only stdlib: urllib.request, http.client
"""

from __future__ import annotations

import argparse
import sys
from urllib.parse import urlparse
from urllib.request import Request, urlopen


def cmd_get(url: str, out_path: str | None) -> int:
    req = Request(url, headers={"User-Agent": "NetworkLab-HTTP/1.0"})
    with urlopen(req, timeout=15) as r:
        data = r.read()
        ct = r.headers.get("Content-Type", "")
    print(f"[GET] {url} -> {len(data)} bytes, Content-Type: {ct}")
    if out_path:
        with open(out_path, "wb") as f:
            f.write(data)
        print(f"[GET] saved to {out_path}")
    else:
        preview = data[:500]
        try:
            text = preview.decode("utf-8", errors="replace")
            print("[GET] preview:\n", text[:400], "..." if len(text) > 400 else "")
        except Exception:
            print("[GET] (binary preview omitted)")
    return 0


def cmd_post(host: str, port: int, path: str, file_path: str) -> int:
    import http.client

    with open(file_path, "rb") as f:
        body = f.read()
    conn = http.client.HTTPConnection(host, port, timeout=10)
    headers = {
        "Content-Type": "application/octet-stream",
        "Content-Length": str(len(body)),
    }
    print(f"[POST] {host}:{port}{path}  ({len(body)} bytes from {file_path})")
    try:
        conn.request("POST", path, body=body, headers=headers)
        resp = conn.getresponse()
        out = resp.read(4096)
        print(f"[POST] status {resp.status} {resp.reason!r}")
        print(out.decode("utf-8", errors="replace")[:500])
    except ConnectionRefusedError:
        print("[POST] connection refused — start a server on that port (see docstring).", file=sys.stderr)
        return 1
    finally:
        conn.close()
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description="HTTP GET/POST using stdlib")
    sub = p.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("get", help="GET URL (download)")
    g.add_argument("url")
    g.add_argument("-o", "--output", help="Save body to file")

    po = sub.add_parser("post", help="POST file as body (raw HTTP)")
    po.add_argument("host")
    po.add_argument("port", type=int)
    po.add_argument("path", help="e.g. /upload")
    po.add_argument("file")

    args = p.parse_args()
    if args.cmd == "get":
        return cmd_get(args.url, args.output)
    return cmd_post(args.host, args.port, args.path, args.file)


if __name__ == "__main__":
    raise SystemExit(main())
