import { NextRequest, NextResponse } from "next/server";
import { EMPTY_SETTINGS, getWorkspaceSettings, putWorkspaceSettings, type WorkspaceSettings } from "@/lib/billing";
import { planFor } from "@/lib/plan.server";
import { getConnection } from "@/lib/accounts";
import { readUid, UID_COOKIE } from "@/lib/session";

/**
 * 설정 행의 테넌트 키는 **계정에 매달린 연결**에서만 온다.
 * ⚠️ `nm_ws` 쿠키로 고르면 안 된다 — 봉인이 없는 평문이라 호출자가 아무 워크스페이스나 적어 넣을 수 있고,
 * Supabase 는 service 키로 접근하므로 DB 층에서도 안 막힌다(RLS 정책 없음).
 * 두 핸들러가 다시 갈라지지 않게 조회는 이 함수 하나를 쓴다.
 */
async function callerWorkspace(req: NextRequest): Promise<string | null> {
  const userId = readUid(req.cookies.get(UID_COOKIE)?.value);
  if (!userId) return null;
  try {
    return (await getConnection(userId))?.workspaceId ?? null;
  } catch (e) {
    console.error(e); // 조회 실패를 남의 워크스페이스로 떨어뜨리지 않는다
    return null;
  }
}

// Pro 전용 영구 설정. Free 는 GET 빈 값 / PUT 403 — 클라이언트는 세션 한정으로 동작
export async function GET(req: NextRequest) {
  const ws = await callerWorkspace(req);
  if (!ws || (await planFor(req)) !== "pro") return NextResponse.json(EMPTY_SETTINGS);
  try {
    return NextResponse.json(await getWorkspaceSettings(ws));
  } catch (e) {
    console.error(e);
    return NextResponse.json(EMPTY_SETTINGS);
  }
}

export async function PUT(req: NextRequest) {
  const ws = await callerWorkspace(req);
  if (!ws) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if ((await planFor(req)) !== "pro") return NextResponse.json({ error: "pro_only" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as Partial<WorkspaceSettings> | null;
  if (
    !body ||
    !Array.isArray(body.hidden) ||
    typeof body.pinned !== "object" ||
    body.pinned === null ||
    typeof body.autoSync !== "boolean"
  ) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  // 크기 상한 — 한 워크스페이스가 DB 를 무한히 키우지 못하게
  if (body.hidden.length > 20000 || Object.keys(body.pinned).length > 20000) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }
  await putWorkspaceSettings(ws, { hidden: body.hidden, pinned: body.pinned, autoSync: body.autoSync });
  return NextResponse.json({ ok: true });
}
