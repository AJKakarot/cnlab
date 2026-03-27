#!/usr/bin/env python3
"""
Experiment: Simulation of Stop-and-Wait ARQ and Sliding Window (Go-Back-N style).
Computer Network Lab — stdlib only; run from terminal (no GUI).

Usage:
  python arq_protocols.py stop-wait --frames 4
  python arq_protocols.py sliding --frames 8 --window 3
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class LogLine:
    tag: str
    detail: str


def log(lines: List[LogLine], tag: str, detail: str) -> None:
    lines.append(LogLine(tag=tag, detail=detail))


def print_lines(lines: List[LogLine]) -> None:
    w = max(len(x.tag) for x in lines) if lines else 0
    for x in lines:
        print(f"  {x.tag.ljust(w)} | {x.detail}")


def simulate_stop_and_wait(frames_to_send: int) -> List[LogLine]:
    """
    Alternating-bit Stop-and-Wait: one outstanding frame; seq in {0,1}.
    Ideal channel: no loss, no corruption.
    """
    lines: List[LogLine] = []
    seq = 0
    log(lines, "SETUP", f"Transmit {frames_to_send} DATA frames; Stop-and-Wait; seq space size = 2")

    for k in range(frames_to_send):
        log(lines, "SENDER", f"Transmit DATA({seq}) [frame {k + 1}/{frames_to_send}]")
        log(lines, "CHANNEL", f"DATA({seq}) propagates to receiver")
        log(lines, "RECEIVER", f"Accept DATA({seq}); deliver to upper layer")
        log(lines, "RECEIVER", f"Transmit ACK({seq})")
        log(lines, "CHANNEL", f"ACK({seq}) propagates to sender")
        log(lines, "SENDER", f"Receive ACK({seq}); slide to next frame")
        seq = 1 - seq

    log(lines, "DONE", "All frames acknowledged; link was idle between consecutive DATAs")
    return lines


def simulate_sliding_window_go_back_n(
    total_data_frames: int,
    window_size: int,
) -> List[LogLine]:
    """
    Simplified Go-Back-N style trace: pipelined sends with cumulative ACKs.
    Ideal channel; frames are delivered in order. After each ACK the window may slide
    and new DATA can enter the pipe while older DATA still propagates.
    """
    lines: List[LogLine] = []
    if window_size < 1:
        raise ValueError("window_size must be >= 1")
    if total_data_frames < 1:
        raise ValueError("total_data_frames must be >= 1")

    log(lines, "SETUP", f"Frames: {total_data_frames}, sender window W = {window_size} (pipelining)")

    send_base = 0
    next_seq = 0

    while send_base < total_data_frames:
        while next_seq < send_base + window_size and next_seq < total_data_frames:
            log(
                lines,
                "SENDER",
                f"Transmit DATA({next_seq}) [send_base={send_base}, window covers up to {send_base + window_size - 1}]",
            )
            log(lines, "CHANNEL", f"DATA({next_seq}) on link (may overlap other DATA)")
            next_seq += 1

        log(lines, "RECEIVER", f"Accept DATA({send_base}) in order; deliver to upper layer")
        log(
            lines,
            "RECEIVER",
            f"Transmit cumulative ACK({send_base}) — all through seq {send_base} OK",
        )
        log(lines, "CHANNEL", f"ACK({send_base}) returns to sender")
        send_base += 1
        log(lines, "SENDER", f"ACK moves left edge; send_base -> {send_base}; may send up to {window_size} outstanding")

    log(lines, "DONE", "Several DATA were in flight between ACKs vs one-at-a-time Stop-and-Wait")
    return lines


def main(argv: Optional[List[str]] = None) -> int:
    p = argparse.ArgumentParser(
        description="Simulate Stop-and-Wait and Sliding Window ARQ (console trace)",
    )
    sub = p.add_subparsers(dest="mode", required=True)

    sw = sub.add_parser("stop-wait", help="Stop-and-Wait ARQ trace")
    sw.add_argument("--frames", type=int, default=4, help="Number of DATA frames to deliver")

    sl = sub.add_parser("sliding", help="Sliding window / GBN-style trace")
    sl.add_argument("--frames", type=int, default=8, help="Total DATA frames")
    sl.add_argument("--window", type=int, default=3, help="Sender window size W")

    args = p.parse_args(argv)

    if args.mode == "stop-wait":
        if args.frames < 1:
            print("frames must be >= 1", file=sys.stderr)
            return 1
        print("=== Stop-and-Wait ARQ (ideal channel) ===\n")
        print_lines(simulate_stop_and_wait(args.frames))
        return 0

    if args.mode == "sliding":
        if args.frames < 1 or args.window < 1:
            print("frames and window must be >= 1", file=sys.stderr)
            return 1
        print("=== Sliding window — pipelined send (ideal channel, cumulative ACK) ===\n")
        print_lines(simulate_sliding_window_go_back_n(args.frames, args.window))
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
