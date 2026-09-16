import type Graph from "graphology";

/**
 * 사각형(블록) 기준 겹침 분리 — 그리드 버킷으로 이웃만 검사, 덜 겹친 축으로 밀기.
 * noverlap 라이브러리는 원형 기준이라 블록이 "접촉" 상태에서 수렴을 멈춰 교체.
 */
export function separateRects(
  graph: Graph,
  { gapX = 100, gapY = 60, maxIter = 2000 }: { gapX?: number; gapY?: number; maxIter?: number } = {},
): void {
  interface N {
    id: string;
    x: number;
    y: number;
    hw: number;
    hh: number;
  }
  const nodes: N[] = [];
  graph.forEachNode((id, a) => {
    // 연결 많은 노드일수록 여유 반경 추가 (√ 곡선) — 허브 주변 빈 공간 확보
    const pad = Math.sqrt(Math.max(0, graph.degree(id) - 2)) * 20;
    nodes.push({
      id,
      x: a.x as number,
      y: a.y as number,
      hw: ((a.blockHalfW as number) ?? 60) + pad,
      hh: ((a.blockHalfH as number) ?? 16) + pad * 0.6,
    });
  });
  const cell = Math.max(400, 200 + gapX + 120); // 최대 충돌 거리(블록 폭 합 + 여백)보다 크게
  const relax = 0.55;
  for (let it = 0; it < maxIter; it++) {
    const grid = new Map<string, number[]>();
    for (let i = 0; i < nodes.length; i++) {
      const key = Math.floor(nodes[i].x / cell) + ":" + Math.floor(nodes[i].y / cell);
      const bucket = grid.get(key);
      if (bucket) bucket.push(i);
      else grid.set(key, [i]);
    }
    let moved = false;
    for (const [key, idxs] of grid) {
      const [gx, gy] = key.split(":").map(Number);
      for (let cx = -1; cx <= 1; cx++) {
        for (let cy = -1; cy <= 1; cy++) {
          const others = grid.get(gx + cx + ":" + (gy + cy));
          if (!others) continue;
          for (const i of idxs) {
            for (const j of others) {
              if (j <= i) continue;
              const a = nodes[i];
              const b = nodes[j];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const px = a.hw + b.hw + gapX - Math.abs(dx);
              const py = a.hh + b.hh + gapY - Math.abs(dy);
              if (px <= 0 || py <= 0) continue;
              moved = true;
              if (px < py) {
                const dir = dx !== 0 ? Math.sign(dx) : (i + j) % 2 ? 1 : -1;
                a.x -= dir * px * relax;
                b.x += dir * px * relax;
              } else {
                const dir = dy !== 0 ? Math.sign(dy) : (i + j) % 2 ? 1 : -1;
                a.y -= dir * py * relax;
                b.y += dir * py * relax;
              }
            }
          }
        }
      }
    }
    if (!moved) break;
  }
  for (const n of nodes) {
    graph.setNodeAttribute(n.id, "x", n.x);
    graph.setNodeAttribute(n.id, "y", n.y);
  }
}
