"use client";

import { useEffect, useRef } from "react";
import { useSigma } from "@react-sigma/core";
import type { GraphData } from "@/types/graph";
import { estimateBlockHalf } from "../drawNode";
import { buildSimulation, stopSimulation } from "../lib/simulation";
import { DB_NODE_SIZE, PAGE_NODE_SIZE, T } from "../tokens";

/**
 * 배치가 올 때마다 새 노드·엣지를 그래프에 추가하고 옵시디언식 물리 시뮬레이션을
 * 다시 돌린다 (점진 로딩). 시뮬레이션은 상시 유지 — 정착 후에도 드래그로 재가열됨.
 * 좌표 1단위 = 1px (화면 자동 맞춤 해제 상태), 링크 목표 거리·충돌 반경이 곧 화면 값.
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
      // 초기 위치: 부모 근처(있으면), 아니면 황금각 나선 — 시뮬레이션이 정리
      let x: number;
      let y: number;
      if (n.parentId && graph.hasNode(n.parentId)) {
        const p = graph.getNodeAttributes(n.parentId);
        x = (p.x as number) + Math.cos(idx * 2.4) * 60;
        y = (p.y as number) + Math.sin(idx * 2.4) * 60;
      } else {
        const r = 80 + idx * 3;
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
    buildSimulation(graph); // 배치마다 재구성 — 새 노드 포함해 다시 정착
    return () => {
      // 다음 배치가 곧바로 다시 만들므로 여기서는 정지만
      stopSimulation();
    };
  }, [sigma, data, gen, loading]);

  return null;
}
