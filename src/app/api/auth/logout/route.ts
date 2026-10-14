import { NextRequest, NextResponse } from "next/server";
import { clearUid } from "@/lib/session";

// 로그아웃 — 계정 세션만 지운다. 노션 연결은 서버에 남아 다시 로그인하면 그대로 이어진다
export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url));
  clearUid(res);
  res.cookies.delete("nm_workspace");
  return res;
}
