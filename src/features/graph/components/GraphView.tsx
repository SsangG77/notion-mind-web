"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import noverlap from "graphology-layout-noverlap";
import { SigmaContainer, useSigma } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { NodeCircleProgram } from "sigma/rendering";
import type { NodeDisplayData } from "sigma/types";
import type { GraphData } from "@/types/graph";
import { useGraphData } from "../hooks/useGraphData";
import { COMPACT_S, drawNodeHover, drawNodeLabel, NODE_MAX_TEXT_W } from "../drawNode";
import { DB_NODE_SIZE, PAGE_NODE_SIZE, T } from "../tokens";

// 블록 절반 크기 추정 (noverlap 충돌 반경 + 호버 히트 판정용)
// ponytail: 캔버스 실측 대신 글자폭 휴리스틱 — 오차 크면 measureText 실측으로 교체
function estimateBlockHalf(title: string, isDb: boolean): { halfW: number; halfH: number } {
  let raw = 0;
  for (const ch of title) raw += ch.charCodeAt(0) > 0x2e80 ? 13.5 : 7.5; // CJK/라틴 대략폭
  const textW = Math.min(raw, NODE_MAX_TEXT_W);
  const font = isDb ? 14 : 13;
  const lines = raw > NODE_MAX_TEXT_W ? 2 : 1;
  const halfW = (textW + (isDb ? 16 * 2 + 16 : 12 * 2)) / 2; // 패딩 + DB 아이콘 폭
  const halfH = (font + (lines - 1) * font * 1.3 + (isDb ? 10 : 7) * 2) / 2;
  return { halfW, halfH };
}

function buildGraph(data: GraphData): Graph {
  const graph = new Graph();
  data.nodes.forEach((n, i) => {
    // 초기 위치: 원판 랜덤 (FA2가 정리)
    const angle = (i / data.nodes.length) * Math.PI * 2;
    const radius = 50 + (i % 40) * 6;
    const { halfW, halfH } = estimateBlockHalf(n.title, n.type === "database");
    graph.addNode(n.id, {
      label: n.title,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: n.type === "database" ? DB_NODE_SIZE : PAGE_NODE_SIZE,
      color: n.type === "database" ? T.dbFace : T.pageFace,
      nodeType: n.type,
      url: n.url,
      blockHalfW: halfW,
      blockHalfH: halfH,
    });
  });
  for (const e of data.edges) {
    if (graph.hasEdge(e.source, e.target)) continue;
    // relation은 WebGL에서 숨기고 별도 캔버스 레이어에 점선으로 그림
    graph.addEdge(e.source, e.target, {
      color: e.kind === "dbChild" ? T.extrude : T.edgeHierarchy,
      size: 1.3,
      kind: e.kind,
      hidden: e.kind === "relation",
    });
  }
  return graph;
}

/** relation 엣지를 점선(액센트)으로 그리는 2D 캔버스 레이어 — WebGL은 점선 미지원 */
function RelationEdgesLayer() {
  const sigma = useSigma();
  useEffect(() => {
    const container = sigma.getContainer();
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.pointerEvents = "none";
    // 블록(labels 캔버스) 아래, WebGL 엣지 위에 삽입
    const labels = sigma.getCanvases().labels as HTMLCanvasElement | undefined;
    if (labels) container.insertBefore(canvas, labels);
    else container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const graph = sigma.getGraph();

    const draw = () => {
      const { width, height } = sigma.getDimensions();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const scale = 1 / Math.sqrt(sigma.getCamera().ratio); // WebGL 엣지 굵기와 동일 스케일
      ctx.lineWidth = 1.6 * scale;
      ctx.setLineDash([6 * scale, 5 * scale]);
      const hovered = graph.getAttribute("hoveredNode") as string | null;
      // 기본 회색, 호버한 노드에 연결된 것만 액센트 — 두 패스로 나눠 stroke
      for (const [color, match] of [
        [T.edgeHierarchy, false],
        [T.accent, true],
      ] as const) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        graph.forEachEdge((edge, attr, _s, _t, sa, ta) => {
          if (attr.kind !== "relation") return;
          if ((hovered != null && graph.hasExtremity(edge, hovered)) !== match) return;
          const p1 = sigma.graphToViewport({ x: sa.x as number, y: sa.y as number });
          const p2 = sigma.graphToViewport({ x: ta.x as number, y: ta.y as number });
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        });
        ctx.stroke();
      }
    };

    sigma.on("afterRender", draw);
    draw();
    return () => {
      sigma.off("afterRender", draw);
      canvas.remove();
    };
  }, [sigma]);
  return null;
}

