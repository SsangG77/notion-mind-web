import { NextRequest, NextResponse } from "next/server";
import {
  DEV_COOKIE,
  DEV_COOKIE_OPTIONS,
  checkSecret,
  devModeConfigured,
  sealDevCookie,
} from "@/lib/devMode";

// 비밀번호 확인(열기)과 해제(끄기)만 한다. 어느 요금제로 볼지는 주소의 dev 파라미터가 정한다.
// 환경변수가 없으면 이 경로는 존재하지 않는 것처럼 404.
export async function POST(req: NextRequest) {
  if (!devModeConfigured()) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as
    | { password?: unknown; action?: unknown }
    | null;
  if (!body) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  if (body.action === "lock") {
    const res = NextResponse.json({ ok: true, unlocked: false });
    res.cookies.delete(DEV_COOKIE);
    return res;
  }

  if (typeof body.password !== "string" || !checkSecret(body.password)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, unlocked: true });
  res.cookies.set(DEV_COOKIE, sealDevCookie(), DEV_COOKIE_OPTIONS);
  return res;
}
