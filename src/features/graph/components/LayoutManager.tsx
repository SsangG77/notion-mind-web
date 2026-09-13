"use client";

import { useEffect, useRef } from "react";
import forceAtlas2 from "graphology-layout-forceatlas2";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import noverlap from "graphology-layout-noverlap";
import { useSigma } from "@react-sigma/core";
import type Graph from "graphology";
import type { GraphData } from "@/types/graph";
import { estimateBlockHalf } from "../drawNode";
import { DB_NODE_SIZE, PAGE_NODE_SIZE, T } from "../tokens";

// 레이아웃 마무리: 간격 확장 + 블록 크기 기준 겹침 해소
function spreadAndNoverlap(graph: Graph) {
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
  noverlap.assign(graph, {
    maxIterations: 500,
    inputReducer: (_key, attr) => ({
      x: attr.x,
      y: attr.y,
      size: (attr as { blockHalfW?: number }).blockHalfW ?? attr.size,
    }),
    settings: { margin: 25 },
  });
}

/**
 * 배치가 올 때마다 새 노드·엣지를 그래프에 추가하고 FA2를 돌린다 (점진 로딩).
 * 마지막 배치 후 2.5초 정리 → 정지 → 겹침 해소.
 */
export default function LayoutManager({
  data,
  gen,
  loading,
}: {
  data: GraphData | null;
  gen: number;
  loading: boolean;
}) {
  const sigma = useSigma();
  const genRef = useRef(gen);

  useEffect(() => {
    if (!data) return;
    const graph = sigma.getGraph();
    if (genRef.current !== gen) {
      genRef.current = gen;
      graph.clear(); // 재동기화 — 처음부터 다시
    }

    let idx = graph.order;
    for (const n of data.nodes) {
      if (graph.hasNode(n.id)) continue;
      const isDb = n.type === "database";
      const { halfW, halfH } = estimateBlockHalf(n.title, isDb);
      // 초기 위치: 부모 근처(있으면), 아니면 황금각 나선 — FA2가 정리
      let x: number;
      let y: number;
      if (n.parentId && graph.hasNode(n.parentId)) {
        const p = graph.getNodeAttributes(n.parentId);
        x = (p.x as number) + Math.cos(idx * 2.4) * 40;
        y = (p.y as number) + Math.sin(idx * 2.4) * 40;
      } else {
        const r = 60 + idx * 2;
        x = Math.cos(idx * 2.399963) * r;
        y = Math.sin(idx * 2.399963) * r;
      }
      graph.addNode(n.id, {
        label: n.title,
        x,
        y,
        size: isDb ? DB_NODE_SIZE : PAGE_NODE_SIZE,
        // 알파 00 = WebGL 원형은 투명(블록만 보임). 타입 판별은 색 prefix로 유지
        color: (isDb ? T.dbFace : T.pageFace) + "00",
        nodeType: n.type,
        url: n.url,
        blockHalfW: halfW,
        blockHalfH: halfH,
      });
      idx++;
    }
    for (const e of data.edges) {
      if (!graph.hasNode(e.source) || !graph.hasNode(e.target)) continue;
      if (graph.hasEdge(e.source, e.target)) continue;
      // relation은 WebGL에서 숨기고 별도 캔버스 레이어에 점선으로 그림
      graph.addEdge(e.source, e.target, {
        color: e.kind === "dbChild" ? T.edgeDb : T.edgeHierarchy,
        size: 1.3,
        kind: e.kind,
        hidden: e.kind === "relation",
      });
    }

    if (graph.order === 0) return;
    const layout = new FA2Layout(graph, {
      settings: { ...forceAtlas2.inferSettings(graph), gravity: 0.5 },
    });
    layout.start();
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (!loading) {
      timer = setTimeout(() => {
        layout.stop();
        spreadAndNoverlap(graph);
        sigma.refresh();
      }, 2500);
    }
    return () => {
      if (timer) clearTimeout(timer);
      layout.kill();
    };
  }, [sigma, data, gen, loading]);

  return null;
}
