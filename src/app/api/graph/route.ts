import { NextRequest, NextResponse } from "next/server";
import { searchPage } from "@/lib/notion";
import { callNotion } from "@/lib/notionSession";
import { planFor } from "@/lib/plan.server";
import { FREE_NODE_LIMIT } from "@/features/graph/lib/assembleGraph";
import { pickLang } from "@/lib/i18n";
import { LANG_PARAM } from "@/lib/apiUrl";
import { recordVisit } from "@/lib/analytics";
import { decrypt, encrypt } from "@/lib/crypto";

/**
 * 진행 횟수는 **서버가 센다**. 노션 커서와 배치 번호를 함께 봉인해 `nextCursor` 로 내주고
 * 되돌려 받을 때 풀어 쓴다 — 클라이언트가 보낸 숫자를 믿으면 상한 검사가 통째로 비활성화된다
 * (값을 빼면 0 으로 평가돼 비교가 거짓, 커서만 이어 돌리면 워크스페이스 전체를 받음).
 * 봉인은 세션 쿠키와 같은 `crypto.ts` 를 쓴다 — 새 의존성 없음.
 */
function sealCursor(notionCursor: string, batchIndex: number): string {
  return encrypt(JSON.stringify({ c: notionCursor, i: batchIndex }), "graph-cursor");
}

function openCursor(sealed: string | null): { cursor?: string; batchIndex: number } | null {
  if (!sealed) return { batchIndex: 0 }; // 첫 배치
  try {
    const { c, i } = JSON.parse(decrypt(sealed, "graph-cursor")) as { c: unknown; i: unknown };
    if (typeof c !== "string" || typeof i !== "number" || !Number.isFinite(i) || i < 0) return null;
    return { cursor: c, batchIndex: i };
  } catch {
    return null; // 위조, 손상, 키 교체 — 이어받을 수 없는 커서
  }
}

// 커서 단위 배치 응답 — 클라이언트가 반복 호출하며 그래프를 점진 조립
export async function GET(req: NextRequest) {
  try {
    const opened = openCursor(req.nextUrl.searchParams.get("cursor"));
    if (!opened) return NextResponse.json({ error: "bad_cursor" }, { status: 400 });
    const { cursor, batchIndex } = opened;
    // 첫 배치 = 그래프를 한 번 연 것 → 일별 활성 이용자 기록. 실패해도 그래프는 계속
    const workspaceId = req.cookies.get("nm_ws")?.value;
    if (!cursor && workspaceId) {
      await recordVisit(workspaceId).catch((e) => console.error("recordVisit failed:", e));
    }
    // 상한 다음 배치(초과 감지용 1페이지)까지는 허용, 그 뒤부터 차단
    if (batchIndex * 100 > FREE_NODE_LIMIT) {
      const plan = await planFor(req);
      if (plan === "free") return NextResponse.json({ items: [], nextCursor: null });
    }
    // 제목 없는 페이지의 대체 문구가 응답에 섞이므로 화면 언어를 함께 넘긴다
    const lang = pickLang(req.nextUrl.searchParams.get(LANG_PARAM));
    const r = await callNotion(req, (token) => searchPage(token, lang, cursor));
    if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 401 });
    return NextResponse.json({
      items: r.data.items,
      nextCursor: r.data.nextCursor ? sealCursor(r.data.nextCursor, batchIndex + 1) : null,
    });
  } catch (e) {
    // 예외 메시지에는 노션 응답 본문이 섞여 나온다 — 밖으로는 고정 문자열만
    console.error("/api/graph failed:", e);
    return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
  }
}
