import { NextRequest, NextResponse } from "next/server";
import { fetchNodeDetail } from "@/lib/notion";
import { callNotion } from "@/lib/notionSession";
import { pickLang } from "@/lib/i18n";
import { LANG_PARAM } from "@/lib/apiUrl";

// 노드 상세 — 속성·수정일·본문 미리보기 (사이드패널)
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const kind = req.nextUrl.searchParams.get("kind") === "database" ? "database" : "page";
    // 속성 이름·대체 제목이 응답에 포함되므로 화면 언어를 함께 넘긴다
    const lang = pickLang(req.nextUrl.searchParams.get(LANG_PARAM));
    const r = await callNotion(req, (token) => fetchNodeDetail(token, id, kind, lang));
    if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 401 });
    return NextResponse.json(r.data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "unknown" }, { status: 502 });
  }
}
