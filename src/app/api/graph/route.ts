import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto";
import { searchPage } from "@/lib/notion";
import { getPlan } from "@/lib/billing";
import { FREE_NODE_LIMIT } from "@/features/graph/lib/assembleGraph";
import { LANG_COOKIE, pickLang } from "@/lib/i18n";

// 커서 단위 배치 응답 — 클라이언트가 반복 호출하며 그래프를 점진 조립
export async function GET(req: NextRequest) {
  const tokenCookie = req.cookies.get("nm_token")?.value;
  if (!tokenCookie) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
    // Free 상한은 서버에서도 막음 — 클라이언트가 배치 번호(i)를 올리는 것만으로 더 못 받게
    const batchIndex = Number(req.nextUrl.searchParams.get("i") ?? 0);
    // 상한 다음 배치(초과 감지용 1페이지)까지는 허용, 그 뒤부터 차단
    if (batchIndex * 100 > FREE_NODE_LIMIT) {
      const plan = await getPlan(req.cookies.get("nm_ws")?.value);
      if (plan === "free") return NextResponse.json({ items: [], nextCursor: null });
    }
    // 제목 없는 페이지의 대체 문구가 응답에 섞이므로 화면 언어를 함께 넘긴다
    const lang = pickLang(req.cookies.get(LANG_COOKIE)?.value);
    const batch = await searchPage(decrypt(tokenCookie), lang, cursor);
    return NextResponse.json(batch);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown" },
      { status: 502 },
    );
  }
}
