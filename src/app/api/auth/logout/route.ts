import { NextRequest, NextResponse } from "next/server";

// 로그아웃 — 세션 쿠키 제거 후 로그인 화면으로
export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.delete("nm_token");
  res.cookies.delete("nm_workspace");
  return res;
}
