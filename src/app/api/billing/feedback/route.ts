import { NextRequest, NextResponse } from "next/server";
import { saveCancellationFeedback } from "@/lib/billing";
import { readUid, UID_COOKIE } from "@/lib/session";

// 해지 사유 저장. 실패해도 해지 흐름을 막지 않으므로 항상 200 으로 끝낸다
export async function POST(req: NextRequest) {
  const userId = readUid(req.cookies.get(UID_COOKIE)?.value);
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const body = (await req.json()) as { reason?: unknown; detail?: unknown };
    const reason = typeof body.reason === "string" ? body.reason.slice(0, 80) : null;
    const detail = typeof body.detail === "string" ? body.detail.slice(0, 1000) : null;
    if (reason || detail) await saveCancellationFeedback(userId, reason, detail);
  } catch (e) {
    console.error("cancellation feedback:", e);
  }
  return NextResponse.json({ ok: true });
}
