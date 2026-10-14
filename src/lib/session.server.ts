import { cookies } from "next/headers";
import { getConnection } from "./accounts";
import { readUid, UID_COOKIE } from "./session";

/** 이 요청의 계정 id — 로그인 안 했으면 null */
export async function currentUserId(): Promise<string | null> {
  return readUid((await cookies()).get(UID_COOKIE)?.value);
}

export type SessionState = "anonymous" | "no_connection" | "ready";

/**
 * 화면 게이트용 상태.
 * - anonymous: 구글 로그인 전
 * - no_connection: 로그인은 했지만 노션을 아직 연결 안 함
 * - ready: 바로 그래프로
 */
export async function sessionState(): Promise<SessionState> {
  const userId = await currentUserId();
  if (!userId) return "anonymous";
  try {
    return (await getConnection(userId)) ? "ready" : "no_connection";
  } catch (e) {
    // DB 장애로 로그인 화면에 갇히지 않게 — 노션 연결 화면으로 보낸다
    console.error("sessionState failed:", e);
    return "no_connection";
  }
}
