import { NextRequest, NextResponse } from "next/server";
import {
  DEV_COOKIE,
  DEV_COOKIE_OPTIONS,
  checkSecret,
  devModeConfigured,
  readDevPlan,
  sealDevCookie,
} from "@/lib/devMode";

// 개발 모드 열기(비밀번호), 요금제 바꾸기, 끄기. 환경변수가 없으면 존재하지 않는 것처럼 404.
export async function POST(req: NextRequest) {
  if (!devModeConfigured()) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as
    | { password?: unknown; plan?: unknown; action?: unknown }
    | null;
  if (!body) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const unlocked = readDevPlan(req.cookies.get(DEV_COOKIE)?.value) !== null;

  if (body.action === "lock") {
    const res = NextResponse.json({ ok: true, devMode: false });
    res.cookies.delete(DEV_COOKIE);
    return res;
  }

  // 이미 열려 있으면 비밀번호 없이 요금제만 바꾼다
  if (!unlocked) {
    if (typeof body.password !== "string" || !checkSecret(body.password)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // 잠금 해제만으로는 Pro 가 켜지지 않는다 — 설정 패널의 토글로 켠다
  const plan = body.plan === "pro" ? "pro" : "free";
  const res = NextResponse.json({ ok: true, devMode: true, plan });
  res.cookies.set(DEV_COOKIE, sealDevCookie(plan), DEV_COOKIE_OPTIONS);
  return res;
}
