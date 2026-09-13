"use client";

import { useEffect, useState } from "react";
import { useSigma } from "@react-sigma/core";
import { COMPACT_S } from "../drawNode";
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
    let lastPos: { x: number; y: number } | null = null; // 그래프 좌표

    sigma.setSetting("edgeReducer", (edge, data) =>
      hovered && graph.hasExtremity(edge, hovered) ? { ...data, color: T.accent } : data,
    );

    const hitTest = (coords: { x: number; y: number }): string | null => {
      const scale = 1 / Math.sqrt(sigma.getCamera().ratio); // 블록 px 크기의 줌 스케일
      const compact = scale < COMPACT_S; // 축소 상태: 미니 정사각(고정 px)이 히트 영역
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

    const setHovered = (node: string | null) => {
      if (node === hovered) return;
      if (hovered && graph.hasNode(hovered)) graph.removeNodeAttribute(hovered, "highlighted");
      hovered = node;
      if (node) graph.setNodeAttribute(node, "highlighted", true); // sigma가 hover 스타일로 렌더
      graph.setAttribute("hoveredNode", node); // 점선 레이어와 상태 공유
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
      lastPos = sigma.viewportToGraph(e);
      // 드래그 중 오토스케일 재계산으로 화면이 튀지 않게 bbox 고정
      if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
      e.preventSigmaDefault?.();
    };

    const onDragMove = (e: Coords) => {
      if (!dragging || !lastPos) return;
      const pos = sigma.viewportToGraph(e);
      const dx = pos.x - lastPos.x;
      const dy = pos.y - lastPos.y;
      lastPos = pos;
      graph.setNodeAttribute(dragging, "x", pos.x);
      graph.setNodeAttribute(dragging, "y", pos.y);
      // 이웃 딸려오기 — 핀 고정·숨김 노드 제외
      for (const nb of graph.neighbors(dragging)) {
        const a = graph.getNodeAttributes(nb);
        if (a.pinned || a.hidden) continue;
        graph.setNodeAttribute(nb, "x", (a.x as number) + dx * 0.3);
        graph.setNodeAttribute(nb, "y", (a.y as number) + dy * 0.3);
      }
      e.preventSigmaDefault?.();
      e.original?.preventDefault();
      e.original?.stopPropagation();
    };

    const onUp = () => {
      dragging = null;
      lastPos = null;
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
