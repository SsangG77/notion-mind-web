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
  /** workspaceId 는 **계정에 매달린 연결**에서 온 값이다 — 지표 기록처럼 테넌트 키가 필요한 쪽은 이걸 쓴다.
   *  ⚠️ `nm_ws` 쿠키를 키로 쓰면 안 된다: 봉인이 없는 평문이라 호출자가 아무 값이나 넣을 수 있다 */
  | { ok: true; data: T; workspaceId: string }
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
    return { ok: true, data: await run(conn.accessToken), workspaceId: conn.workspaceId };
  } catch (e) {
    if (!(e instanceof NotionUnauthorized)) throw e;
  }

  if (!conn.refreshToken) return { ok: false, reason: "expired" };
  try {
    const token: TokenResponse = await refreshToken(conn.refreshToken);
    const data = await run(token.access_token);
    // 갱신된 쌍을 저장 — 다음 요청부터 바로 쓰이고, 실패해도 이번 응답은 돌려준다
    // refresh 모드 — 해제가 먼저 끝났으면 행이 없고, 그러면 아무것도 되살리지 않는다
    await saveConnection(userId, token, "refresh").catch((err) =>
      console.error("saveConnection after refresh failed:", err),
    );
    return { ok: true, data, workspaceId: conn.workspaceId };
  } catch {
    return { ok: false, reason: "expired" };
  }
}

/** 현재 요청의 계정 id — 서버 컴포넌트와 라우트가 같이 쓴다 */
export function currentUserId(cookieValue: string | undefined): string | null {
  return readUid(cookieValue);
}
