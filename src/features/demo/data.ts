import type { GraphItem } from "@/types/graph";

/**
 * 로그인 없이 보여 주는 예시 워크스페이스.
 *
 * 노션 API 를 거치지 않고 같은 형태(GraphItem)로 직접 적는다 — 조립과 배치는 실제 그래프와
 * 똑같은 코드를 탄다. 실제 팀이 쓰는 모양을 따르되 어느 회사의 자료도 아니다.
 */
const db = (id: string, title: string, parentId: string | null = "page-hq"): GraphItem => ({
  id,
  kind: "data_source",
  title,
  url: null,
  parentId,
  parentIsDb: false,
  dbId: id,
  relationIds: [],
});

const page = (
  id: string,
  title: string,
  parentId: string,
  relationIds: string[] = [],
  parentIsDb = true,
): GraphItem => ({ id, kind: "page", title, url: null, parentId, parentIsDb, dbId: null, relationIds });

export const DEMO_ITEMS: GraphItem[] = [
  // 워크스페이스 최상위 페이지와 그 아래 데이터베이스들
  { id: "page-hq", kind: "page", title: "Product Team", url: null, parentId: null, parentIsDb: false, dbId: null, relationIds: [] },
  db("db-projects", "Projects"),
  db("db-meetings", "Meetings"),
  db("db-clients", "Clients"),
  db("db-releases", "Releases"),
  db("db-docs", "Documents"),

  // 고객
  page("cl-northwind", "Northwind Trading", "db-clients"),
  page("cl-pinemark", "Pinemark Studio", "db-clients"),
  page("cl-vantage", "Vantage Logistics", "db-clients"),

  // 프로젝트 — 고객과 릴리스를 가리킨다
  page("pj-onboarding", "Onboarding revamp", "db-projects", ["cl-northwind", "rl-2-4", "doc-spec-onboarding"]),
  page("pj-billing", "Billing migration", "db-projects", ["cl-vantage", "rl-2-5", "doc-spec-billing"]),
  page("pj-mobile", "Mobile reader", "db-projects", ["cl-pinemark", "rl-3-0"]),
  page("pj-search", "Search rebuild", "db-projects", ["rl-3-0", "doc-rfc-search"]),
  page("pj-analytics", "Usage analytics", "db-projects", ["cl-northwind"]),

  // 회의 — 프로젝트와 고객을 가리킨다
  page("mt-kickoff-q3", "Q3 kickoff", "db-meetings", ["pj-onboarding", "pj-billing", "pj-mobile"]),
  page("mt-northwind-sync", "Northwind weekly sync", "db-meetings", ["cl-northwind", "pj-onboarding"]),
  page("mt-billing-review", "Billing migration review", "db-meetings", ["pj-billing", "cl-vantage"]),
  page("mt-design-crit", "Design critique", "db-meetings", ["pj-mobile"]),
  page("mt-retro-2-4", "Retro 2.4", "db-meetings", ["rl-2-4", "pj-onboarding"]),
  page("mt-search-scoping", "Search scoping", "db-meetings", ["pj-search", "doc-rfc-search"]),

  // 릴리스 — 프로젝트를 가리킨다
  page("rl-2-4", "2.4 Onboarding", "db-releases", ["pj-onboarding"]),
  page("rl-2-5", "2.5 Billing", "db-releases", ["pj-billing"]),
  page("rl-3-0", "3.0 Mobile and search", "db-releases", ["pj-mobile", "pj-search"]),

  // 문서 — 프로젝트를 가리킨다
  page("doc-spec-onboarding", "Spec: onboarding flow", "db-docs", ["pj-onboarding"]),
  page("doc-spec-billing", "Spec: billing migration", "db-docs", ["pj-billing"]),
  page("doc-rfc-search", "RFC: search ranking", "db-docs", ["pj-search"]),
  page("doc-brand", "Brand guidelines", "db-docs"),
  page("doc-handbook", "Team handbook", "db-docs"),

  // 어디에도 안 엮인 페이지 — 고아 노드 필터가 찾아내는 쪽
  { id: "pg-scratch", kind: "page", title: "Scratchpad", url: null, parentId: "page-hq", parentIsDb: false, dbId: null, relationIds: [] },
  { id: "pg-links", kind: "page", title: "Useful links", url: null, parentId: "page-hq", parentIsDb: false, dbId: null, relationIds: [] },
];
