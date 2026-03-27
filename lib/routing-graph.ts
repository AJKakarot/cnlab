/** Same topology as experiments/routing_algorithms_lab.py GRAPH */

export const ROUTING_GRAPH: Record<string, [string, number][]> = {
  A: [
    ["B", 2],
    ["C", 5],
  ],
  B: [
    ["A", 2],
    ["C", 1],
    ["D", 4],
  ],
  C: [
    ["A", 5],
    ["B", 1],
    ["D", 1],
  ],
  D: [
    ["B", 4],
    ["C", 1],
  ],
};

export type FloodStep = { hop: number; reached: string[] };

export function floodingSteps(source: string, dest: string): FloodStep[] {
  const seen = new Set<string>();
  const steps: FloodStep[] = [];
  let frontier: string[] = [source];
  let hop = 0;
  while (frontier.length > 0) {
    hop += 1;
    const reached: string[] = [];
    const nxt = new Set<string>();
    for (const u of frontier) {
      if (seen.has(u)) continue;
      seen.add(u);
      reached.push(u);
      for (const [v] of ROUTING_GRAPH[u] ?? []) {
        if (!seen.has(v)) nxt.add(v);
      }
    }
    frontier = Array.from(nxt).sort();
    if (reached.length) steps.push({ hop, reached });
    if (seen.has(dest)) break;
  }
  return steps;
}

export function dijkstraWithOrder(src: string): { visitOrder: string[]; finalDist: Record<string, number> } {
  const dist: Record<string, number> = { [src]: 0 };
  const pq: [number, string][] = [[0, src]];
  const visited = new Set<string>();
  const visitOrder: string[] = [];

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;
    if (visited.has(u)) continue;
    if (d !== dist[u]) continue;
    visited.add(u);
    visitOrder.push(u);
    for (const [v, w] of ROUTING_GRAPH[u] ?? []) {
      const nd = d + w;
      if (nd < (dist[v] ?? 1e9)) {
        dist[v] = nd;
        pq.push([nd, v]);
      }
    }
  }
  return { visitOrder, finalDist: dist };
}

export function distanceVectorFinal(): Record<string, Record<string, number>> {
  const nodes = Object.keys(ROUTING_GRAPH);
  let dist: Record<string, Record<string, number>> = {};
  for (const u of nodes) {
    dist[u] = { [u]: 0 };
    for (const [v, w] of ROUTING_GRAPH[u]) dist[u][v] = w;
  }
  for (let k = 0; k < nodes.length; k += 1) {
    const newd: Record<string, Record<string, number>> = {};
    for (const u of nodes) newd[u] = { ...dist[u] };
    for (const u of nodes) {
      for (const [v, wuv] of ROUTING_GRAPH[u]) {
        for (const dest of Object.keys(dist[v])) {
          const dv = dist[v][dest];
          const cand = wuv + dv;
          if (cand < (newd[u][dest] ?? 1e9)) newd[u][dest] = cand;
        }
      }
    }
    dist = newd;
  }
  return dist;
}

/** Layout coordinates for graph visual (viewBox 0 0 720 280) */
export const NODE_POS: Record<string, { x: number; y: number }> = {
  A: { x: 100, y: 150 },
  B: { x: 300, y: 70 },
  C: { x: 300, y: 230 },
  D: { x: 560, y: 150 },
};
