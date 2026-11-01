import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/accounts";
import { getPlanInfo } from "@/lib/billing";
import { normalizeCode, redeemCode } from "@/lib/promo";
import { readUid, UID_COOKIE } from "@/lib/session";

/**
 * 이벤트 Pro 체험 코드 사용.
 *
 * ⚠️ 워크스페이스는 `getConnection` 이 돌려준 값만 쓴다 — `nm_ws` 쿠키는 평문이라
 * 호출자가 남의 워크스페이스를 적어 넣고 1회 제한을 비껴갈 수 있다.
 */
export async function POST(req: NextRequest) {
  const userId = readUid(req.cookies.get(UID_COOKIE)?.value);
  if (!userId) return NextResponse.json({ ok: false, reason: "no_login" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { code?: unknown } | null;
  const code = normalizeCode(typeof body?.code === "string" ? body.code.slice(0, 40) : "");
  if (!code) return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });

  try {
    const conn = await getConnection(userId);
    if (!conn) return NextResponse.json({ ok: false, reason: "no_login" }, { status: 400 });
    // 결제 구독자가 체험 코드를 태우면 한 달이 통째로 날아간다 — 쓰기 전에 막는다.
    // 여기서만 `planFor` 가 아니라 실제 구독 상태를 본다 — 개발 모드로 켜 둔 Pro 때문에 코드 입력이 막히면 안 된다
    const { plan, promoUntil } = await getPlanInfo(userId);
    if (plan === "pro" && !promoUntil) {
      return NextResponse.json({ ok: false, reason: "already_pro" }, { status: 409 });
    }

    const result = await redeemCode(code, userId, conn.workspaceId);
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  } catch (e) {
    console.error("promo redeem failed:", e);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}
