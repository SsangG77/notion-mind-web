import { NextRequest, NextResponse } from "next/server";
import { getPlan } from "@/lib/billing";

// 결제 직후 클라이언트가 폴링해 Pro 반영 여부 확인 (웹훅은 수 초 뒤 도착)
export async function GET(req: NextRequest) {
  const workspaceId = req.cookies.get("nm_ws")?.value;
  if (!workspaceId) return NextResponse.json({ plan: "free" });
  return NextResponse.json({ plan: await getPlan(workspaceId) });
}
