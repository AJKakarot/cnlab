import type { BundledLabSources } from "./bundled-lab-sources";

export type VisualKind =
  | "arqcombo"
  | "tcpecho"
  | "pingtrace"
  | "httpsocket"
  | "rpcxml"
  | "subnetting"
  | "tcpapps"
  | "udptoys"
  | "nsaimd"
  | "routingalgo"
  | "rj45crimp"
  | "landevices"
  | "cliservices"
  | "placeholder";

export type Experiment = {
  id: number;
  title: string;
  visual: VisualKind;
  aim: string[];
  theory: string;
  procedure: string[];
  diagram: string;
  code: string;
  result: string;
};

/** BCS653-style list: exactly 17 experiments (syllabus order). */
export const EXPERIMENTS: Experiment[] = [
  {
    id: 1,
    title: "Stop-and-Wait & Sliding Window (ARQ)",
    visual: "arqcombo",
    aim: [
      "Part A — Stop-and-wait ARQ: one outstanding frame, alternating sequence numbers, link idle between DATA and ACK.",
      "Part B — Sliding window: pipeline up to W frames, cumulative ACK, better utilization on long-delay links.",
    ],
    theory:
      "In stop-and-wait the sender transmits one DATA frame and waits for ACK(seq) before the next send. Sliding window allows up to W consecutive unacknowledged frames; cumulative ACK(k) confirms through k and slides the window. Both use a finite sequence space (often 2^n) so duplicate detection works after timeouts.",
    procedure: [
      "Part A — Open the Stop-and-wait tab; run the animation (Pause/Step optional). Console: python3 experiments/arq_protocols.py stop-wait --frames 4",
      "Part B — Open the Sliding window tab; run the visual with Play/Step. Console: python3 experiments/arq_protocols.py sliding --frames 8 --window 3",
      "Compare how many frames are on the wire at once in each mode.",
    ],
    diagram: `Part A — Stop-and-wait:
  SENDER  |-------- DATA(0) -------->|  RECEIVER
          |<------- ACK(0) ----------|

Part B — Sliding window (W=3):
  send_base -> [ 0 | 1 | 2 ]  several DATA may overlap on the channel`,
    code: `# experiments/arq_protocols.py
# stop-wait:  python3 experiments/arq_protocols.py stop-wait --frames 4
# sliding:    python3 experiments/arq_protocols.py sliding --frames 8 --window 3`,
    result: "Pipelining improves throughput when the delay–bandwidth product is large; stop-and-wait is simple but often link-idle.",
  },
  {
    id: 2,
    title: "Socket Programming — Client–Server Model",
    visual: "tcpecho",
    aim: [
      "Study the client–server model and passive (server) vs active (client) sockets.",
      "Implement minimal TCP: bind/listen/accept on the server; connect/send/recv on the client.",
      "Observe byte-stream semantics and (IP, port) addressing.",
    ],
    theory:
      "The server opens a passive socket (bind to a port, listen, accept). The client connects to the server’s address. TCP provides a reliable ordered byte stream; UDP would use datagram sockets without connection setup.",
    procedure: [
      "Use the animation: type a line and Send & animate.",
      "Terminal A: python3 experiments/socket_client_server.py server --port 9000",
      "Terminal B: python3 experiments/socket_client_server.py client --host 127.0.0.1 --port 9000",
    ],
    diagram: `  SERVER: socket → bind → listen → accept → recv/send
  CLIENT: socket → connect → send/recv`,
    code: `# experiments/socket_client_server.py`,
    result: "Request–reply over TCP shows how processes interact across the network via the sockets API.",
  },
  {
    id: 3,
    title: "ARP / RARP — Simulation",
    visual: "placeholder",
    aim: [
      "Walk through broadcast ARP (WHO-HAS) and unicast replies (IS-AT) on one LAN.",
      "Relate to `arp -a` / `ip neigh` from Experiment 14.",
      "Touch RARP as historical MAC→IPv4 lookup (mostly replaced by DHCP).",
    ],
    theory:
      "ARP resolves a next-hop IPv4 to an Ethernet MAC on the local link. RARP inverted the query for diskless boot. This script models message flow, not raw 802.3 frames.",
    procedure: [
      "python3 experiments/arp_rarp_sim.py",
      "python3 experiments/arp_rarp_sim.py arp A 192.168.1.1",
      "python3 experiments/arp_rarp_sim.py rarp bb:bb:bb:bb:bb:02",
    ],
    diagram: `Who-has 192.168.1.1?  ----broadcast---->
                     <----unicast----  192.168.1.1 is at cc:...`,
    code: `# experiments/arp_rarp_sim.py`,
    result: "ARP explains LAN forwarding and neighbor tables on real hosts.",
  },
  {
    id: 4,
    title: "PING & TRACEROUTE (ICMP simulation)",
    visual: "pingtrace",
    aim: [
      "ICMP echo (ping) for reachability and RTT.",
      "Traceroute via increasing IP TTL and Time Exceeded.",
      "Compare with real ping/traceroute on your OS.",
    ],
    theory:
      "Ping uses Echo Request/Reply (types 8/0). Traceroute sends probes with TTL 1, 2, … so each hop returns Time Exceeded until the destination responds. This script prints educational output only.",
    procedure: [
      "Use Ping / Traceroute tabs; run demo.",
      "python3 experiments/ping_traceroute_sim.py",
      "python3 experiments/ping_traceroute_sim.py ping 8.8.8.8 -c 3",
      "python3 experiments/ping_traceroute_sim.py traceroute 203.0.113.50",
    ],
    diagram: `PING: Echo Request → Echo Reply
TRACEROUTE: TTL=1,2,… → Time Exceeded per hop until target`,
    code: `# experiments/ping_traceroute_sim.py`,
    result: "Ping estimates RTT; traceroute reveals logical path (subject to filters and asymmetry).",
  },
  {
    id: 5,
    title: "HTTP — Web Download & Upload (Sockets)",
    visual: "httpsocket",
    aim: [
      "HTTP GET to download a resource.",
      "HTTP POST to upload body data over TCP.",
      "Relate HTTP to TCP byte streams and message formats.",
    ],
    theory: "HTTP/1.1 runs over TCP (or TLS). GET retrieves; POST sends a body. urllib/http.client build requests in the stdlib.",
    procedure: [
      "GET/POST tabs — Run flow.",
      "python3 experiments/http_socket_lab.py get https://example.com/",
      "POST against a lab server: python3 experiments/http_socket_lab.py post HOST PORT /path file.bin",
    ],
    diagram: `GET / HTTP/1.1 ----->  200 OK + body`,
    code: `# experiments/http_socket_lab.py`,
    result: "HTTP layers methods, headers, and payloads on reliable TCP.",
  },
  {
    id: 6,
    title: "Remote Procedure Call (RPC)",
    visual: "rpcxml",
    aim: [
      "Expose server procedures callable like local functions.",
      "Use XML-RPC over HTTP POST with XML payloads.",
      "Note limits: latency, failures, marshalling.",
    ],
    theory:
      "RPC hides messaging behind stubs. XML-RPC encodes calls in XML; gRPC/JSON-RPC follow the same split with different encodings.",
    procedure: [
      "Run calls in the visual; then real server/client.",
      "python3 experiments/rpc_lab.py server --port 8000",
      "python3 experiments/rpc_lab.py client --port 8000",
    ],
    diagram: `Client: proxy.add(2,3)  --HTTP POST XML-->  Server executes`,
    code: `# experiments/rpc_lab.py`,
    result: "Serialization and trust boundaries matter in real RPC systems.",
  },
  {
    id: 7,
    title: "Implementation of Subnetting",
    visual: "subnetting",
    aim: ["Compute network, broadcast, host range from CIDR.", "Plan subnets for given host counts."],
    theory:
      "CIDR /n fixes network bits; the rest are host bits. Use ipaddress.IPv4Network or subnetting_lab.py for checks.",
    procedure: [
      "Use the calculator; verify with python3 experiments/subnetting_lab.py 192.168.1.50/26",
    ],
    diagram: `192.168.1.0/26 → hosts .1–.62, broadcast .63`,
    code: `# experiments/subnetting_lab.py`,
    result: "Subnetting underpins IPv4 addressing and routing.",
  },
  {
    id: 8,
    title: "TCP Socket Apps — Echo, Chat, File Transfer",
    visual: "tcpapps",
    aim: [
      "(a) Echo client/server over TCP.",
      "(b) Line-oriented chat-style relay.",
      "(c) Stream a file over one TCP connection.",
    ],
    theory:
      "TCP is a byte stream; apps delimit messages (newlines, lengths, or FIN). Echo, chat, and file transfer share listen/accept/connect with different loops.",
    procedure: [
      "Echo: python3 experiments/tcp_applications.py echo-server / echo-client",
      "Chat: chat-server then chat-client",
      "File: file-recv -o out.bin  |  file-send -f path",
    ],
    diagram: `(a) echo  (b) chat  (c) file bytes until FIN`,
    code: `# experiments/tcp_applications.py`,
    result: "Common patterns for many TCP applications.",
  },
  {
    id: 9,
    title: "UDP & TCP — DNS-style, SNMP-style, UDP File",
    visual: "udptoys",
    aim: [
      "(d) DNS-like name lookup — toy UDP text (not wire DNS).",
      "(e) SNMP-like query — toy UDP text (not BER).",
      "(f) File over UDP with seq/ACK (lab LAN; small files).",
    ],
    theory:
      "Real DNS/SNMP use binary encodings; this lab uses text datagrams to show request/response. UDP file transfer is simplified for teaching.",
    procedure: [
      "dns-server / dns-client example.lab",
      "snmp-server / snmp-client",
      "udp-file-recv and udp-file-send — see script --help",
    ],
    diagram: `UDP: independent datagrams  vs  TCP: byte stream`,
    code: `# experiments/udp_tcp_protocol_apps.py`,
    result: "Understand roles before studying RFC wire formats.",
  },
  {
    id: 10,
    title: "Network Simulator (NS) & Congestion Control",
    visual: "nsaimd",
    aim: [
      "Relate NS-2/NS-3 style simulation to congestion control.",
      "Study a small AIMD-style cwnd table (Python toy, not NS).",
    ],
    theory:
      "NS models queues, links, TCP variants. This repo includes a cwnd trace for discussion without installing NS.",
    procedure: [
      "Adjust parameters in the visual; run python3 experiments/ns_congestion_sim.py",
      "Course NS labs: follow your institute’s NS-2/NS-3 scripts.",
    ],
    diagram: `Discrete-event sim: nodes, queues, traces
This exp: printed cwnd vs RTT steps`,
    code: `# experiments/ns_congestion_sim.py`,
    result: "Real behaviour needs queue and cross-traffic models.",
  },
  {
    id: 11,
    title: "Routing — Link State, Flooding, Distance Vector",
    visual: "routingalgo",
    aim: [
      "(i) Link-state: Dijkstra SPF.",
      "(ii) Flooding: broadcast duplicates until seen.",
      "(iii) Distance-vector: neighbour table exchanges.",
    ],
    theory:
      "OSPF floods LSAs then runs SPF. RIP-style DV exchanges costs. Flooding is simple but bandwidth-heavy without pruning.",
    procedure: ["python3 experiments/routing_algorithms_lab.py demo"],
    diagram: `LS: topology → Dijkstra   DV: tables per neighbor   Flood: duplicates`,
    code: `# experiments/routing_algorithms_lab.py`,
    result: "Real paths mix policy, metrics, and protocol choice.",
  },
  {
    id: 12,
    title: "Physical Layer — RJ-45, CAT-6 & Crimping",
    visual: "rj45crimp",
    aim: [
      "Handle RJ-45, CAT-5e/CAT-6, crimping tool safely.",
      "Build straight-through T568A or T568B (both ends same).",
      "Test continuity when a tester is available.",
    ],
    theory:
      "Twisted pairs reduce EMI. Category rating defines bandwidth. TIA-568 pinout ensures NIC–switch interoperability.",
    procedure: [
      "T568B checklist in the visual; strip, seat eight wires, crimp, test.",
      "Document colours vs pins in your notebook.",
    ],
    diagram: `T568B: w-o, o, w-g, bl, w-bl, g, w-br, br`,
    code: `Hands-on — no Python.`,
    result: "Correct termination supports reliable Gigabit Ethernet.",
  },
  {
    id: 13,
    title: "LAN Devices — Hub, Switch & Router",
    visual: "landevices",
    aim: [
      "Contrast hub, switch (L2 MAC learning), router (L3 IP).",
      "Configure VLANs, access ports, default gateway in simulator or hardware.",
    ],
    theory:
      "Hub: one collision domain. Switch: per-port learning. Router: ends broadcast domains.",
    procedure: [
      "Visual: hub/switch/router tabs.",
      "Packet Tracer/hardware: small LAN, routing between subnets.",
    ],
    diagram: `PCs — [ Switch ] — [ Router ] — WAN`,
    code: `Vendor/simulator CLI per manual.`,
    result: "L2/L3 placement enables end-to-end IP.",
  },
  {
    id: 14,
    title: "CLI — ping, traceroute, nslookup, arp, telnet, FTP",
    visual: "cliservices",
    aim: [
      "Reachability and path: ping, traceroute/tracert.",
      "DNS: nslookup/dig; ARP/neighbor cache.",
      "Apps: telnet/nc port check; FTP/SFTP per policy.",
    ],
    theory:
      "ICMP, DNS, ARP, and TCP apps at different layers. Prefer SSH/SFTP in production; syllabus still lists telnet/FTP.",
    procedure: [
      "Simulated terminal + real OS commands.",
      "Compare ARP table with Exp 3 simulation.",
      "python3 experiments/ping_traceroute_sim.py",
    ],
    diagram: `ping→ICMP  nslookup→DNS  arp→L2  telnet/FTP→TCP`,
    code: `See procedure; + experiments/ping_traceroute_sim.py`,
    result: "CLI fluency speeds troubleshooting.",
  },
  {
    id: 15,
    title: "Packet Analysis — Wireshark & tcpdump",
    visual: "placeholder",
    aim: ["Capture on an interface.", "Display filters: dns, http, arp.", "Relate fields to lecture headers."],
    theory: "BPF capture filters vs display filters; ethics: capture only where allowed.",
    procedure: [
      "Wireshark: capture, Statistics → Conversations.",
      "tcpdump -w out.pcap then open in Wireshark.",
    ],
    diagram: `NIC → pcap → filters → decode`,
    code: `tcpdump -nn udp port 53`,
    result: "Packets connect theory to on-the-wire reality.",
  },
  {
    id: 16,
    title: "Simulation Tools — Packet Tracer, NetSim, OMNeT++, NS-2, NS-3",
    visual: "placeholder",
    aim: [
      "Use one simulator from your department list.",
      "Build topology; export trace or screenshot.",
      "Relate queues to Exp 10 congestion ideas.",
    ],
    theory: "GUI labs vs research simulators (OMNeT++, NS-2, NS-3).",
    procedure: ["Graded scenario from manual; NS: install per guide."],
    diagram: `GUI topology vs NS-3 nodes/channels`,
    code: `Institute artifacts — no bundled Python.`,
    result: "Simulation extends experiments beyond bench hardware.",
  },
  {
    id: 17,
    title: "Socket Programming — UDP & TCP (Parts A–D)",
    visual: "placeholder",
    aim: [
      "Part A — DNS-style UDP (toy); aligns with Exp 9.",
      "Part B — Date/time TCP client/server.",
      "Part C — Echo TCP.",
      "Part D — Iterative vs concurrent (threaded) echo servers.",
    ],
    theory:
      "UDP datagrams vs TCP streams; iterative accept loop vs thread-per-connection.",
    procedure: [
      "Part A — udp_tcp_protocol_apps.py dns-server / dns-client (see Exp 9).",
      "Part B — socket_programming_recap.py time-server / time-client --port 9900",
      "Part C — recap echo-server-threaded + echo-client --port 9910",
      "Part D — echo-server (9911) vs echo-server-threaded (9910); two clients on threaded only.",
    ],
    diagram: `Part A: UDP  Parts B–D: TCP patterns`,
    code: `# Part A: udp_tcp_protocol_apps.py  Parts B–D: socket_programming_recap.py`,
    result: "Syllabus socket topics in one checklist.",
  },
];

