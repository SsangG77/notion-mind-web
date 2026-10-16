import type { GraphItem, NodeDetail } from "@/types/graph";

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

/** 상세 패널 한 줄 — [속성 이름, 값] */
type Props = [string, string][];

/**
 * 상세 패널 내용 — 로그인이 없어 노션 API 를 못 타므로 같은 형태를 여기서 만든다.
 * 워크스페이스 안의 글이라 화면 언어를 따르지 않는다(실제 노션 데이터도 번역되지 않는다).
 */
const DETAIL: Record<string, { props?: Props; body?: string[] }> = {
  "page-hq": { body: ["Home for the product team. Everything under it is a database."] },
  "db-projects": { body: ["Every active project, one row each, with the release it ships in."] },
  "db-meetings": { body: ["Meeting notes. Each one points at the projects and clients it covered."] },
  "db-clients": { body: ["Accounts we work with. Projects and meetings link back here."] },
  "db-releases": { body: ["Shipped and planned releases, and what goes into each one."] },
  "db-docs": { body: ["Specs, RFCs and reference pages."] },

  "cl-northwind": {
    props: [["Plan", "Enterprise"], ["Owner", "Dana Whitfield"], ["Renewal", "March"]],
    body: [
      "Four seats on a shared workspace, main contact is their ops lead.",
      "Asked for onboarding to be rebuilt before the renewal call.",
    ],
  },
  "cl-pinemark": {
    props: [["Plan", "Team"], ["Owner", "Priya Raman"]],
    body: [
      "Design studio of six, came in through the mobile beta.",
      "Wants read-only access for freelancers.",
    ],
  },
  "cl-vantage": {
    props: [["Plan", "Enterprise"], ["Owner", "Dana Whitfield"]],
    body: [
      "Billing runs through the legacy invoice flow we are migrating off.",
      "Finance reviews every change before rollout.",
    ],
  },

  "pj-onboarding": {
    props: [["Status", "In review"], ["Owner", "Mira Olsen"], ["Target", "2.4"]],
    body: [
      "First-run flow rebuilt around a single checklist.",
      "Waiting on copy review, everything else is merged.",
    ],
  },
  "pj-billing": {
    props: [["Status", "In progress"], ["Owner", "Theo Lang"], ["Target", "2.5"]],
    body: ["Moving invoices off the legacy processor.", "Vantage is the pilot account."],
  },
  "pj-mobile": {
    props: [["Status", "In progress"], ["Owner", "Dana Whitfield"], ["Target", "3.0"]],
    body: ["Read-only mobile view with an offline cache.", "Critique notes are in the linked meeting."],
  },
  "pj-search": {
    props: [["Status", "Planning"], ["Owner", "Mira Olsen"], ["Target", "3.0"]],
    body: ["Ranking rewrite, scoped in the linked RFC.", "Starts once billing ships."],
  },
  "pj-analytics": {
    props: [["Status", "Backlog"], ["Owner", "Theo Lang"]],
    body: ["Per-workspace usage counts for account reviews.", "No owner time until 3.0."],
  },

  "mt-kickoff-q3": {
    props: [["Attendees", "Mira, Theo, Dana"]],
    body: ["Quarter agreed on three projects: onboarding, billing, mobile.", "Search stays in planning."],
  },
  "mt-northwind-sync": {
    props: [["Attendees", "Dana, Northwind ops"]],
    body: ["Walked through the new onboarding checklist.", "They want to see it before the renewal call."],
  },
  "mt-billing-review": {
    props: [["Attendees", "Theo, finance"]],
    body: ["Invoice mapping reviewed line by line.", "Two cases left open: refunds and partial periods."],
  },
  "mt-design-crit": {
    props: [["Attendees", "Dana, Priya"]],
    body: ["Reviewed the mobile reader screens.", "The offline state needs a clearer empty view."],
  },
  "mt-retro-2-4": {
    props: [["Attendees", "Mira, Theo, Dana"]],
    body: [
      "2.4 shipped a week late, all of it waiting in copy review.",
      "Action: copy review starts from the spec, not the build.",
    ],
  },
  "mt-search-scoping": {
    props: [["Attendees", "Mira, Theo"]],
    body: ["Scoped the ranking work against the RFC.", "Ship without personalization first."],
  },

  "rl-2-4": { props: [["Status", "Shipped"]], body: ["Onboarding revamp and the fixes behind it."] },
  "rl-2-5": { props: [["Status", "In progress"]], body: ["Billing migration, Vantage first."] },
  "rl-3-0": { props: [["Status", "Planned"]], body: ["Mobile reader and the search rebuild."] },

  "doc-spec-onboarding": {
    props: [["Owner", "Mira Olsen"], ["Status", "Approved"]],
    body: ["One checklist replaces the four-step wizard.", "Empty states are specified per step."],
  },
  "doc-spec-billing": {
    props: [["Owner", "Theo Lang"], ["Status", "In review"]],
    body: ["Invoice mapping between the old and the new processor.", "Refund handling is still open."],
  },
  "doc-rfc-search": {
    props: [["Owner", "Mira Olsen"], ["Status", "Draft"]],
    body: ["Title-weighted ranking before any personalization.", "Open question: pages with no body text."],
  },
  "doc-brand": {
    props: [["Owner", "Priya Raman"], ["Status", "Current"]],
    body: ["Logo, colour and type rules for the product surfaces."],
  },
  "doc-handbook": {
    props: [["Owner", "Dana Whitfield"]],
    body: ["How the team works: planning, review, release.", "Rewritten at the end of each quarter."],
  },

  "pg-scratch": { body: ["Loose notes that never got filed anywhere."] },
  "pg-links": { body: ["Bookmarks. Nothing links to it, which is what the filter finds."] },
};

/** 예시 노드의 상세 — 모르는 id 면 null(= 로그인한 사용자의 실제 노션 노드) */
export function demoDetail(id: string): NodeDetail | null {
  const i = DEMO_ITEMS.findIndex((it) => it.id === id);
  if (i < 0) return null;
  const item = DEMO_ITEMS[i];
  const d = DETAIL[id] ?? {};
  // 고정 날짜를 적으면 해마다 낡으므로 오늘 기준으로 흩뿌린다
  const daysAgo = ((i * 5) % 26) + 1;
  return {
    id,
    title: item.title,
    type: item.kind === "data_source" ? "database" : "page",
    url: null,
    lastEdited: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
    properties: (d.props ?? []).map(([name, value]) => ({ name, value })),
    excerpt: d.body ?? [],
    excerptTruncated: false,
  };
}
