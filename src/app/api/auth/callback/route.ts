import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/notion";
import { saveConnection } from "@/lib/accounts";
import { readUid, UID_COOKIE } from "@/lib/session";
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

  // 노션 연결은 계정에 매단다 — 구글 로그인이 먼저다
  const userId = readUid(req.cookies.get(UID_COOKIE)?.value);
  if (!userId) return fail("sign_in_first");

  try {
    const token = await exchangeCode(code);
    await saveConnection(userId, token);
    // 가입(첫 접속)과 마지막 접속 기록 — 실패해도 로그인은 계속
    await touchWorkspace(token.workspace_id, token.workspace_name).catch((e) =>
      console.error("touchWorkspace failed:", e),
    );
    const res = NextResponse.redirect(new URL("/graph", url.origin));
    res.cookies.delete("nm_oauth_state");
    res.cookies.set("nm_ws", token.workspace_id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    // 워크스페이스 이름은 화면이 읽어야 해서 httpOnly 가 아니다
    if (token.workspace_name) {
      res.cookies.set("nm_workspace", token.workspace_name, {
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
    return res;
  } catch (e) {
    console.error("notion callback failed:", e);
    return fail("token_exchange_failed");
  }
}
