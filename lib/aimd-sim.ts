/** Mirrors experiments/ns_congestion_sim.py run_aimd(). */

export type AimdRow = { round: number; rttMs: number; cwnd: number; event: string };

export function runAimd(ssthresh: number, rounds: number, rttMs: number): AimdRow[] {
  let cwnd = 2.0;
  let sst = ssthresh;
  const rows: AimdRow[] = [];
  for (let r = 1; r <= rounds; r += 1) {
    let event = "AI +1/cwnd";
    if (cwnd >= sst * 1.2 && r % 11 === 0) {
      sst = cwnd / 2.0;
      cwnd = Math.max(1.0, cwnd * 0.5);
      event = `MD loss -> ssthresh=${sst.toFixed(1)}`;
    } else {
      cwnd += 1.0 / Math.max(cwnd, 1e-6);
    }
    rows.push({ round: r, rttMs: r * rttMs, cwnd, event });
  }
  return rows;
}
