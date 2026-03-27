/**
 * Sample commands and representative output for Docs pages.
 * Output may be abbreviated with "…" for long traces.
 */

export type SampleIoBlock = {
  title: string;
  /** Shell commands, prompts, or setup steps */
  input: string;
  /** What you should see (stdout / notes) */
  output: string;
};

const SAMPLE_IO: Record<number, SampleIoBlock[]> = {
  1: [
    {
      title: "Part A — Stop-and-wait (console)",
      input: `cd experiments
python3 arq_protocols.py stop-wait --frames 2`,
      output: `=== Stop-and-Wait ARQ (ideal channel) ===

  SETUP    | Transmit 2 DATA frames; Stop-and-Wait; seq space size = 2
  SENDER   | Transmit DATA(0) [frame 1/2]
  …
  DONE     | All frames acknowledged; link was idle between consecutive DATAs`,
    },
    {
      title: "Part B — Sliding window",
      input: `python3 arq_protocols.py sliding --frames 6 --window 3`,
      output: `(Printed timeline: multiple DATA in flight, cumulative ACK slides send window.)`,
    },
  ],
  2: [
    {
      title: "TCP echo — server then client",
      input: `# Terminal 1
python3 experiments/socket_client_server.py server --host 0.0.0.0 --port 9000

# Terminal 2
python3 experiments/socket_client_server.py client --host 127.0.0.1 --port 9000`,
      output: `[SERVER] listening …
[CLIENT] echo: …`,
    },
  ],
  3: [
    {
      title: "ARP / RARP default demo",
      input: `python3 experiments/arp_rarp_sim.py`,
      output: `=== Simulated LAN ===
…
--- ARP: host A resolves gateway ---
  >> BROADCAST  WHO-HAS …
  << UNICAST   IS-AT …`,
    },
    {
      title: "Single ARP query",
      input: `python3 experiments/arp_rarp_sim.py arp A 192.168.1.1`,
      output: `(WHO-HAS / IS-AT exchange for that resolver/target.)`,
    },
  ],
  4: [
    {
      title: "Combined ping + traceroute demo",
      input: `python3 experiments/ping_traceroute_sim.py`,
      output: `=== PING … ===
…
=== TRACEROUTE … ===
  1  192.168.1.1   … ms`,
    },
    {
      title: "Ping only",
      input: `python3 experiments/ping_traceroute_sim.py ping 8.8.8.8 -c 3`,
      output: `PING 8.8.8.8 …`,
    },
  ],
  5: [
    {
      title: "HTTP GET (needs network)",
      input: `python3 experiments/http_socket_lab.py get https://example.com/`,
      output: `[GET] … bytes, Content-Type: …`,
    },
  ],
  6: [
    {
      title: "XML-RPC server + client",
      input: `python3 experiments/rpc_lab.py server --port 8000
python3 experiments/rpc_lab.py client --port 8000`,
      output: `[RPC] add(40, 2) = 42 …`,
    },
  ],
  7: [
    {
      title: "Subnet calculator",
      input: `python3 experiments/subnetting_lab.py 192.168.1.50/26`,
      output: `Network: 192.168.1.0/26 …`,
    },
  ],
  8: [
    {
      title: "Echo server / client",
      input: `python3 experiments/tcp_applications.py echo-server --port 9100
python3 experiments/tcp_applications.py echo-client --host 127.0.0.1 --port 9100`,
      output: `(Echo loop until script exit.)`,
    },
  ],
  9: [
    {
      title: "Toy DNS (UDP)",
      input: `python3 experiments/udp_tcp_protocol_apps.py dns-server --port 5353
python3 experiments/udp_tcp_protocol_apps.py dns-client --port 5353 example.lab`,
      output: `(ANSWER line printed.)`,
    },
  ],
  10: [
    {
      title: "AIMD-style cwnd table",
      input: `python3 experiments/ns_congestion_sim.py --rounds 12 --rtt 10`,
      output: `RTT(ms)  cwnd(segments)  event …`,
    },
  ],
  11: [
    {
      title: "Routing demo",
      input: `python3 experiments/routing_algorithms_lab.py demo`,
      output: `[FLOODING] … [DISTANCE VECTOR] … [LINK STATE] …`,
    },
  ],
  12: [
    {
      title: "Cable lab (no CLI)",
      input: `T568B both ends; test with cable tester.`,
      output: `(All pairs pass for Gigabit.)`,
    },
  ],
  13: [
    {
      title: "Switch / router",
      input: `Simulator or hardware per lab manual.`,
      output: `Ping across subnets when routing is correct.`,
    },
  ],
  14: [
    {
      title: "CLI examples",
      input: `ping -c 4 8.8.8.8
traceroute example.com`,
      output: `ICMP / path output on your OS.`,
    },
  ],
  15: [
    {
      title: "tcpdump → pcap",
      input: `sudo tcpdump -i any -n icmp -w ping.pcap`,
      output: `(Open in Wireshark.)`,
    },
  ],
  16: [
    {
      title: "Simulator coursework",
      input: `Packet Tracer / NS-3 per institute guide.`,
      output: `(Topology screenshot + trace.)`,
    },
  ],
  17: [
    {
      title: "Day/time + echo servers",
      input: `python3 experiments/socket_programming_recap.py time-server --port 9900
python3 experiments/socket_programming_recap.py echo-server-threaded --port 9910`,
      output: `(Client commands in Exp 17 procedure.)`,
    },
  ],
};

export function getSampleIo(experimentId: number): SampleIoBlock[] {
  return SAMPLE_IO[experimentId] ?? [];
}
