"use client";

import { useEffect, useRef } from "react";
import forceAtlas2 from "graphology-layout-forceatlas2";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import { separateRects } from "../lib/separateRects";
import { useSigma } from "@react-sigma/core";
import type Graph from "graphology";
import type { GraphData } from "@/types/graph";
import { estimateBlockHalf } from "../drawNode";
import { DB_NODE_SIZE, PAGE_NODE_SIZE, T } from "../tokens";

// 레이아웃 마무리: 픽셀 스케일 정규화 + 블록 크기 기준 겹침 해소.
// 자동 화면 맞춤이 꺼져 있어 좌표 1단위 = 1px(기본 배율) — 간격 값이 곧 화면 간격.
function spreadAndNoverlap(graph: Graph) {
  // 일반 이웃 간 거리(엣지 길이 중앙값)를 ~420px로 정규화
  const lens: number[] = [];
  graph.forEachEdge((_e, _a, _s, _t, sa, ta) => {
    lens.push(Math.hypot((sa.x as number) - (ta.x as number), (sa.y as number) - (ta.y as number)));
  });
  lens.sort((a, b) => a - b);
  const median = lens[Math.floor(lens.length / 2)] || 1;
  const k = 420 / median;
  graph.updateEachNodeAttributes((_n, a) => ({ ...a, x: a.x * k, y: a.y * k }));
  // 블록(최대 ~200px) 사이 실제 화면 여백 px
  const gapX = 300;
  graph.setAttribute("sepGapX", gapX); // 드래그 후 재정리도 같은 여백 사용
  separateRects(graph, { gapX, gapY: 180 });
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
    // 연결(차수)이 많은 노드의 엣지일수록 당기는 힘을 약하게 —
    // 허브 주변은 넓게 퍼지고, 연결 적은 노드끼리는 가깝게 붙음
    graph.forEachEdge((e, _a, s, t) => {
      const d = (graph.degree(s) + graph.degree(t)) / 2; // 양끝 평균 — 허브-허브 선도 중간 힘 유지
      graph.setEdgeAttribute(e, "weight", 1 / (1 + Math.log2(1 + d)));
    });
    const layout = new FA2Layout(graph, {
      settings: {
        ...forceAtlas2.inferSettings(graph),
        gravity: 0.05, // 중심 인력 최소 — 뭉침 방지
        scalingRatio: 40, // 반발 강화 — 허브 자식들이 배치 단계에서부터 퍼짐
        edgeWeightInfluence: 1, // 위 weight 반영
      },
    });
    layout.start();
    let timer: ReturnType<typeof setTimeout> | null = null;
    let timer2: ReturnType<typeof setTimeout> | null = null;
    let killed = false;
    if (!loading) {
      timer = setTimeout(() => {
        // 워커를 완전히 종료하고 잔여 좌표 메시지가 반영된 뒤에 겹침 해소 —
        // 순서가 바뀌면 워커의 마지막 업데이트가 해소 결과를 덮어씀
        layout.kill();
        killed = true;
        timer2 = setTimeout(() => {
          spreadAndNoverlap(graph);
          sigma.refresh();
        }, 120);
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (timer2) clearTimeout(timer2);
      if (!killed) layout.kill();
    };
  }, [sigma, data, gen, loading]);

  return null;
}
