import type Graph from "graphology";

/**
 * 고아 노드 보기 — 관계형 속성으로 아무 데도 연결되지 않은 노드만 남긴다.
 *
 * 왜 relation 만 세는가: DB 안의 페이지는 소속선(dbChild)이 항상 하나 붙으므로 차수로 세면
 * 고아가 영영 안 나온다. 사용자가 찾고 싶은 건 "어딘가에 엮였어야 하는데 안 엮인 것"이고,
 * 그 연결은 관계형 속성이다.
 *
 * 숨김은 기존 `hidden` 속성을 그대로 쓴다(렌더, 히트 판정, 점선 레이어가 이미 존중함).
 * 사용자가 직접 숨긴 노드와 섞이면 안 되므로 필터가 숨긴 것만 `filteredOut` 으로 표시해 두고,
 * 끌 때 그 표시가 있는 것만 되돌린다.
 */
export function countRelations(graph: Graph, node: string): number {
  let n = 0;
  graph.forEachEdge(node, (_e, attr) => {
    if (attr.kind === "relation") n++;
  });
  return n;
}

export const isOrphan = (graph: Graph, node: string): boolean => countRelations(graph, node) === 0;

/** 고아가 아닌 노드를 숨긴다. 이미 사용자가 숨긴 노드는 건드리지 않는다 */
export function applyOrphanFilter(graph: Graph) {
  graph.forEachNode((id, a) => {
    if (isOrphan(graph, id)) return;
    if (a.hidden) return; // 사용자가 숨긴 것 — 우리 소관이 아니다
    graph.setNodeAttribute(id, "hidden", true);
    graph.setNodeAttribute(id, "filteredOut", true);
  });
}

/** 필터가 숨긴 것만 되돌린다 */
export function clearOrphanFilter(graph: Graph) {
  graph.forEachNode((id, a) => {
    if (!a.filteredOut) return;
    graph.removeNodeAttribute(id, "hidden");
    graph.removeNodeAttribute(id, "filteredOut");
  });
}

/** 지금 고아인 노드 수 — 필터를 켜기 전에 몇 개가 남는지 보여주려고 */
export function orphanCount(graph: Graph): number {
  let n = 0;
  graph.forEachNode((id) => {
    if (isOrphan(graph, id)) n++;
  });
  return n;
}
