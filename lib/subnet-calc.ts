/** Mirrors experiments/subnetting_lab.py output for IPv4 CIDR (browser). */

export type SubnetAnalysis = {
  network: string;
  prefix: number;
  netmask: string;
  wildcard: string;
  broadcast: string;
  firstHost: string | null;
  lastHost: string | null;
  assignableHosts: number;
  totalAddrs: number;
  error?: string;
};

function ipToNum(s: string): number | null {
  const p = s.split(".").map((x) => parseInt(x.trim(), 10));
  if (p.length !== 4 || p.some((n) => n < 0 || n > 255 || Number.isNaN(n))) return null;
  return (((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0) as number;
}

function numToIp(n: number): string {
  const u = n >>> 0;
  return [(u >>> 24) & 255, (u >>> 16) & 255, (u >>> 8) & 255, u & 255].join(".");
}

export function analyzeCidr(input: string): SubnetAnalysis {
  const trimmed = input.trim();
  const m = trimmed.match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
  if (!m) {
    return {
      network: "",
      prefix: 0,
      netmask: "",
      wildcard: "",
      broadcast: "",
      firstHost: null,
      lastHost: null,
      assignableHosts: 0,
      totalAddrs: 0,
      error: "Use IPv4 CIDR, e.g. 192.168.1.50/26",
    };
  }
  const prefix = parseInt(m[2], 10);
  if (prefix < 0 || prefix > 32) {
    return {
      network: "",
      prefix: 0,
      netmask: "",
      wildcard: "",
      broadcast: "",
      firstHost: null,
      lastHost: null,
      assignableHosts: 0,
      totalAddrs: 0,
      error: "Prefix must be 0–32",
    };
  }
  const addrNum = ipToNum(m[1]);
  if (addrNum === null) {
    return {
      network: "",
      prefix: 0,
      netmask: "",
      wildcard: "",
      broadcast: "",
      firstHost: null,
      lastHost: null,
      assignableHosts: 0,
      totalAddrs: 0,
      error: "Invalid IPv4 address",
    };
  }

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (addrNum & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const wildcard = (~mask >>> 0) >>> 0;
  const totalAddrs = Math.pow(2, 32 - prefix);

  let assignableHosts = 0;
  let firstHost: string | null = null;
  let lastHost: string | null = null;

  if (prefix === 32) {
    assignableHosts = 0;
  } else if (prefix === 31) {
    assignableHosts = 2;
    firstHost = numToIp(network);
    lastHost = numToIp(broadcast);
  } else if (network < broadcast) {
    const first = (network + 1) >>> 0;
    const last = (broadcast - 1) >>> 0;
    if (first <= last) {
      firstHost = numToIp(first);
      lastHost = numToIp(last);
      assignableHosts = last - first + 1;
    }
  }

  return {
    network: `${numToIp(network)}/${prefix}`,
    prefix,
    netmask: numToIp(mask),
    wildcard: numToIp(wildcard),
    broadcast: numToIp(broadcast),
    firstHost,
    lastHost,
    assignableHosts,
    totalAddrs,
  };
}