/** 호버 처리 — 히트 판정을 중앙 원이 아닌 블록 사각형 전체로 직접 수행 */
function HoverHighlight() {
  const sigma = useSigma();
  useEffect(() => {
    const graph = sigma.getGraph();
    let hovered: string | null = null;
    sigma.setSetting("edgeReducer", (edge, data) =>
      hovered && graph.hasExtremity(edge, hovered) ? { ...data, color: T.accent } : data,
    );

    const setHovered = (node: string | null) => {
      if (node === hovered) return;
      if (hovered && graph.hasNode(hovered)) graph.removeNodeAttribute(hovered, "highlighted");
      hovered = node;
      if (node) graph.setNodeAttribute(node, "highlighted", true); // sigma가 hover 스타일로 렌더
      graph.setAttribute("hoveredNode", node); // 점선 레이어와 상태 공유
      sigma.getContainer().style.cursor = node ? "pointer" : "default";
      sigma.refresh({ skipIndexation: true });
    };

    const onMove = (coords: { x: number; y: number }) => {
      const scale = 1 / Math.sqrt(sigma.getCamera().ratio); // 블록 px 크기의 줌 스케일
      const compact = scale < COMPACT_S; // 축소 상태: 미니 정사각(고정 px)이 히트 영역
      const found = graph.findNode((_n, a) => {
        const p = sigma.graphToViewport({ x: a.x as number, y: a.y as number });
        const hw = compact ? 10 : (a.blockHalfW as number) * scale;
        const hh = compact ? 10 : (a.blockHalfH as number) * scale;
        return Math.abs(coords.x - p.x) <= hw && Math.abs(coords.y - p.y) <= hh;
      });
      setHovered(found ?? null);
    };
    const onLeave = () => setHovered(null);

    const captor = sigma.getMouseCaptor();
    captor.on("mousemove", onMove);
    const container = sigma.getContainer();
    container.addEventListener("mouseleave", onLeave);
    return () => {
      captor.off("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      sigma.setSetting("edgeReducer", null);
    };
  }, [sigma]);
  return null;
}

/** 마운트 시 FA2 워커로 레이아웃 정리 후 정지 */
function Fa2Runner() {
  const sigma = useSigma();
  useEffect(() => {
    const graph = sigma.getGraph();
    if (graph.order === 0) return;
    const layout = new FA2Layout(graph, {
      settings: { ...forceAtlas2.inferSettings(graph), gravity: 0.5 },
    });
    layout.start();
    const timer = setTimeout(() => {
      layout.stop();
      // 1) 좌표계 확장 — 노드 간 기본 간격을 블록 크기 이상으로 벌림
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      graph.forEachNode((_n, a) => {
        minX = Math.min(minX, a.x);
        maxX = Math.max(maxX, a.x);
        minY = Math.min(minY, a.y);
        maxY = Math.max(maxY, a.y);
      });
      const extent = Math.max(maxX - minX, maxY - minY, 1);
      const k = (Math.sqrt(graph.order) * 760) / extent;
      graph.updateEachNodeAttributes((_n, a) => ({ ...a, x: a.x * k, y: a.y * k }));
      // 2) 블록 절반 너비를 충돌 반경으로 겹침 해소 — 이후 위치 고정 (줌과 무관)
      noverlap.assign(graph, {
        maxIterations: 500,
        inputReducer: (_key, attr) => ({
          x: attr.x,
          y: attr.y,
          size: (attr as { blockHalfW?: number }).blockHalfW ?? attr.size,
        }),
        settings: { margin: 25 },
      });
    }, 3000);
    return () => {
      clearTimeout(timer);
      layout.kill();
    };
  }, [sigma]);
  return null;
}

// WebGL 원형 노드를 크기 0으로 렌더 — 블록만 보이게 (히트 판정은 커스텀이라 불필요)
class InvisibleNodeProgram extends NodeCircleProgram {
  processVisibleItem(nodeIndex: number, startIndex: number, data: NodeDisplayData) {
    super.processVisibleItem(nodeIndex, startIndex, { ...data, size: 0 });
  }
}

const SIGMA_SETTINGS = {
  nodeProgramClasses: { circle: InvisibleNodeProgram },
  defaultDrawNodeLabel: drawNodeLabel,
  defaultDrawNodeHover: drawNodeHover,
  labelRenderedSizeThreshold: 0,
  labelGridCellSize: 1, // 모든 노드 블록을 항상 렌더 — 블록이 곧 노드 본체
  labelDensity: Infinity,
  renderEdgeLabels: false,
  minCameraRatio: 0.05,
  maxCameraRatio: 8,
  stagePadding: 60,
};

export default function GraphView() {
  const { data, error, loading } = useGraphData();
  const graph = useMemo(() => (data ? buildGraph(data) : null), [data]);

  if (loading) {
    return (
      <Overlay>
        <p className="text-sm text-[#37352F]">워크스페이스를 읽는 중…</p>
        <p className="text-xs text-[#91908C]">페이지가 많으면 시간이 걸립니다</p>
      </Overlay>
    );
  }
  if (error || !graph) {
    return (
      <Overlay>
        <p className="rounded-lg border border-[#E9E9E7] bg-[#F7F6F3] px-4 py-2 text-sm text-[#37352F]">
          그래프를 불러오지 못했습니다: {error}
        </p>
        <Link href="/" className="text-sm text-[#2383E2]">
          다시 로그인
        </Link>
      </Overlay>
    );
  }

  return (
    <div className="relative h-full w-full" data-testid="graph_canvas">
      <SigmaContainer
        graph={graph}
        settings={SIGMA_SETTINGS}
        className="!h-full !w-full !bg-transparent"
      >
        <Fa2Runner />
        <RelationEdgesLayer />
        <HoverHighlight />
      </SigmaContainer>
      {data?.truncated && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-[#E9E9E7] bg-[#F7F6F3] px-4 py-1.5 text-xs text-[#37352F]">
          {graph.order.toLocaleString()} / {data.total.toLocaleString()} 표시 중 —{" "}
          <span className="font-semibold text-[#2383E2]">전체는 Pro</span>
        </div>
      )}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      {children}
    </div>
  );
}
