import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
} from "d3-force";
import type Graph from "graphology";
import { separateRects } from "./separateRects";

/**
 * 옵시디언식 배치 엔진 — 링크 스프링 + 만유 반발 + 약한 중심 인력 + 블록/링 충돌 반경.
 * d3 내부 자동 스테퍼가 이 환경에서 동작하지 않아, 프레임 루프를 직접 돌린다.
 * 시뮬레이션은 상시 유지: 드래그하면 재가열되어 주변이 출렁이며 재정착.
 */
export interface SimNode extends SimulationNodeDatum {
  id: string;
}

let sim: Simulation<SimNode, undefined> | null = null;
let simNodes: SimNode[] = [];
let simGraph: Graph | null = null;
let byId = new Map<string, SimNode>();
let timer: ReturnType<typeof setTimeout> | null = null;
let running = false;
let alphaTarget = 0;

function writeBack() {
  if (!simGraph) return;
  for (const n of simNodes) {
    simGraph.setNodeAttribute(n.id, "x", n.x as number);
    simGraph.setNodeAttribute(n.id, "y", n.y as number);
  }
}

/** 정착 완료 시 최소 거리 보장 — 블록 실측 + 여백으로 강제 분리 후 시뮬레이션에 동기화 */
function settle() {
  if (!simGraph) return;
  separateRects(simGraph, { gapX: 920, gapY: 580 });
  for (const n of simNodes) {
    n.x = simGraph.getNodeAttribute(n.id, "x") as number;
    n.y = simGraph.getNodeAttribute(n.id, "y") as number;
    if (n.fx != null) n.fx = n.x;
    if (n.fy != null) n.fy = n.y;
  }
}

function startLoop() {
  if (running) return;
  running = true;
  // requestAnimationFrame은 창이 가려지면 Safari가 통째로 멈춤 → 타이머로 구동
  const step = () => {
    if (!sim) {
      running = false;
      return;
    }
    sim.tick();
    writeBack();
    if (sim.alpha() < sim.alphaMin() && alphaTarget < sim.alphaMin()) {
      running = false;
      settle();
      return;
    }
    timer = setTimeout(step, 16);
  };
  timer = setTimeout(step, 16);
}

