import { createGate } from "./gate";

/**
 * 관리자 대시보드(/admin) 잠금. 비밀번호는 개발 모드와 같은 DEV_UNLOCK_SECRET.
 * 쿠키는 따로(nm_admin, 24시간) — 개발 모드를 열었다고 대시보드까지 열리지 않게.
 * 미설정이면 /admin 은 404.
 */
export const adminGate = createGate({
  env: "DEV_UNLOCK_SECRET",
  cookie: "nm_admin",
  ttlMs: 24 * 60 * 60 * 1000,
});
