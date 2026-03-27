import { readFile } from "fs/promises";
import path from "path";

/** Files embedded in manual/Docs for experiments that ship a full script. */
export type BundledLabSources = {
  arq: string;
  socketEcho: string;
  arpRarp: string;
  pingTraceroute: string;
  httpSocket: string;
  rpc: string;
  subnetting: string;
  tcpApps: string;
  udpTcpApps: string;
  nsCongestion: string;
  routing: string;
  socketRecap: string;
};

const exp = (...parts: string[]) => path.join(process.cwd(), "experiments", ...parts);

export async function loadBundledLabSources(): Promise<BundledLabSources> {
  const [
    arq,
    socketEcho,
    arpRarp,
    pingTraceroute,
    httpSocket,
    rpc,
    subnetting,
    tcpApps,
    udpTcpApps,
    nsCongestion,
    routing,
    socketRecap,
  ] = await Promise.all([
    readFile(exp("arq_protocols.py"), "utf-8"),
    readFile(exp("socket_client_server.py"), "utf-8"),
    readFile(exp("arp_rarp_sim.py"), "utf-8"),
    readFile(exp("ping_traceroute_sim.py"), "utf-8"),
    readFile(exp("http_socket_lab.py"), "utf-8"),
    readFile(exp("rpc_lab.py"), "utf-8"),
    readFile(exp("subnetting_lab.py"), "utf-8"),
    readFile(exp("tcp_applications.py"), "utf-8"),
    readFile(exp("udp_tcp_protocol_apps.py"), "utf-8"),
    readFile(exp("ns_congestion_sim.py"), "utf-8"),
    readFile(exp("routing_algorithms_lab.py"), "utf-8"),
    readFile(exp("socket_programming_recap.py"), "utf-8"),
  ]);

  return {
    arq,
    socketEcho,
    arpRarp,
    pingTraceroute,
    httpSocket,
    rpc,
    subnetting,
    tcpApps,
    udpTcpApps,
    nsCongestion,
    routing,
    socketRecap,
  };
}
