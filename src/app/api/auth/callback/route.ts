import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/notion";
import { encrypt } from "@/lib/crypto";
import { touchWorkspace } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = req.cookies.get("nm_oauth_state")?.value;

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/?error=${encodeURIComponent(reason)}`, url.origin));

  if (url.searchParams.get("error")) return fail("access_denied");
  if (!code || !state || !savedState || state !== savedState) return fail("invalid_state");

  try {
    const token = await exchangeCode(code);
    // 가입(첫 접속)과 마지막 접속 기록 — 실패해도 로그인은 계속
    await touchWorkspace(token.workspace_id, token.workspace_name).catch((e) =>
      console.error("touchWorkspace failed:", e),
    );
    const res = NextResponse.redirect(new URL("/", url.origin));
    res.cookies.delete("nm_oauth_state");
    // 워크스페이스 ID = 요금제(구독) 키. 서버만 읽음
    res.cookies.set("nm_ws", token.workspace_id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    res.cookies.set("nm_token", encrypt(token.access_token), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    if (token.workspace_name) {
      res.cookies.set("nm_workspace", token.workspace_name, {
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }
    return res;
  } catch {
    return fail("token_exchange_failed");
  }
}
