"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type Graph from "graphology";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";
import HiddenNodesPanel, { type HiddenNodeRow } from "./HiddenNodesPanel";
import { getLeftPanel, getLeftPanelServer, setLeftPanel, subscribeLeftPanel } from "../lib/leftPanel";
import { useSigma } from "@react-sigma/core";
import type { NodeType } from "@/types/graph";
import { cool, getSimNode, reheat } from "../lib/simulation";
import { getCompactS, MIN_BLOCK_S, setFocus } from "../drawNode";
import { T } from "../tokens";
import { useT } from "@/features/i18n/LangProvider";
import { dbChildCount } from "../lib/graphFilter";
import {
  getFilter,
  getFilterServer,
  refreshFilter,
  setFilter,
  subscribeFilter,
  toggleCollapsed,
} from "../lib/filterStore";

/** 호버한 노드 바로 아래에 뜨는 메뉴 */
interface Menu {
  node: string;
  pinned: boolean;
  isDb: boolean;
  /** DB 안 페이지 수 — 0 이면 접기 메뉴를 안 보인다 */
  children: number;
}

// 노드 아래끝과 메뉴 사이 간격(화면 px). 이 틈도 호버 범위에 넣어 메뉴로 가는 길에 풀리지 않게 한다
const MENU_GAP = 6;

interface Coords {
  x: number;
  y: number;
  preventSigmaDefault?: () => void;
  original?: Event;
}

/**
 * 노드 인터랙션 — 히트 판정은 블록 사각형 전체(커스텀).
 * 호버 강조, 클릭 선택(상세 패널), 드래그(이웃 딸려오기, 핀 제외),
 * 호버 메뉴(숨기기, 핀, DB 접기, 엮인 것만) — 노드 바로 아래에 뜨고 노드와 메뉴를 합친 범위가 호버 범위
 */
