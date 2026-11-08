import type Graph from "graphology";

/**
 * 그래프 보기 거르기 — 필터 패널의 토글, DB 접기, "엮인 것만 보기"를 한 곳에서 계산한다.
 *
 * 숨김은 기존 `hidden` 속성을 그대로 쓴다(렌더, 히트 판정, 점선 레이어가 이미 존중함).
 * 사용자가 직접 숨긴 노드와 섞이면 안 되므로 필터가 숨긴 것만 `filteredOut` 으로 표시해 두고,
 * 다시 계산할 때 그 표시가 있는 것만 되돌린다. 사용자가 숨긴 노드는 건드리지 않는다.
 */
export interface FilterState {
  /** DB 노드 보기 */
  showDb: boolean;
  /** 페이지 노드 보기 */
  showPage: boolean;
  /** 관계형으로 아무 데도 안 엮인 노드만 */
  orphansOnly: boolean;
  /** 소속선(DB 안 페이지, 페이지 안 페이지와 DB) 보기 — 끄면 관계형 점선만 남음 */
  showHierarchy: boolean;
  /** 접은 DB — 안의 페이지를 감춘다(DB 노드는 남김) */
  collapsed: ReadonlySet<string>;
  /** 이 노드와 바로 엮인 것만 보기 */
  focus: string | null;
}

export const DEFAULT_FILTER: FilterState = {
  showDb: true,
  showPage: true,
  orphansOnly: false,
  showHierarchy: true,
  collapsed: new Set(),
  focus: null,
};

/**
 * 왜 relation 만 세는가: DB 안의 페이지는 소속선(dbChild)이 항상 하나 붙으므로 차수로 세면
 * 고아가 영영 안 나온다. 사용자가 찾고 싶은 건 "어딘가에 엮였어야 하는데 안 엮인 것"이고,
 * 그 연결은 관계형 속성이다.
 */
export function countRelations(graph: Graph, node: string): number {
  let n = 0;
  graph.forEachEdge(node, (_e, attr) => {
    if (attr.kind === "relation") n++;
  });
  return n;
}

export const isOrphan = (graph: Graph, node: string): boolean => countRelations(graph, node) === 0;

/** 지금 고아인 노드 수 — 필터를 켜기 전에 몇 개가 남는지 보여주려고 */
export function orphanCount(graph: Graph): number {
  let n = 0;
  graph.forEachNode((id) => {
    if (isOrphan(graph, id)) n++;
  });
  return n;
}

/** 이 페이지가 들어 있는 DB (소속선 dbChild 의 출발점). 없으면 null */
export function parentDb(graph: Graph, node: string): string | null {
  let db: string | null = null;
  graph.forEachInEdge(node, (_e, attr, source) => {
    if (attr.kind === "dbChild") db = source;
  });
  return db;
}

/** DB 안의 페이지 수 — 접기 메뉴에 몇 개가 숨는지 보여주려고 */
export function dbChildCount(graph: Graph, db: string): number {
  let n = 0;
  graph.forEachOutEdge(db, (_e, attr) => {
    if (attr.kind === "dbChild") n++;
  });
  return n;
}

function passes(graph: Graph, id: string, type: unknown, s: FilterState): boolean {
  const focus = s.focus && graph.hasNode(s.focus) ? s.focus : null;
  if (focus === id) return true; // 기준 노드는 항상 보인다 — 무엇과 엮였는지 보려고 켠 것
  if (focus && !graph.areNeighbors(id, focus)) return false;
  if (type === "database" ? !s.showDb : !s.showPage) return false;
  if (s.orphansOnly && !isOrphan(graph, id)) return false;
  if (s.collapsed.size > 0) {
    const db = parentDb(graph, id);
    if (db && s.collapsed.has(db)) return false;
  }
  return true;
}

/** 상태대로 다시 거른다. 노드가 추가될 때마다 불러도 되도록 결과가 같으면 아무것도 안 바꾼다 */
export function applyFilters(graph: Graph, s: FilterState) {
  graph.forEachNode((id, a) => {
    if (a.hidden && !a.filteredOut) return; // 사용자가 숨긴 것 — 우리 소관이 아니다
    const keep = passes(graph, id, a.nodeType, s);
    if (!keep && !a.filteredOut) {
      graph.setNodeAttribute(id, "hidden", true);
      graph.setNodeAttribute(id, "filteredOut", true);
    } else if (keep && a.filteredOut) {
      graph.removeNodeAttribute(id, "hidden");
      graph.removeNodeAttribute(id, "filteredOut");
    }
  });
  // relation 은 원래 WebGL 에서 숨기고 점선 레이어가 그린다 — 소속선만 켜고 끈다
  const hideHierarchy = !s.showHierarchy;
  graph.forEachEdge((e, a) => {
    if (a.kind === "relation") return;
    if (!!a.hidden !== hideHierarchy) graph.setEdgeAttribute(e, "hidden", hideHierarchy);
  });
}
