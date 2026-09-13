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

/** 노션 검색 결과를 그래프 조립에 필요한 최소 형태로 줄인 항목 (API 응답 단위) */
export interface GraphItem {
  id: string;
  kind: "page" | "data_source";
  title: string;
  url: string | null;
  /** 부모 id — page: data_source/database/page/block, data_source: DB가 놓인 페이지 */
  parentId: string | null;
  /** page 전용: 부모가 DB(data_source/database)인지 */
  parentIsDb: boolean;
  /** data_source 전용: 소속 database id (database_id 참조 해소용) */
  dbId: string | null;
  /** page 전용: relation 속성이 가리키는 페이지 id들 */
  relationIds: string[];
}

/** /api/graph 배치 응답 */
export interface GraphBatch {
  items: GraphItem[];
  nextCursor: string | null;
}
