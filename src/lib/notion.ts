// 노션 API Service — 외부 접근은 이 파일을 통해서만.
// 공식 문서: developers.notion.com/reference (OAuth: POST /v1/oauth/token)

const NOTION_API = "https://api.notion.com/v1";
// View API 문서(retrieve-a-view)가 명시한 최신 버전. search 응답 호환은 슬라이스 1 실행에서 검증.
const NOTION_VERSION = "2026-03-11";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export function getAuthorizeUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: env("NOTION_CLIENT_ID"),
    response_type: "code",
    owner: "user",
    redirect_uri: env("NOTION_REDIRECT_URI"),
    state,
  });
  return `${NOTION_API}/oauth/authorize?${p}`;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string | null;
  bot_id: string;
  workspace_id: string;
  workspace_name?: string;
  workspace_icon?: string;
}

export async function exchangeCode(code: string): Promise<TokenResponse> {
  const basic = Buffer.from(
    `${env("NOTION_CLIENT_ID")}:${env("NOTION_CLIENT_SECRET")}`,
  ).toString("base64");
  const res = await fetch(`${NOTION_API}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: env("NOTION_REDIRECT_URI"),
    }),
  });
  if (!res.ok) {
    throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// ---------- 그래프 수집 (슬라이스 2) ----------

import type { GraphData, GraphEdge, GraphNode } from "@/types/graph";

interface RichText {
  plain_text: string;
}

interface ParentRef {
  type: string;
  database_id?: string;
  data_source_id?: string;
  page_id?: string;
  block_id?: string;
}

interface SearchItem {
  object: string; // "page" | "data_source" (2025-09-03+ 버전은 database 객체를 반환하지 않음)
  id: string;
  url?: string;
  title?: RichText[]; // data_source
  parent?: ParentRef;
  database_parent?: ParentRef; // data_source 전용: 소속 DB가 놓인 부모(페이지·블록·워크스페이스)
  properties?: Record<
    string,
    {
      type: string;
      title?: RichText[];
      relation?: Array<{ id: string }>;
    }
  >;
}

const FREE_NODE_LIMIT = 1000;

function itemTitle(item: SearchItem): string {
  if (item.object === "page") {
    for (const prop of Object.values(item.properties ?? {})) {
      if (prop.type === "title") {
        return prop.title?.map((t) => t.plain_text).join("") || "무제";
      }
    }
    return "무제";
  }
  return item.title?.map((t) => t.plain_text).join("") || "무제";
}

// data_source_id 우선 — DB 소속 페이지의 parent에는 둘 다 오지만 노드는 data_source 기준
function parentRefId(p: ParentRef | undefined): string | null {
  if (!p) return null;
  return p.data_source_id ?? p.database_id ?? p.page_id ?? p.block_id ?? null;
}

function itemParentId(item: SearchItem): string | null {
  // data_source의 parent는 소속 database(노드 아님) — 그 DB가 놓인 페이지를 부모로 사용
  if (item.object === "data_source") return parentRefId(item.database_parent);
  return parentRefId(item.parent);
}

/**
 * 워크스페이스 전체를 그래프 데이터로 수집.
 * - 최근 수정순 정렬 → Free 상한 1,000개 초과분은 잘림 (제품 규칙)
 * - 계층 엣지 = parent 관계 / relation 엣지 = 페이지 relation 속성 (search 응답에 포함)
 * - rate limit 평균 3req/s — 순차 호출로 자연 준수
 */
export async function fetchGraph(accessToken: string): Promise<GraphData> {
  const items: SearchItem[] = [];
  let cursor: string | undefined;
  let total = 0;
  // 상한 1,000 + 초과 감지용 1페이지 여유 = 최대 11페이지
  for (let i = 0; i < 11; i++) {
    const res = await fetch(`${NOTION_API}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 100,
        sort: { direction: "descending", timestamp: "last_edited_time" },
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
    });
    if (!res.ok) {
      throw new Error(`search failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as {
      results: SearchItem[];
      has_more: boolean;
      next_cursor: string | null;
    };
    total += data.results.length;
    for (const r of data.results) {
      if (items.length < FREE_NODE_LIMIT) items.push(r);
    }
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }

  // 검색은 page + data_source만 반환 — data_source가 곧 DB 노드
  const nodes: GraphNode[] = items
    .filter((it) => it.object === "page" || it.object === "data_source")
    .map((it) => ({
      id: it.id,
      title: itemTitle(it),
      type: it.object === "page" ? "page" : "database",
      parentId: itemParentId(it),
      url: it.url ?? null,
    }));
  const idSet = new Set(nodes.map((n) => n.id));
  // database id → 그 DB의 data_source 노드 id (database_id로만 참조되는 경우 해소용 — wiki 등)
  const dbToDs = new Map<string, string>();
  for (const it of items) {
    if (it.object === "data_source" && it.parent?.database_id) {
      dbToDs.set(it.parent.database_id, it.id);
    }
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

  for (const it of items) {
    if (it.object !== "page" && it.object !== "data_source") continue;
    const rawParent = itemParentId(it);
    if (rawParent) {
      // 페이지의 부모가 data_source/database면 DB 소속, 그 외(페이지·블록·DB 자체)는 페이지 소속
      const isDbMember =
        it.object === "page" && !!(it.parent?.data_source_id ?? it.parent?.database_id);
      pushEdge(resolveId(rawParent), it.id, isDbMember ? "dbChild" : "pageChild");
    }
    if (it.object === "page") {
      for (const prop of Object.values(it.properties ?? {})) {
        if (prop.type === "relation") {
          for (const rel of prop.relation ?? []) pushEdge(it.id, rel.id, "relation");
        }
      }
    }
  }

  return { nodes, edges, truncated: total > FREE_NODE_LIMIT, total };
}

/** 워크스페이스에서 접근 가능한 페이지·DB 개수를 센다 (tracer-bullet 검증용). */
export async function countAccessibleItems(
  accessToken: string,
): Promise<{ pages: number; databases: number }> {
  let pages = 0;
  let databases = 0;
  let cursor: string | undefined;
  // rate limit 평균 3req/s — 순차 호출로 자연 준수. 상한 20페이지(≈2,000개)로 방어.
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`${NOTION_API}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    if (!res.ok) {
      throw new Error(`search failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as {
      results: Array<{ object: string }>;
      has_more: boolean;
      next_cursor: string | null;
    };
    for (const r of data.results) {
      if (r.object === "page") pages++;
      else if (r.object === "database" || r.object === "data_source") databases++;
    }
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return { pages, databases };
}
