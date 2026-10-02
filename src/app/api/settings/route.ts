import { NextRequest, NextResponse } from "next/server";
import { EMPTY_SETTINGS, getWorkspaceSettings, putWorkspaceSettings, type WorkspaceSettings } from "@/lib/billing";
import { planFor } from "@/lib/plan.server";

// Pro 전용 영구 설정. Free 는 GET 빈 값 / PUT 403 — 클라이언트는 세션 한정으로 동작
export async function GET(req: NextRequest) {
  const ws = req.cookies.get("nm_ws")?.value;
  if (!ws || (await planFor(req.cookies)) !== "pro") return NextResponse.json(EMPTY_SETTINGS);
  try {
    return NextResponse.json(await getWorkspaceSettings(ws));
  } catch (e) {
    console.error(e);
    return NextResponse.json(EMPTY_SETTINGS);
  }
}

export async function PUT(req: NextRequest) {
  const ws = req.cookies.get("nm_ws")?.value;
  if (!ws) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if ((await planFor(req.cookies)) !== "pro") return NextResponse.json({ error: "pro_only" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as Partial<WorkspaceSettings> | null;
  if (!body || !Array.isArray(body.hidden) || typeof body.pinned !== "object" || body.pinned === null) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  // 크기 상한 — 한 워크스페이스가 DB 를 무한히 키우지 못하게
  if (body.hidden.length > 20000 || Object.keys(body.pinned).length > 20000) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }
  await putWorkspaceSettings(ws, { hidden: body.hidden, pinned: body.pinned });
  return NextResponse.json({ ok: true });
}
