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

// ---------- 그래프 수집 ----------

import type { GraphBatch, GraphItem } from "@/types/graph";

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
 * 노션 검색 1페이지(최대 100개)를 그래프 항목으로 줄여 반환 — 점진 로딩 단위.
 * 최근 수정순 정렬. 그래프 조립(엣지 생성)은 클라이언트 순수 함수가 담당.
 */
export async function searchPage(accessToken: string, cursor?: string): Promise<GraphBatch> {
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

  const items: GraphItem[] = [];
  for (const it of data.results) {
    if (it.object !== "page" && it.object !== "data_source") continue;
    const relationIds: string[] = [];
    if (it.object === "page") {
      for (const prop of Object.values(it.properties ?? {})) {
        if (prop.type === "relation") {
          for (const rel of prop.relation ?? []) relationIds.push(rel.id);
        }
      }
    }
    items.push({
      id: it.id,
      kind: it.object,
      title: itemTitle(it),
      url: it.url ?? null,
      parentId: itemParentId(it),
      parentIsDb:
        it.object === "page" && !!(it.parent?.data_source_id ?? it.parent?.database_id),
      dbId: it.object === "data_source" ? (it.parent?.database_id ?? null) : null,
      relationIds,
    });
  }
  return { items, nextCursor: data.has_more ? data.next_cursor : null };
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

// ---------- 노드 상세 (사이드패널) ----------

import type { NodeDetail, NodeProperty } from "@/types/graph";

const EXCERPT_LIMIT = 24; // 본문 미리보기 줄 수

function api(accessToken: string, path: string) {
  return fetch(`${NOTION_API}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Notion-Version": NOTION_VERSION,
    },
  });
}

function plain(rich: RichText[] | undefined): string {
  return (rich ?? []).map((t) => t.plain_text).join("");
}

/** 속성 값을 사람이 읽는 한 줄로 — 빈 값은 "" */
function propertyValue(prop: Record<string, unknown>): string {
  const type = prop.type as string;
  const v = prop[type];
  switch (type) {
    case "title":
    case "rich_text":
      return plain(v as RichText[]);
    case "number":
      return v == null ? "" : String(v);
    case "select":
    case "status":
      return (v as { name?: string } | null)?.name ?? "";
    case "multi_select":
      return ((v as Array<{ name: string }>) ?? []).map((o) => o.name).join(", ");
    case "date": {
      const d = v as { start?: string; end?: string } | null;
      if (!d?.start) return "";
      return d.end ? `${d.start} → ${d.end}` : d.start;
    }
    case "people":
      return ((v as Array<{ name?: string }>) ?? []).map((p) => p.name ?? "사용자").join(", ");
    case "checkbox":
      return v ? "✓" : "—";
    case "url":
    case "email":
    case "phone_number":
      return (v as string) ?? "";
    case "relation":
      return ((v as unknown[]) ?? []).length ? `${((v as unknown[]) ?? []).length}개 연결` : "";
    case "formula": {
      const f = v as { type: string; [k: string]: unknown };
      const inner = f?.[f?.type];
      return inner == null ? "" : String(inner);
    }
    case "created_time":
    case "last_edited_time":
      return (v as string) ?? "";
    default:
      return "";
  }
}

/** 블록 하나를 평문 한 줄로 — 텍스트 계열만, 나머지는 빈 문자열 */
function blockText(block: Record<string, unknown>): string {
  const type = block.type as string;
  const body = block[type] as { rich_text?: RichText[] } | undefined;
  const text = plain(body?.rich_text);
  if (!text) return "";
  if (type === "bulleted_list_item" || type === "numbered_list_item") return `• ${text}`;
  if (type === "to_do") return `☐ ${text}`;
  if (type.startsWith("heading")) return text;
  return text;
}

/**
 * 노드 상세 — 속성·수정일·본문 미리보기.
 * rate limit 평균 3req/s → 호출 2회(메타 + 블록)로 제한.
 */
export async function fetchNodeDetail(
  accessToken: string,
  id: string,
  kind: "page" | "database",
): Promise<NodeDetail> {
  const metaRes = await api(accessToken, kind === "page" ? `/pages/${id}` : `/data_sources/${id}`);
  if (!metaRes.ok) {
    throw new Error(`detail failed: ${metaRes.status} ${await metaRes.text()}`);
  }
  const meta = (await metaRes.json()) as {
    url?: string;
    last_edited_time?: string;
    title?: RichText[];
    description?: RichText[];
    properties?: Record<string, Record<string, unknown>>;
  };

  let title = "무제";
  const properties: NodeProperty[] = [];
  if (kind === "page") {
    for (const [name, prop] of Object.entries(meta.properties ?? {})) {
      if (prop.type === "title") {
        title = plain(prop.title as RichText[]) || "무제";
        continue;
      }
      const value = propertyValue(prop);
      if (value) properties.push({ name, value });
    }
  } else {
    title = plain(meta.title) || "무제";
    const desc = plain(meta.description);
    if (desc) properties.push({ name: "설명", value: desc });
    const schema = Object.keys(meta.properties ?? {});
    if (schema.length) properties.push({ name: "속성", value: schema.join(", ") });
  }

  // 본문 — DB(data_source)는 자식 블록이 없으므로 페이지만 조회
  const excerpt: string[] = [];
  let excerptTruncated = false;
  if (kind === "page") {
    const blockRes = await api(accessToken, `/blocks/${id}/children?page_size=${EXCERPT_LIMIT + 1}`);
    if (blockRes.ok) {
      const data = (await blockRes.json()) as {
        results: Array<Record<string, unknown>>;
        has_more: boolean;
      };
      for (const b of data.results) {
        const line = blockText(b);
        if (line) excerpt.push(line);
      }
      excerptTruncated = data.has_more || excerpt.length > EXCERPT_LIMIT;
      if (excerpt.length > EXCERPT_LIMIT) excerpt.length = EXCERPT_LIMIT;
    }
  }

  return {
    id,
    title,
    type: kind,
    url: meta.url ?? null,
    lastEdited: meta.last_edited_time ?? null,
    properties,
    excerpt,
    excerptTruncated,
  };
}
