import { timingSafeEqual } from "crypto";
import { decrypt, encrypt } from "./crypto";
import type { Plan } from "./billing";

/**
 * 개발 모드 — 구독 없이 Pro/Free 화면을 오가기 위한 장치(캡처·검증용).
 *
 * 안전 장치
 * - 잠금 해제는 서버에서만 판정하고, 비밀번호는 DEV_UNLOCK_SECRET 환경변수에만 둔다. 미설정이면 기능 자체가 꺼진다.
 * - 열쇠는 httpOnly 쿠키에 AES-GCM 으로 담아 브라우저에서 위조할 수 없게 한다(토큰과 같은 키를 씀).
 * - 만료를 쿠키 안에 같이 넣어 서버가 직접 확인한다. 쿠키 maxAge 만 믿지 않는다.
 */
export const DEV_COOKIE = "nm_dev";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface DevPayload {
  plan: Plan;
  exp: number;
}

export const devModeConfigured = (): boolean => !!process.env.DEV_UNLOCK_SECRET;

/** 입력한 비밀번호가 맞는지 — 길이 차이로도 새지 않게 상수 시간 비교 */
export function checkSecret(input: string): boolean {
  const secret = process.env.DEV_UNLOCK_SECRET;
  if (!secret) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function sealDevCookie(plan: Plan): string {
  return encrypt(JSON.stringify({ plan, exp: Date.now() + TTL_MS } satisfies DevPayload));
}

/** 쿠키에서 꺼낸 개발 모드 요금제. 꺼져 있거나 위조·만료면 null */
export function readDevPlan(cookieValue: string | undefined): Plan | null {
  if (!cookieValue || !devModeConfigured()) return null;
  try {
    const p = JSON.parse(decrypt(cookieValue)) as DevPayload;
    if (p.exp < Date.now()) return null;
    return p.plan === "pro" ? "pro" : "free";
  } catch {
    return null;
  }
}

export const DEV_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: TTL_MS / 1000,
  path: "/",
} as const;
