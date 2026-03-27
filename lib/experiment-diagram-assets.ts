/** Public paths under /public — used by Docs “Diagram” section. */

export type DiagramAsset = {
  src: string;
  alt: string;
};

export const EXPERIMENT_DIAGRAM_ASSET: Record<number, DiagramAsset> = {
  1: {
    src: "/docs/diagrams/exp-01-stop-wait.svg",
    alt: "Stop-and-Wait ARQ: sender transmits one DATA frame, waits for ACK, then sends the next; sequence alternates 0 and 1",
  },
  2: {
    src: "/docs/diagrams/exp-02-tcp-sockets.svg",
    alt: "TCP client–server: passive socket bind listen accept on server; active connect send recv on client",
  },
  3: {
    src: "/docs/diagrams/exp-03-arp.svg",
    alt: "ARP: broadcast WHO-HAS for an IPv4 on the LAN; target replies unicast IS-AT with its MAC",
  },
  4: {
    src: "/docs/diagrams/exp-04-ping-traceroute.svg",
    alt: "Ping uses ICMP echo request and reply; traceroute increases TTL so each hop returns time exceeded until the destination",
  },
  5: {
    src: "/docs/diagrams/exp-05-http.svg",
    alt: "HTTP over TCP: GET or POST request line and headers; server responds with status line, headers, and body",
  },
  6: {
    src: "/docs/diagrams/exp-06-rpc.svg",
    alt: "XML-RPC: client encodes method call in XML over HTTP POST; server executes and returns XML response",
  },
  7: {
    src: "/docs/diagrams/exp-07-subnetting.svg",
    alt: "IPv4 CIDR: prefix defines network; host bits identify hosts; broadcast is all-ones in host portion",
  },
  8: {
    src: "/docs/diagrams/exp-08-tcp-apps.svg",
    alt: "TCP applications: echo, line chat, and file transfer use the same byte stream with different message framing",
  },
  9: {
    src: "/docs/diagrams/exp-09-udp-tcp.svg",
    alt: "UDP datagrams are independent messages; this lab uses text toys for DNS-like and SNMP-like exchanges",
  },
  10: {
    src: "/docs/diagrams/exp-10-congestion.svg",
    alt: "Congestion window: additive increase on each RTT and multiplicative decrease after loss (toy AIMD table)",
  },
  11: {
    src: "/docs/diagrams/exp-11-routing.svg",
    alt: "Routing: flooding propagates widely; distance-vector exchanges tables; link-state runs Dijkstra on a topology snapshot",
  },
  12: {
    src: "/docs/diagrams/exp-12-rj45.svg",
    alt: "RJ-45 straight-through cable: T568B pin order for eight conductors in a CAT-5e/CAT-6 plug",
  },
  13: {
    src: "/docs/diagrams/exp-13-lan-l2-l3.svg",
    alt: "LAN: PCs connect to a switch at layer 2; router provides layer 3 subnets and default gateway",
  },
  14: {
    src: "/docs/diagrams/exp-14-cli-services.svg",
    alt: "CLI tools map to layers: ping ICMP, traceroute TTL, nslookup DNS, ARP neighbor cache, telnet/FTP TCP",
  },
  15: {
    src: "/docs/diagrams/exp-15-capture.svg",
    alt: "Packet capture: NIC to pcap file; Wireshark or tcpdump applies filters to inspect protocols",
  },
  16: {
    src: "/docs/diagrams/exp-16-simulation.svg",
    alt: "Network simulators model nodes, links, queues, and apps—export traces or animations for reports",
  },
  17: {
    src: "/docs/diagrams/exp-17-concurrent-server.svg",
    alt: "Concurrent server: accept loop spawns a thread per connection while continuing to listen",
  },
};

export function getDiagramAsset(experimentId: number): DiagramAsset | null {
  return EXPERIMENT_DIAGRAM_ASSET[experimentId] ?? null;
}
