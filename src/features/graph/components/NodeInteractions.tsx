"use client";

import { useEffect, useState } from "react";
import { useSigma } from "@react-sigma/core";
import { separateRects } from "../lib/separateRects";
import { getCompactS, setFocus } from "../drawNode";
import { T } from "../tokens";

interface Menu {
  x: number;
  y: number;
  node: string;
  pinned: boolean;
}

interface Coords {
  x: number;
  y: number;
  preventSigmaDefault?: () => void;
  original?: Event;
}

/**
 * 노드 인터랙션 — 히트 판정은 블록 사각형 전체(커스텀).
 * 호버 강조 · 드래그(이웃 딸려오기, 핀 제외) · 우클릭 메뉴(숨기기/핀)
 */
export default function NodeInteractions() {
  const sigma = useSigma();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [hiddenCount, setHiddenCount] = useState(0);

  useEffect(() => {
    const graph = sigma.getGraph();
    const container = sigma.getContainer();
    let hovered: string | null = null;
    let dragging: string | null = null;

    // --- 옵시디언식 스프링 딸려오기 ---
    // 드래그 시작 시 2홉 이웃을 수집해 국소 스프링 시뮬레이션을 돌린다.
    // 드래그 노드 = 커서 고정, 이웃 = 스프링으로 끌려오고 놓으면 감쇠하며 정착.
    interface SimNode {
      vx: number;
      vy: number;
    }
    let simNodes: Map<string, SimNode> | null = null;
    let springs: Array<{ a: string; b: string; rest: number }> | null = null;
    let raf = 0;
    let settleFrames = 0;

    const startSim = (root: string) => {
      simNodes = new Map();
      springs = [];
      // BFS 2홉 — 핀·숨김 제외 (핀은 앵커로만 작동)
      const hop = new Map<string, number>([[root, 0]]);
      let frontier = [root];
      for (let d = 1; d <= 2; d++) {
        const next: string[] = [];
        for (const n of frontier) {
          for (const nb of graph.neighbors(n)) {
            if (hop.has(nb)) continue;
            hop.set(nb, d);
            const a = graph.getNodeAttributes(nb);
            if (!a.pinned && !a.hidden) {
              simNodes.set(nb, { vx: 0, vy: 0 });
              next.push(nb);
            }
          }
        }
        frontier = next;
      }
      // 수집 범위 안의 모든 엣지에 현재 거리 = 휴지 길이 스프링 생성
      const inRange = (n: string) => hop.has(n);
      const seen = new Set<string>();
      for (const n of [root, ...simNodes.keys()]) {
        for (const edge of graph.edges(n)) {
          if (seen.has(edge)) continue;
          seen.add(edge);
          const [a, b] = graph.extremities(edge);
          if (!inRange(a) && !inRange(b)) continue;
          const pa = graph.getNodeAttributes(a);
          const pb = graph.getNodeAttributes(b);
          const rest = Math.hypot((pa.x as number) - (pb.x as number), (pa.y as number) - (pb.y as number));
          springs.push({ a, b, rest });
        }
      }
      settleFrames = 0;
      cancelAnimationFrame(raf);
      const step = () => {
        if (!simNodes || !springs) return;
        // 스프링 힘 적용 (자유 노드에만)
        for (const s of springs) {
          const pa = graph.getNodeAttributes(s.a);
          const pb = graph.getNodeAttributes(s.b);
          const dx = (pb.x as number) - (pa.x as number);
          const dy = (pb.y as number) - (pa.y as number);
          const dist = Math.hypot(dx, dy) || 1;
          const f = ((dist - s.rest) / dist) * 0.06; // 스프링 강도
          const na = simNodes.get(s.a);
          const nb = simNodes.get(s.b);
          if (na) {
            na.vx += dx * f;
            na.vy += dy * f;
          }
          if (nb) {
            nb.vx -= dx * f;
            nb.vy -= dy * f;
          }
        }
        let energy = 0;
        for (const [n, v] of simNodes) {
          v.vx *= 0.82; // 감쇠
          v.vy *= 0.82;
          energy += Math.abs(v.vx) + Math.abs(v.vy);
          const a = graph.getNodeAttributes(n);
          graph.setNodeAttribute(n, "x", (a.x as number) + v.vx);
          graph.setNodeAttribute(n, "y", (a.y as number) + v.vy);
        }
        // 드래그 중엔 계속, 놓은 뒤엔 에너지가 잦아들면 종료
        if (dragging || (energy > 0.5 && settleFrames < 180)) {
          if (!dragging) settleFrames++;
          raf = requestAnimationFrame(step);
        } else {
          simNodes = null;
          springs = null;
          // 뭉친 채 끝났으면 겹침 해소 — 로드 때와 동일한 사각형 분리 (겹친 노드만 밀림)
          separateRects(graph);
          sigma.refresh({ skipIndexation: true });
        }
      };
      raf = requestAnimationFrame(step);
    };

    // 배경 베일 — 호버 시 캔버스 뒤(도트 그리드)를 어둡게. 엣지·노드 dim은 각자 처리
    const veil = document.createElement("div");
    veil.style.cssText =
      "position:absolute;inset:0;background:#000;opacity:0;transition:opacity 150ms;pointer-events:none";
    container.insertBefore(veil, container.firstChild);

    // 호버 시: 연결 엣지 = 액센트, 나머지 엣지 = 흐리게
    sigma.setSetting("edgeReducer", (edge, data) => {
      if (!hovered) return data;
      if (graph.hasExtremity(edge, hovered)) return { ...data, color: T.accent };
      return { ...data, color: T.edgeDim }; // 배경 근접색 — 확실한 고스트 처리
    });

    const hitTest = (coords: { x: number; y: number }): string | null => {
      const scale = 1 / Math.sqrt(sigma.getCamera().ratio); // 블록 px 크기의 줌 스케일
      const compact = scale < getCompactS(); // 축소 상태: 미니 정사각(고정 px)이 히트 영역
      return (
        graph.findNode((_n, a) => {
          if (a.hidden) return false;
          const p = sigma.graphToViewport({ x: a.x as number, y: a.y as number });
          const hw = compact ? 10 : (a.blockHalfW as number) * scale;
          const hh = compact ? 10 : (a.blockHalfH as number) * scale;
          return Math.abs(coords.x - p.x) <= hw && Math.abs(coords.y - p.y) <= hh;
        }) ?? null
      );
    };

    let lit: string[] = []; // highlighted 처리한 노드들 (중심 + 이웃)
    const setHovered = (node: string | null) => {
      if (node === hovered) return;
      for (const n of lit) if (graph.hasNode(n)) graph.removeNodeAttribute(n, "highlighted");
      lit = [];
      hovered = node;
      if (node) {
        // 중심 + 이웃 전부 hover 레이어(최상단)로 — 흐린 노드가 위를 덮지 못하게
        lit = [node, ...graph.neighbors(node)];
        for (const n of lit) graph.setNodeAttribute(n, "highlighted", true);
      }
      graph.setAttribute("hoveredNode", node); // 점선 레이어와 상태 공유
      // 옵시디언식 포커스: 이웃 외 노드 흐리게 + 배경 베일
      setFocus(node ? { center: node, connected: new Set(graph.neighbors(node)) } : null);
      const dark = document.documentElement.classList.contains("dark");
      veil.style.opacity = node ? (dark ? "0.35" : "0.07") : "0";
      container.style.cursor = node ? "pointer" : "default";
      sigma.refresh({ skipIndexation: true });
    };

    const onMove = (e: Coords) => {
      if (dragging) return;
      setHovered(hitTest(e));
    };

    const onDown = (e: Coords) => {
      setMenu(null);
      if (!hovered) return;
      dragging = hovered;
      // 드래그 중 오토스케일 재계산으로 화면이 튀지 않게 bbox 고정
      if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
      startSim(dragging);
      e.preventSigmaDefault?.();
    };

    const onDragMove = (e: Coords) => {
      if (!dragging) return;
      const pos = sigma.viewportToGraph(e);
      // 드래그 노드는 커서 고정 — 이웃은 스프링 루프가 끌어옴
      graph.setNodeAttribute(dragging, "x", pos.x);
      graph.setNodeAttribute(dragging, "y", pos.y);
      e.preventSigmaDefault?.();
      e.original?.preventDefault();
      e.original?.stopPropagation();
    };

    const onUp = () => {
      dragging = null; // 시뮬레이션은 에너지가 잦아들 때까지 이어서 정착
    };

    const onLeave = () => {
      if (!dragging) setHovered(null);
    };

    const onContextMenu = (ev: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const coords = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      const node = hitTest(coords);
      if (!node) return;
      ev.preventDefault();
      setMenu({
        x: coords.x,
        y: coords.y,
        node,
        pinned: !!graph.getNodeAttribute(node, "pinned"),
      });
    };

    const captor = sigma.getMouseCaptor();
    captor.on("mousemove", onMove);
    captor.on("mousemovebody", onDragMove);
    captor.on("mousedown", onDown);
    captor.on("mouseup", onUp);
    container.addEventListener("mouseleave", onLeave);
    container.addEventListener("contextmenu", onContextMenu);
    return () => {
      cancelAnimationFrame(raf);
      setFocus(null);
      veil.remove();
      captor.off("mousemove", onMove);
      captor.off("mousemovebody", onDragMove);
      captor.off("mousedown", onDown);
      captor.off("mouseup", onUp);
      container.removeEventListener("mouseleave", onLeave);
      container.removeEventListener("contextmenu", onContextMenu);
      sigma.setSetting("edgeReducer", null);
    };
  }, [sigma]);

  const graph = sigma.getGraph();

  const hideNode = (node: string) => {
    graph.setNodeAttribute(node, "hidden", true);
    graph.removeNodeAttribute(node, "highlighted");
    if (graph.getAttribute("hoveredNode") === node) graph.setAttribute("hoveredNode", null);
    setHiddenCount((c) => c + 1);
    setMenu(null);
    sigma.refresh();
  };

  const togglePin = (node: string, pinned: boolean) => {
    if (pinned) graph.removeNodeAttribute(node, "pinned");
    else graph.setNodeAttribute(node, "pinned", true);
    setMenu(null);
  };

  const showAll = () => {
    graph.forEachNode((n, a) => {
      if (a.hidden) graph.removeNodeAttribute(n, "hidden");
    });
    setHiddenCount(0);
    sigma.refresh();
  };

  return (
    <>
      {menu && (
        <div
          data-testid="node_context_menu"
          className="absolute z-20 min-w-32 overflow-hidden rounded-lg border border-[#E9E9E7] bg-white py-1 text-sm text-[#37352F] shadow-lg dark:border-[#2F2F2F] dark:bg-[#202020] dark:text-[#EDEDEC]"
          style={{ left: menu.x, top: menu.y }}
        >
          <button
            data-testid="menu_hide_node"
            className="block w-full px-3 py-1.5 text-left hover:bg-[#F7F6F3] dark:hover:bg-[#2B2A27]"
            onClick={() => hideNode(menu.node)}
          >
            숨기기
          </button>
          <button
            data-testid="menu_toggle_pin"
            className="block w-full px-3 py-1.5 text-left hover:bg-[#F7F6F3] dark:hover:bg-[#2B2A27]"
            onClick={() => togglePin(menu.node, menu.pinned)}
          >
            {menu.pinned ? "핀 해제" : "핀 고정"}
          </button>
        </div>
      )}
      {hiddenCount > 0 && (
        <button
          data-testid="show_hidden_chip"
          className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[#E9E9E7] bg-white px-3 py-1 text-xs text-[#37352F] shadow-sm hover:bg-[#F7F6F3] dark:border-[#2F2F2F] dark:bg-[#202020] dark:text-[#EDEDEC] dark:hover:bg-[#2B2A27]"
          onClick={showAll}
        >
          숨긴 노드 {hiddenCount}개 · 모두 표시
        </button>
      )}
    </>
  );
}
