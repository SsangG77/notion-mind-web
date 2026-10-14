import { NextRequest, NextResponse } from "next/server";
import { deleteConnection } from "@/lib/accounts";
import { readUid, UID_COOKIE } from "@/lib/session";

/**
 * 노션 연결 해제 — 서버에 보관하던 토큰 쌍을 즉시 지운다.
 * 처리방침이 "설정 패널에서 연결을 해제하면 서버에서 즉시 삭제" 라고 약속하는 지점이다.
 * 계정(구글 로그인)은 남겨 둔다 — 다시 연결하면 같은 계정으로 이어진다.
 */
export async function POST(req: NextRequest) {
  const userId = readUid(req.cookies.get(UID_COOKIE)?.value);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await deleteConnection(userId);
  } catch (e) {
    console.error("deleteConnection failed:", e);
    return NextResponse.json({ error: "delete_failed" }, { status: 502 });
  }
  const res = NextResponse.json({ ok: true });
  // 워크스페이스에 묶인 값도 같이 치운다 — 남겨두면 다음 로그인에서 엉뚱한 요금제로 보인다
  res.cookies.delete("nm_ws");
  res.cookies.delete("nm_workspace");
  return res;
}
