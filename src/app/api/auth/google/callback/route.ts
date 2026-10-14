import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/google";
import { getConnection, upsertUser } from "@/lib/accounts";
import { writeUid } from "@/lib/session";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const saved = req.cookies.get("nm_google_state")?.value;

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/?error=${encodeURIComponent(reason)}`, url.origin));

  if (url.searchParams.get("error")) return fail("access_denied");
  if (!code || !state || !saved || state !== saved) return fail("invalid_state");

  try {
    const user = await exchangeGoogleCode(code);
    await upsertUser(user.sub, user.email);
    // 노션을 이미 연결한 계정이면 바로 그래프로. 아니면 노션 연결을 한 번 받는다
    const connected = await getConnection(user.sub);
    const res = NextResponse.redirect(
      new URL(connected ? "/graph" : "/api/auth/login", url.origin),
    );
    res.cookies.delete("nm_google_state");
    writeUid(res, user.sub);
    if (connected) {
      // 요금제와 결제는 워크스페이스 id 로 묶여 있다 — 새 기기에서도 같은 값을 깔아 준다
      const year = { sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" };
      res.cookies.set("nm_ws", connected.workspaceId, { ...year, httpOnly: true });
      if (connected.workspaceName) res.cookies.set("nm_workspace", connected.workspaceName, year);
    }
    return res;
  } catch (e) {
    console.error("google callback failed:", e);
    return fail("google_login_failed");
  }
}
