# Experiment: Stop-and-Wait ARQ and Sliding Window Protocols

**Course:** Computer Networks Laboratory  
**Experiment No.:** ARQ-01  

---

## 1. Aim

1. To study **Stop-and-Wait Automatic Repeat reQuest (ARQ)** and observe the constraint of a **single outstanding frame** on the link.  
2. To study **Sliding Window** flow control with **pipelining** and compare **link utilization** with Stop-and-Wait.  
3. To implement and run a **Python (stdlib)** event trace of both mechanisms on an ideal channel.

---

## 2. Software / Apparatus Required

| Item | Specification |
|------|----------------|
| OS | Linux / macOS / Windows |
| Python | 3.10+ (stdlib only) |
| Browser | For optional web visual (Next.js lab UI) |

**Files in this project:**

- `experiments/arq_protocols.py` — console simulation  
- Web visual: run `npm run dev` in project root  

---

## 3. Theory

### 3.1 Stop-and-Wait ARQ

- The **sender** transmits **one data frame** and starts a **timer**.  
- The **receiver** accepts the frame (if valid) and returns an **ACK** for that frame.  
- The **sender** waits until the ACK arrives before sending the **next** frame.  
- With a **2-bit sequence space** (alternating 0 and 1), duplicate frames caused by **retransmissions** can be detected after **timeouts** or **lost ACKs** in a full ARQ specification.  
- **Throughput** is limited when **propagation delay** is large: the link stays **idle** while waiting for the ACK.

### 3.2 Sliding Window

- The sender maintains a **window** of **W** consecutive sequence numbers it is allowed to transmit **without** yet receiving an ACK.  
- Up to **W** frames may be **in flight** (pipelining).  
- When an **ACK** is received (here: **cumulative** ACK through sequence `k`), the window **slides** forward; new frames may be sent.  
- **Go-Back-N** and **Selective Repeat** differ in receiver buffering and retransmission strategy; this lab uses a **simplified cumulative-ACK** trace for clarity.

---

## 4. Diagrams

### 4.1 Stop-and-Wait (one frame at a time)

```
  SENDER                                        RECEIVER
    |                                               |
    |  --------- DATA(0) --------->               |
    |                                               |
    |  < -------- ACK(0) ----------               |
    |                                               |
    |  --------- DATA(1) --------->               |
    |                                               |
    |  < -------- ACK(1) ----------               |
    v                                               v

  Between successive DATA transmissions the link may be idle
  (waiting for ACK), hence low utilization on long-delay links.
```

### 4.2 Sliding window (W = 3, conceptual)

```
  Sender window X..Z covers seq X,X+1,... while ACKs slide left edge.

      send_base
         |
         v
  ... [ X | X+1 | X+2 ] ...    Several DATA may be on the channel
         \___________/
              W = 3

  Cumulative ACK(k): "through k received"; window advances.
```

---

## 5. Algorithm (Summary)

### Stop-and-Wait

1. Set `seq <- 0`.  
2. For each packet to send: transmit `DATA(seq)`; wait for `ACK(seq)`; `seq <- 1 - seq`.  
3. (Full protocol adds timeout and retransmit on duplicate detection.)

### Sliding window (simplified trace)

1. Maintain `send_base`, `next_seq`, `recv_expect`.  
2. While frames remain: send all allowed frames with `next_seq < send_base + W` and `next_seq < N`.  
3. Receiver accepts `DATA(recv_expect)`, sends cumulative `ACK(recv_expect)`, increments; sender sets `send_base` from ACK.

---

## 6. Procedure

1. Open a terminal in the `experiments` directory (or use full path to the script).  
2. Run Stop-and-Wait trace:  
   `python3 arq_protocols.py stop-wait --frames 4`  
3. Run Sliding window trace:  
   `python3 arq_protocols.py sliding --frames 8 --window 3`  
4. **Optional:** Start the web UI from project root: `npm run dev` — compare **animation** with **console log**.  
5. Record **observations** (idle time vs pipelining, window size effect with `--window`).

---

## 7. Program

See `arq_protocols.py` in the same folder (also referenced in the web “Experiment” section).

---

## 8. Sample Output (abbreviated)

**Stop-and-wait:**

```
=== Stop-and-Wait ARQ (ideal channel) ===

  SETUP   | Transmit 4 DATA frames; Stop-and-Wait; seq space size = 2
  SENDER  | Transmit DATA(0) ...
  ...
```

**Sliding window:**

```
=== Sliding window — pipelined send ...

  SENDER  | Transmit DATA(0) ...
  SENDER  | Transmit DATA(1) ...
  ...
```

---

## 9. Result

Stop-and-Wait keeps at most one unacknowledged frame on the link; Sliding Window with **W > 1** allows **multiple frames in flight**, improving bandwidth-delay product usage on the same ideal channel.

---

## 10. Conclusion

Pipelined sliding window protocols improve **throughput** over Stop-and-Wait on links with **non-negligible propagation delay**, at the cost of **more complex** sender/receiver state and recovery procedures in real networks (loss, reordering).

---

## 11. References

- A. S. Tanenbaum, *Computer Networks* — ARQ, sliding window.  
- J. F. Kurose & K. W. Ross, *Computer Networking* — reliable data transfer.  
- RFC 793 (TCP) — window-based flow control (context).
