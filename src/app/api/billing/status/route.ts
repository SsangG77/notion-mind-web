import { NextRequest, NextResponse } from "next/server";
import { planFor } from "@/lib/plan.server";

// 결제 직후 클라이언트가 폴링해 Pro 반영 여부 확인 (웹훅은 수 초 뒤 도착)
export async function GET(req: NextRequest) {
  // 워크스페이스 쿠키가 없어도 planFor 가 free 로 답한다 — 개발 모드를 가리지 않도록 조기 반환하지 않는다
  return NextResponse.json({ plan: await planFor(req) });
}
