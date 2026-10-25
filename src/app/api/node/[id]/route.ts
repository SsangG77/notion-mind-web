import { NextRequest, NextResponse } from "next/server";
import { fetchNodeDetail } from "@/lib/notion";
import { demoDetail } from "@/features/demo/data";
import { callNotion } from "@/lib/notionSession";
import { pickLang } from "@/lib/i18n";
import { LANG_PARAM } from "@/lib/apiUrl";

// 노드 상세 — 속성, 수정일, 본문 미리보기 (사이드패널)
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    // 예시 화면(/demo)의 노드 — 로그인 없이 보는 화면이라 세션 검사보다 먼저 답한다
    const demo = demoDetail(id);
    if (demo) return NextResponse.json(demo);

    const kind = req.nextUrl.searchParams.get("kind") === "database" ? "database" : "page";
    // 속성 이름과 대체 제목이 응답에 포함되므로 화면 언어를 함께 넘긴다
    const lang = pickLang(req.nextUrl.searchParams.get(LANG_PARAM));
    const r = await callNotion(req, (token) => fetchNodeDetail(token, id, kind, lang));
    if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 401 });
    return NextResponse.json(r.data);
  } catch (e) {
    // 예외 메시지에는 노션 응답 본문이 섞여 나온다 — 밖으로는 고정 문자열만
    console.error("/api/node failed:", e);
    return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
  }
}
