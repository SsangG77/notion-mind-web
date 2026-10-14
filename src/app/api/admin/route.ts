import { NextRequest } from "next/server";
import { adminGate } from "@/lib/adminMode";
import { handleGateRequest } from "@/lib/gate";

// 대시보드 잠금 해제(비밀번호)와 잠금. DEV_UNLOCK_SECRET 미설정이면 404.
export async function POST(req: NextRequest) {
  return handleGateRequest(adminGate, req);
}
