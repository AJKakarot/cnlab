/** Short label for the "Code" section in manual and Docs. */
export function experimentCodeLabel(expId: number): string {
  const m: Record<number, string> = {
    1: "Full Python script — stop-wait and sliding-window (arq_protocols.py):",
    2: "Full Python script — TCP echo client–server:",
    3: "Full Python script — ARP / RARP simulation:",
    4: "Full Python script — PING / TRACEROUTE simulation:",
    5: "Full Python script — HTTP download/upload:",
    6: "Full Python script — XML-RPC:",
    7: "Full Python script — subnetting:",
    8: "Full Python script — TCP echo, chat, file send:",
    9: "Full Python script — UDP DNS/SNMP/file demos:",
    10: "Full Python script — toy congestion-window trace:",
    11: "Full Python script — flooding / DV / link-state:",
    17: "Full Python — Part A (UDP DNS toy) + Parts B–D (TCP time/echo/servers):",
  };
  return m[expId] ?? "Reference / starter code (plain text):";
}
