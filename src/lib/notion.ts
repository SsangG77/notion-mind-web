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
