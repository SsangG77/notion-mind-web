"use client";

import { useEffect, useRef, useState } from "react";
import { useSigma } from "@react-sigma/core";
import type { NodeType } from "@/types/graph";
import { cool, getSimNode, reheat } from "../lib/simulation";
import { getCompactS, MIN_BLOCK_S, setFocus } from "../drawNode";
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
 * 호버 강조 · 클릭 선택(상세 패널) · 드래그(이웃 딸려오기, 핀 제외) · 우클릭 메뉴(숨기기/핀)
 */
export default function NodeInteractions({
  onSelect,
}: {
  onSelect: (next: { id: string; type: NodeType } | null) => void;
}) {
  const sigma = useSigma();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [hiddenCount, setHiddenCount] = useState(0);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const graph = sigma.getGraph();
    const container = sigma.getContainer();
    let hovered: string | null = null;
    let dragging: string | null = null;
    let downAt: { x: number; y: number } | null = null; // 클릭·드래그 구분용

    // 드래그 = 상시 물리 시뮬레이션에 위임 (옵시디언 방식) —
    // 잡은 노드는 커서에 고정(fx/fy), 시뮬레이션 재가열로 주변이 출렁이며 따라옴

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
      const bs = Math.max(scale, MIN_BLOCK_S); // 블록 최소 표시 스케일 반영
      return (
        graph.findNode((_n, a) => {
          if (a.hidden) return false;
          const p = sigma.graphToViewport({ x: a.x as number, y: a.y as number });
          const hw = compact ? 10 : (a.blockHalfW as number) * bs;
          const hh = compact ? 10 : (a.blockHalfH as number) * bs;
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
      downAt = { x: e.x, y: e.y };
      if (!hovered) return;
      dragging = hovered;
      // 드래그 중 오토스케일 재계산으로 화면이 튀지 않게 bbox 고정
      if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
      const pos = sigma.viewportToGraph(e);
      const sn = getSimNode(dragging);
      if (sn) {
        sn.fx = pos.x;
        sn.fy = pos.y;
      }
      reheat(); // 시뮬레이션 재가열 — 주변이 살아 움직이며 따라옴
      e.preventSigmaDefault?.();
    };

    const onDragMove = (e: Coords) => {
      if (!dragging) return;
      const pos = sigma.viewportToGraph(e);
      // 잡은 노드는 커서에 고정 — 나머지는 시뮬레이션이 처리
      const sn = getSimNode(dragging);
      if (sn) {
        sn.fx = pos.x;
        sn.fy = pos.y;
      }
      graph.setNodeAttribute(dragging, "x", pos.x);
      graph.setNodeAttribute(dragging, "y", pos.y);
      e.preventSigmaDefault?.();
      e.original?.preventDefault();
      e.original?.stopPropagation();
    };

    const onUp = (e: Coords) => {
      // 거의 안 움직였으면 클릭으로 간주 — 노드 선택 / 빈 영역이면 선택 해제
      const moved = downAt ? Math.hypot(e.x - downAt.x, e.y - downAt.y) : 0;
      if (downAt && moved < 4) {
        const hit = hitTest(e);
        onSelectRef.current(
          hit
            ? { id: hit, type: graph.getNodeAttribute(hit, "nodeType") as NodeType }
            : null,
        );
      }
      downAt = null;
      if (dragging) {
        const sn = getSimNode(dragging);
        // 핀 상태가 아니면 고정 해제 — 시뮬레이션이 이어서 정착
        if (sn && !graph.getNodeAttribute(dragging, "pinned")) {
          sn.fx = null;
          sn.fy = null;
        }
      }
      dragging = null;
      cool(); // 서서히 식으며 정착
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
    const sn = getSimNode(node);
    if (pinned) {
      graph.removeNodeAttribute(node, "pinned");
      if (sn) {
        sn.fx = null;
        sn.fy = null;
      }
    } else {
      graph.setNodeAttribute(node, "pinned", true);
      if (sn) {
        sn.fx = graph.getNodeAttribute(node, "x") as number;
        sn.fy = graph.getNodeAttribute(node, "y") as number;
      }
    }
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