export function buildSimulation(graph: Graph): void {
  stopSimulation();
  simGraph = graph;
  simNodes = graph.mapNodes((id, a) => {
    const n: SimNode = { id, x: a.x as number, y: a.y as number };
    if (a.pinned) {
      n.fx = a.x as number;
      n.fy = a.y as number;
    }
    return n;
  });
  byId = new Map(simNodes.map((n) => [n.id, n]));
  const links = graph.mapEdges((_e, _a, s, t) => ({ source: s, target: t }));

  // 링 반경 = 자식들이 겹치지 않고 늘어서는 데 필요한 최소 반경.
  // 한 겹으로 세우면 반경이 자식 수에 선형으로 커져(자식 87개 = 반경 6,500px) 허브 하나가
  // 화면을 수십 배로 벗어남 → 한 겹이 RING_GAP 간격의 여러 겹보다 커지면 여러 겹으로 나눠 담는다.
  // 그러면 반경이 √(자식 수)로만 자람. 자식 13개 이하는 예전과 동일(한 겹).
  const ARC_PER_CHILD = 480;
  const RING_GAP = 520; // 동심원 겹 간격
  const CHILD_R = 400; // 대표 자식 충돌 반경 (허브 충돌 반경에서 상쇄)
  const ring = (n: string) => {
    const c = Math.max(0, graph.degree(n) - 1);
    if (c === 0) return 0;
    const oneRing = (c * ARC_PER_CHILD) / (2 * Math.PI); // 한 겹에 다 세울 때
    const packed = Math.sqrt((c * ARC_PER_CHILD * RING_GAP) / Math.PI); // 여러 겹으로 채울 때
    return Math.min(oneRing, packed);
  };

  sim = forceSimulation(simNodes)
    .stop() // 내부 스테퍼 사용 안 함 — 아래 자체 프레임 루프로 구동
    .force(
      "link",
      forceLink<SimNode, { source: string | SimNode; target: string | SimNode }>(links)
        .id((d) => d.id)
        // 두 링 반경의 합 + 기본 간격 — 허브 자식은 딱 링 위에, 허브끼리는 두 영역이 안 겹치게.
        // 자식마다 배율을 엇갈리게(0.82~1.18, 결정적) 줘서 이웃끼리 안쪽/바깥쪽으로 교차 배치
        .distance((l) => {
          const s = typeof l.source === "object" ? l.source.id : l.source;
          const t = typeof l.target === "object" ? l.target.id : l.target;
          const base = ring(s) + ring(t) + 620;
          // 허브-허브는 엇갈림 없이 두 영역 합 그대로
          if (Math.min(graph.degree(s), graph.degree(t)) >= 4) return base;
          const child = graph.degree(s) < graph.degree(t) ? s : t;
          const hub = child === s ? t : s;
          let h = 0;
          for (let i = 0; i < child.length; i++) h = (h * 31 + child.charCodeAt(i)) | 0;
          const hubRing = ring(hub);
          const rings = Math.max(1, Math.round(hubRing / RING_GAP));
          if (rings > 1) {
            // 여러 겹 허브 — 자식을 겹에 흩어 배정. 바깥 겹일수록 자리가 많으므로 √ 분포
            const u = (Math.abs(h) % 997) / 997;
            const k = Math.max(1, Math.ceil(Math.sqrt(u) * rings));
            return (hubRing * k) / rings + ring(child) + 620;
          }
          const stagger = 0.88 + (Math.abs(h) % 5) * 0.06;
          return base * stagger;
        })
        .strength(0.5), // 충돌 반경이 이길 수 있게 링크는 절반 힘
    )
    .force(
      "charge",
      forceManyBody<SimNode>()
        // 연결 많은 노드일수록 강하게 밀어냄 — 링크 없는 그룹끼리도 영역 확보
        .strength((d) => -(9600 + graph.degree(d.id) * 2000))
        .distanceMax(8400),
    )
    .force("x", forceX<SimNode>(0).strength(0.02))
    .force("y", forceY<SimNode>(0).strength(0.02))
    .force(
      "collide",
      forceCollide<SimNode>()
        // 일반 노드 = 블록 + 여백. 허브 = 링 영역(다른 그룹 침범 방지)에서 대표 자식 반경을 뺀 값 —
        // 충돌은 두 반경의 합으로 밀어내므로, 빼주지 않으면 자식이 링보다 더 멀리 튕겨나감
        .radius((d) =>
          Math.max(
            ((graph.getNodeAttribute(d.id, "blockHalfW") as number) ?? 60) + 300,
            ring(d.id) - CHILD_R,
          ),
        )
        .strength(1)
        .iterations(3),
    )
    .alpha(1);
  alphaTarget = 0;

  if (process.env.NODE_ENV === "development") {
    (window as unknown as { __nmSim: unknown }).__nmSim = sim; // 디버그 콘솔용
  }
  startLoop();
}

export function getSimNode(id: string): SimNode | undefined {
  return byId.get(id);
}

/** 드래그 시작·중: 시뮬레이션 재가열 (주변이 살아 움직임) */
export function reheat(target = 0.3): void {
  if (!sim) return;
  alphaTarget = target;
  sim.alphaTarget(target);
  if (sim.alpha() < target) sim.alpha(target);
  startLoop();
}

/** 드래그 종료: 서서히 식으며 정착 */
export function cool(): void {
  alphaTarget = 0;
  sim?.alphaTarget(0);
}

export function stopSimulation(): void {
  if (timer) clearTimeout(timer);
  timer = null;
  running = false;
  sim?.stop();
  sim = null;
  simGraph = null;
  simNodes = [];
  byId = new Map();
}
