import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto";
import { fetchNodeDetail } from "@/lib/notion";

// 노드 상세 — 속성·수정일·본문 미리보기 (사이드패널)
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const tokenCookie = req.cookies.get("nm_token")?.value;
  if (!tokenCookie) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await ctx.params;
    const kind = req.nextUrl.searchParams.get("kind") === "database" ? "database" : "page";
    const detail = await fetchNodeDetail(decrypt(tokenCookie), id, kind);
    return NextResponse.json(detail);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown" },
      { status: 502 },
    );
  }
}
