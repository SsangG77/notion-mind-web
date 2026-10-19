import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { decrypt, encrypt } from "./crypto";

/**
 * 비밀번호 잠금 게이트 — /dev(개발 모드)와 /admin(대시보드)이 같은 방식으로 쓴다.
 *
 * - 비밀번호는 환경변수에만 둔다. 미설정이면 게이트 자체가 꺼진다(경로가 404).
 * - 통과 증명은 AES-GCM 으로 봉인한 쿠키(토큰과 같은 키). 만료를 안에 넣어 서버가 직접 검사한다.
 * - ⚠️ 봉인 안에 **용도(쿠키 이름)** 도 넣고 검증 때 대조한다. 만료만 담으면 두 게이트의 봉인이
 *   서로 통과해(`nm_dev` 값을 `nm_admin` 자리에 넣으면 대시보드가 열림) 각자의 유효기간과
 *   잠금이 자기 화면만 지배하지 못한다.
 * - 비교는 상수 시간 — 길이 차이로도 새지 않게.
 */
export interface Gate {
  cookie: string;
  configured(): boolean;
  check(input: string): boolean;
  seal(): string;
  isUnlocked(cookieValue: string | undefined): boolean;
  cookieOptions: {
    httpOnly: true;
    sameSite: "lax";
    secure: boolean;
    maxAge: number;
    path: "/";
  };
}

export function createGate(opts: { env: string; cookie: string; ttlMs: number }): Gate {
  const secretOf = () => process.env[opts.env];
  return {
    cookie: opts.cookie,
    configured: () => !!secretOf(),
    check(input) {
      const secret = secretOf();
      if (!secret) return false;
      const a = Buffer.from(input);
      const b = Buffer.from(secret);
      if (a.length !== b.length) return false;
      return timingSafeEqual(a, b);
    },
    seal: () => encrypt(JSON.stringify({ p: opts.cookie, exp: Date.now() + opts.ttlMs })),
    isUnlocked(cookieValue) {
      if (!cookieValue || !secretOf()) return false;
      try {
        const { p, exp } = JSON.parse(decrypt(cookieValue)) as { p?: unknown; exp?: unknown };
        if (p !== opts.cookie) return false; // 다른 게이트의 봉인은 받지 않는다
        return typeof exp === "number" && exp > Date.now();
      } catch {
        return false;
      }
    },
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: opts.ttlMs / 1000,
      path: "/",
    },
  };
}

/** 잠금 해제(비밀번호 확인)와 잠금(쿠키 삭제) 요청 처리 — 라우트 핸들러가 그대로 반환 */
export async function handleGateRequest(gate: Gate, req: Request): Promise<Response> {
  if (!gate.configured()) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { password?: unknown; action?: unknown } | null;
  if (!body) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  if (body.action === "lock") {
    const res = NextResponse.json({ ok: true, unlocked: false });
    res.cookies.delete(gate.cookie);
    return res;
  }
  if (typeof body.password !== "string" || !gate.check(body.password)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, unlocked: true });
  res.cookies.set(gate.cookie, gate.seal(), gate.cookieOptions);
  return res;
}