export default function NodeInteractions({
  onSelect,
  onPersist,
}: {
  onSelect: (next: { id: string; type: NodeType } | null) => void;
  /** 숨김·핀이 바뀐 뒤 호출 — Pro 는 서버 저장, Free 는 no-op */
  onPersist: (graph: Graph) => void;
}) {
  const t = useT();
  const sigma = useSigma();
  const [menu, setMenu] = useState<Menu | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // 메뉴 위치는 매 렌더(물리, 카메라 이동)마다 바뀌므로 React 상태가 아니라 DOM 에 직접 쓴다
  const placeMenuRef = useRef<() => void>(() => {});
  const filter = useSyncExternalStore(subscribeFilter, getFilter, getFilterServer);
  const [hiddenCount, setHiddenCount] = useState(0);
  // 좌측 패널 조정 — 설정 패널이 열리면 여기는 닫힘. 슬라이드 아웃이 끝날 때까지는 마운트 유지
  const leftPanel = useSyncExternalStore(subscribeLeftPanel, getLeftPanel, getLeftPanelServer);
  const listOpen = leftPanel === "hidden";
  const [listMounted, setListMounted] = useState(false);
  // 저장된 숨김이 로드 시 복원되므로 노드가 추가될 때마다 다시 센다
  useEffect(() => {
    const g = sigma.getGraph();
    const recount = () => {
      let c = 0;
      g.forEachNode((_, a) => {
        if (a.hidden && !a.filteredOut) c++;
      });
      setHiddenCount(c);
    };
    g.on("nodeAdded", recount);
    g.on("cleared", recount);
    return () => {
      g.off("nodeAdded", recount);
      g.off("cleared", recount);
    };
  }, [sigma]);
  const onSelectRef = useRef(onSelect);
  const onPersistRef = useRef(onPersist);
  // 이펙트 안의 setHovered(null) 을 바깥 핸들러(숨기기 등)에서 부르기 위한 통로
  const clearHoverRef = useRef<() => void>(() => {});
  useEffect(() => {
    onSelectRef.current = onSelect;
    onPersistRef.current = onPersist;
  }, [onSelect, onPersist]);

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

    // 호버한 노드 블록이 실제로 그려지는 화면 위치 — 축소 상태에서도 호버하면 원래 크기로 커진다(drawNode)
    const nodeBox = (node: string) => {
      const a = graph.getNodeAttributes(node);
      const scale = 1 / Math.sqrt(sigma.getCamera().ratio);
      const bs = scale < getCompactS() ? 1 : Math.max(scale, MIN_BLOCK_S);
      const p = sigma.graphToViewport({ x: a.x as number, y: a.y as number });
      return { x: p.x, y: p.y, bottom: p.y + (a.blockHalfH as number) * bs + 4.5 * bs };
    };

    const placeMenu = () => {
      const el = menuRef.current;
      if (!el || !hovered || !graph.hasNode(hovered)) return;
      const b = nodeBox(hovered);
      el.style.left = `${b.x}px`;
      el.style.top = `${b.bottom + MENU_GAP}px`;
    };
    placeMenuRef.current = placeMenu;

    const showMenu = (node: string | null) => {
      if (!node) return setMenu(null);
      const isDb = graph.getNodeAttribute(node, "nodeType") === "database";
      setMenu({
        node,
        pinned: !!graph.getNodeAttribute(node, "pinned"),
        isDb,
        children: isDb ? dbChildCount(graph, node) : 0,
      });
    };

    // 노드에서 메뉴로 내려가는 길(노드 중심부터 메뉴 아래끝까지, 메뉴 폭만큼)은 호버를 유지한다
    const inMenuZone = (coords: { x: number; y: number }) => {
      const el = menuRef.current;
      if (!el || !hovered || !graph.hasNode(hovered)) return false;
      const r = el.getBoundingClientRect();
      const c = container.getBoundingClientRect();
      const left = r.left - c.left;
      const bottom = r.bottom - c.top;
      return (
        coords.x >= left &&
        coords.x <= left + r.width &&
        coords.y >= nodeBox(hovered).y &&
        coords.y <= bottom
      );
    };

    let lit: string[] = []; // highlighted 처리한 노드들 (중심 + 이웃)
    const setHovered = (node: string | null) => {
      if (node === hovered) return;
      showMenu(node);
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

    clearHoverRef.current = () => setHovered(null);

    const onMove = (e: Coords) => {
      if (dragging) return;
      const hit = hitTest(e);
      if (!hit && inMenuZone(e)) return;
      setHovered(hit);
    };

    const onDown = (e: Coords) => {
      downAt = { x: e.x, y: e.y };
      if (!hovered) return;
      setMenu(null); // 드래그 중엔 메뉴가 커서를 따라다니며 가리지 않게
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
        } else {
          onPersistRef.current(graph); // 핀 노드를 옮김 — 새 좌표 저장
        }
      }
      const wasDragging = dragging;
      dragging = null;
      cool(); // 서서히 식으며 정착
      if (wasDragging && hovered) showMenu(hovered); // 놓은 자리에서 메뉴 다시
    };

    // 메뉴는 캔버스 바깥 형제 요소라 메뉴로 올라가면 캔버스의 mouseleave 가 온다 — 그때는 유지
    const onLeave = (ev: MouseEvent) => {
      if (dragging) return;
      if (menuRef.current?.contains(ev.relatedTarget as Node | null)) return;
      setHovered(null);
    };

    const captor = sigma.getMouseCaptor();
    captor.on("mousemove", onMove);
    captor.on("mousemovebody", onDragMove);
    captor.on("mousedown", onDown);
    captor.on("mouseup", onUp);
    container.addEventListener("mouseleave", onLeave);
    sigma.on("afterRender", placeMenu);
    return () => {
      setFocus(null);
      veil.remove();
      captor.off("mousemove", onMove);
      captor.off("mousemovebody", onDragMove);
      captor.off("mousedown", onDown);
      captor.off("mouseup", onUp);
      container.removeEventListener("mouseleave", onLeave);
      sigma.off("afterRender", placeMenu);
      sigma.setSetting("edgeReducer", null);
    };
  }, [sigma]);

  // 메뉴가 새로 그려진 직후 자리 잡기 — 다음 afterRender 를 기다리면 한 프레임 엉뚱한 곳에 뜬다
  useLayoutEffect(() => {
    if (menu) placeMenuRef.current();
  }, [menu]);

  const graph = sigma.getGraph();

  const hideNode = (node: string) => {
    // 메뉴 클릭은 캔버스 mousemove 를 안 일으켜 호버 포커스(흐림+베일)가 남음 — 명시적으로 해제
    clearHoverRef.current();
    graph.setNodeAttribute(node, "hidden", true);
    graph.removeNodeAttribute(node, "highlighted");
    setHiddenCount((c) => c + 1);
    sigma.refresh();
    onPersist(graph);
  };

  // 핀, 접기, 엮인 것만은 노드가 그대로 남으므로 호버와 메뉴를 유지한다 — 연달아 누를 수 있게
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
    setMenu((m) => (m && m.node === node ? { ...m, pinned: !pinned } : m));
    onPersist(graph);
  };

  const toggleFocus = (node: string) => {
    setFilter({ focus: filter.focus === node ? null : node });
  };

  // 다시 보이게 한 노드가 지금 필터에 걸리는지 다시 계산 — 안 하면 필터를 무시하고 나타난다
  const unhideNode = (node: string) => {
    if (graph.hasNode(node)) graph.removeNodeAttribute(node, "hidden");
    setHiddenCount((c) => Math.max(0, c - 1));
    refreshFilter();
    onPersist(graph);
  };

  const hiddenRows = (): HiddenNodeRow[] => {
    const rows: HiddenNodeRow[] = [];
    graph.forEachNode((id, a) => {
      if (a.hidden && !a.filteredOut)
        rows.push({ id, title: (a.label as string) ?? t.untitled, isDb: a.nodeType === "database" });
    });
    return rows;
  };

  const showAll = () => {
    // 필터가 가린 노드는 사용자가 숨긴 게 아니므로 그대로 둔다
    graph.forEachNode((n, a) => {
      if (a.hidden && !a.filteredOut) graph.removeNodeAttribute(n, "hidden");
    });
    setHiddenCount(0);
    refreshFilter();
    onPersist(graph);
  };

  const menuItem =
    "whitespace-nowrap px-2.5 py-1 hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]";
  const focusTitle =
    filter.focus && graph.hasNode(filter.focus)
      ? ((graph.getNodeAttribute(filter.focus, "label") as string) ?? t.untitled)
      : null;

  return (
    <>
      {menu && (
        <div
          ref={menuRef}
          data-testid="node_hover_menu"
          className={`${BLOCK} absolute z-20 flex -translate-x-1/2 overflow-hidden text-xs`}
          // 캔버스로 돌아가는 길이면 캔버스의 mousemove 가 판단한다. 그 밖(다른 패널 등)으로 나가면 호버 해제
          onMouseLeave={(e) => {
            if (!sigma.getContainer().contains(e.relatedTarget as Node | null)) clearHoverRef.current();
          }}
        >
          <button data-testid="menu_hide_node" className={menuItem} onClick={() => hideNode(menu.node)}>
            {t.hideNode}
          </button>
          <button
            data-testid="menu_toggle_pin"
            className={menuItem}
            onClick={() => togglePin(menu.node, menu.pinned)}
          >
            {menu.pinned ? t.unpin : t.pin}
          </button>
          {menu.isDb && menu.children > 0 && (
            <button
              data-testid="menu_toggle_collapse"
              className={menuItem}
              onClick={() => toggleCollapsed(menu.node)}
            >
              {filter.collapsed.has(menu.node)
                ? t.expandDb(menu.children.toLocaleString())
                : t.collapseDb}
            </button>
          )}
          <button
            data-testid="menu_toggle_focus"
            className={menuItem}
            onClick={() => toggleFocus(menu.node)}
          >
            {filter.focus === menu.node ? t.focusClear : t.focusLinked}
          </button>
        </div>
      )}
      {focusTitle && (
        // top-14: 동기화 진행, 상한 안내 칩(top-4)과 겹치지 않게 한 줄 아래
        <div className="absolute left-1/2 top-14 z-10 flex max-w-[80%] -translate-x-1/2 items-center gap-2 text-xs">
          <span className={`${BLOCK} truncate px-3 py-1.5`}>{t.focusShowing(focusTitle)}</span>
          <button
            data-testid="focus_clear_chip"
            className={`${BLOCK} ${BLOCK_PRESS} shrink-0 px-3 py-1.5 hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]`}
            onClick={() => setFilter({ focus: null })}
          >
            {t.focusClear}
          </button>
        </div>
      )}
      {hiddenCount > 0 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 text-xs">
          <button
            data-testid="show_hidden_chip"
            className={`${BLOCK} ${BLOCK_PRESS} px-3 py-1.5 hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]`}
            onClick={showAll}
          >
            {t.hiddenShowAll(hiddenCount)}
          </button>
          <button
            data-testid="hidden_list_chip"
            className={`${BLOCK} ${BLOCK_PRESS} px-3 py-1.5 hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]`}
            onClick={() => {
              if (listOpen) setLeftPanel(null);
              else {
                setListMounted(true);
                setLeftPanel("hidden");
              }
            }}
          >
            {listOpen ? t.hiddenListClose : t.hiddenListOpen}
          </button>
        </div>
      )}
      {listMounted && (
        <HiddenNodesPanel
          open={listOpen}
          rows={hiddenRows()}
          onUnhide={unhideNode}
          onShowAll={showAll}
          onClose={() => setLeftPanel(null)}
          onClosed={() => setListMounted(false)}
        />
      )}
    </>
  );
}
