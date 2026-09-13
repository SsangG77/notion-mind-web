import type { GraphData, GraphEdge, GraphItem, GraphNode } from "@/types/graph";

export const FREE_NODE_LIMIT = 1000;

/**
 * 누적된 항목들로 그래프 데이터를 조립한다 (순수 함수 — 배치가 올 때마다 재호출).
 * - 항목은 최근 수정순으로 수신 → Free 상한 초과분은 노드에서 제외
 * - dbChild = DB 소속 페이지 / pageChild = 페이지 안의 페이지·DB / relation = 관계형 속성
 */
export function assembleGraph(items: GraphItem[], hasMore: boolean): GraphData {
  const capped = items.slice(0, FREE_NODE_LIMIT);
  const nodes: GraphNode[] = capped.map((it) => ({
    id: it.id,
    title: it.title,
    type: it.kind === "page" ? "page" : "database",
    parentId: it.parentId,
    url: it.url,
  }));
  const idSet = new Set(nodes.map((n) => n.id));
  // database id → 그 DB의 data_source 노드 id (database_id로만 참조되는 경우 해소 — wiki 등)
  const dbToDs = new Map<string, string>();
  for (const it of capped) {
    if (it.kind === "data_source" && it.dbId) dbToDs.set(it.dbId, it.id);
  }
  const resolveId = (id: string) => (idSet.has(id) ? id : (dbToDs.get(id) ?? id));

  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const pushEdge = (source: string, target: string, kind: GraphEdge["kind"]) => {
    if (!idSet.has(source) || !idSet.has(target) || source === target) return;
    const key = `${kind}:${source}:${target}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ source, target, kind });
  };

  for (const it of capped) {
    if (it.parentId) {
      pushEdge(resolveId(it.parentId), it.id, it.parentIsDb ? "dbChild" : "pageChild");
    }
    for (const rel of it.relationIds) pushEdge(it.id, rel, "relation");
  }

  return {
    nodes,
    edges,
    truncated: hasMore || items.length > FREE_NODE_LIMIT,
    total: items.length,
  };
}
