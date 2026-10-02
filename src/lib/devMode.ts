import { timingSafeEqual } from "crypto";
import { decrypt, encrypt } from "./crypto";
import type { Plan } from "./billing";

/**
 * 개발 모드 — 구독 없이 Pro/Free 화면을 오가기 위한 장치(캡처, 검증용).
 *
 * 두 가지가 모두 있어야 적용된다.
 * 1. 쿠키 nm_dev — "비밀번호를 안다"는 증명. /dev 에서 받는다
 * 2. 주소의 ?dev=pro 또는 ?dev=free — 이 요청에 적용하라는 표시
 *
 * 그래서 링크를 타고 나가 파라미터가 떨어지면 그 즉시 일반 모드로 돌아간다.
 * 쿠키만으로는 아무것도 바뀌지 않는다.
 *
 * 안전 장치
 * - 비밀번호는 DEV_UNLOCK_SECRET 환경변수에만 둔다. 미설정이면 기능 자체가 꺼진다.
 * - 쿠키는 AES-GCM 으로 봉인(토큰과 같은 키)하고 만료를 안에 넣어 서버가 직접 검사한다.
 */
export const DEV_COOKIE = "nm_dev";
export const DEV_PARAM = "dev";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

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

export function sealDevCookie(): string {
  return encrypt(JSON.stringify({ exp: Date.now() + TTL_MS }));
}

/** 쿠키가 우리가 발급한 것이고 아직 안 만료됐는지 */
export function isUnlocked(cookieValue: string | undefined): boolean {
  if (!cookieValue || !devModeConfigured()) return false;
  try {
    const { exp } = JSON.parse(decrypt(cookieValue)) as { exp: number };
    return exp > Date.now();
  } catch {
    return false;
  }
}

/** 주소의 dev 파라미터가 가리키는 요금제. 없거나 이상하면 null */
export function planFromParam(value: string | null | undefined): Plan | null {
  if (value === "pro") return "pro";
  if (value === "free") return "free";
  return null;
}

export const DEV_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: TTL_MS / 1000,
  path: "/",
} as const;
