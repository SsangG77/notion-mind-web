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

/** 노드 상세 패널용 — 속성 한 줄 */
export interface NodeProperty {
  name: string;
  /** 사람이 읽는 값. 빈 값이면 패널에서 생략 */
  value: string;
}

/** /api/node/[id] 응답 */
export interface NodeDetail {
  id: string;
  title: string;
  type: NodeType;
  url: string | null;
  /** 마지막 수정 시각 (ISO) */
  lastEdited: string | null;
  properties: NodeProperty[];
  /** 본문 미리보기 — 블록 평문 줄 */
  excerpt: string[];
  /** 본문이 잘렸는지 */
  excerptTruncated: boolean;
}
