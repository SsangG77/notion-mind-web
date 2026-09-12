export type NodeType = "page" | "database";

export interface GraphNode {
  id: string;
  title: string;
  type: NodeType;
  parentId: string | null;
  url: string | null;
}

// dbChild = DB 소속 페이지 / pageChild = 페이지 안의 페이지·DB / relation = DB 관계형 속성
export type EdgeKind = "dbChild" | "pageChild" | "relation";

export interface GraphEdge {
  source: string;
  target: string;
  kind: EdgeKind;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Free 상한(1,000) 초과로 잘렸는지 */
  truncated: boolean;
  /** 잘리기 전 수집된 총 개수 */
  total: number;
}
