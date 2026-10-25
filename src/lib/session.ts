import type { NextResponse } from "next/server";
import { decrypt, encrypt } from "./crypto";

/**
 * 로그인 세션 — 이제 담는 건 노션 토큰이 아니라 "누구인지"(구글 계정 id) 뿐이다.
 * 노션 토큰은 서버(notion_connections)에 있으므로, 이 쿠키만 있으면 어느 기기에서든 바로 들어간다.
 */
export const UID_COOKIE = "nm_uid";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

const base = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_MAX_AGE,
  path: "/",
} as const;

export function writeUid(res: NextResponse, userId: string) {
  res.cookies.set(UID_COOKIE, encrypt(userId, "session"), base);
}

export function clearUid(res: NextResponse) {
  res.cookies.delete(UID_COOKIE);
}

/** 쿠키에서 계정 id 를 꺼낸다. 봉인이 깨졌으면(키 교체, 위조) null */
export function readUid(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  try {
    // legacy: 용도 표시가 없던 옛 쿠키도 받는다 — 거부하면 로그인된 사람이 전부 튕긴다
    return decrypt(cookieValue, "session", { legacy: true });
  } catch {
    return null;
  }
}
