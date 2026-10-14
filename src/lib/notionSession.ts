import type { NextRequest } from "next/server";
import { NotionUnauthorized, refreshToken } from "./notion";
import { getConnection, saveConnection } from "./accounts";
import { readUid, UID_COOKIE } from "./session";
import type { TokenResponse } from "./notion";

/**
 * 노션 호출 — 토큰은 쿠키가 아니라 서버(notion_connections)에서 꺼낸다.
 * 그래서 어느 기기에서 들어와도 계정만 같으면 노션 화면을 다시 안 거친다.
 *
 * 401 이면 refresh_token 으로 갱신해 한 번 더 시도하고, 새 토큰 쌍을 DB 에 덮어쓴다.
 * 노션 문서가 "Store the token pair from each successful authorization response" 라고 명시한다.
 */
export type NotionCallResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "no_session" | "no_connection" | "expired" };

export async function callNotion<T>(
  req: NextRequest,
  run: (accessToken: string) => Promise<T>,
): Promise<NotionCallResult<T>> {
  const userId = readUid(req.cookies.get(UID_COOKIE)?.value);
  if (!userId) return { ok: false, reason: "no_session" };

  const conn = await getConnection(userId);
  if (!conn) return { ok: false, reason: "no_connection" };

  try {
    return { ok: true, data: await run(conn.accessToken) };
  } catch (e) {
    if (!(e instanceof NotionUnauthorized)) throw e;
  }

  if (!conn.refreshToken) return { ok: false, reason: "expired" };
  try {
    const token: TokenResponse = await refreshToken(conn.refreshToken);
    const data = await run(token.access_token);
    // 갱신된 쌍을 저장 — 다음 요청부터 바로 쓰이고, 실패해도 이번 응답은 돌려준다
    await saveConnection(userId, token).catch((err) =>
      console.error("saveConnection after refresh failed:", err),
    );
    return { ok: true, data };
  } catch {
    return { ok: false, reason: "expired" };
  }
}

/** 현재 요청의 계정 id — 서버 컴포넌트와 라우트가 같이 쓴다 */
export function currentUserId(cookieValue: string | undefined): string | null {
  return readUid(cookieValue);
}