EXPERIMENTS.sort((a, b) => a.id - b.id);

export const MAX_EXPERIMENT_ID = EXPERIMENTS.reduce((m, e) => Math.max(m, e.id), 0);

export function getExperiment(id: number): Experiment | undefined {
  return EXPERIMENTS.find((e) => e.id === id);
}

/** Code shown in manual/Docs: bundled scripts where listed; else catalog snippet. */
export function resolveExperimentCodeSource(exp: Experiment, b: BundledLabSources): string {
  switch (exp.id) {
    case 1:
      return b.arq;
    case 2:
      return b.socketEcho;
    case 3:
      return b.arpRarp;
    case 4:
      return b.pingTraceroute;
    case 5:
      return b.httpSocket;
    case 6:
      return b.rpc;
    case 7:
      return b.subnetting;
    case 8:
      return b.tcpApps;
    case 9:
      return b.udpTcpApps;
    case 10:
      return b.nsCongestion;
    case 11:
      return b.routing;
    case 17:
      return [
        "# --- Part A — toy DNS over UDP (same file as Experiment 9) ---\n",
        b.udpTcpApps,
        "\n\n# --- Parts B, C, D — date/time, echo, iterative vs threaded TCP servers ---\n",
        b.socketRecap,
      ].join("");
    default:
      return exp.code;
  }
}
