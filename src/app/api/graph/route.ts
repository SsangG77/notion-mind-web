import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto";
import { searchPage } from "@/lib/notion";

// 커서 단위 배치 응답 — 클라이언트가 반복 호출하며 그래프를 점진 조립
export async function GET(req: NextRequest) {
  const tokenCookie = req.cookies.get("nm_token")?.value;
  if (!tokenCookie) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
    const batch = await searchPage(decrypt(tokenCookie), cursor);
    return NextResponse.json(batch);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown" },
      { status: 502 },
    );
  }
}
