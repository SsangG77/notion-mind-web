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
  separateRects(simGraph, { gapX: 320, gapY: 200 });
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

  sim = forceSimulation(simNodes)
    .stop() // 내부 스테퍼 사용 안 함 — 아래 자체 프레임 루프로 구동
    .force(
      "link",
      forceLink<SimNode, { source: string | SimNode; target: string | SimNode }>(links)
        .id((d) => d.id)
        // 양끝 연결 수의 합 — 허브끼리는 두 링 반경의 합만큼 벌어짐
        .distance((l) => {
          const s = typeof l.source === "object" ? l.source.id : l.source;
          const t = typeof l.target === "object" ? l.target.id : l.target;
          return Math.max(530, (graph.degree(s) + graph.degree(t)) * 62);
        })
        .strength(0.5), // 충돌 반경이 이길 수 있게 링크는 절반 힘
    )
    .force(
      "charge",
      forceManyBody<SimNode>()
        // 연결 많은 노드일수록 강하게 밀어냄 — 링크 없는 그룹끼리도 영역 확보
        .strength((d) => -(2400 + graph.degree(d.id) * 500))
        .distanceMax(4200),
    )
    .force("x", forceX<SimNode>(0).strength(0.02))
    .force("y", forceY<SimNode>(0).strength(0.02))
    .force(
      "collide",
      forceCollide<SimNode>()
        // 일반 노드 = 블록 + 여백. 허브 = 자식 링 영역까지 충돌 원 —
        // 다른 허브·노드가 링 안에 못 들어와 그룹끼리 안 섞임 (자식들은 링 위 = 영역 밖)
        .radius((d) =>
          Math.max(
            (((graph.getNodeAttribute(d.id, "blockHalfW") as number) ?? 60) + 100),
            graph.degree(d.id) * 62 * 0.75,
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
