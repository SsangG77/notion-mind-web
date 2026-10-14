import type { Plan } from "./billing";
import { createGate } from "./gate";

/**
 * 개발 모드 — 구독 없이 Pro/Free 화면을 오가기 위한 장치(캡처, 검증용).
 *
 * 두 가지가 모두 있어야 적용된다.
 * 1. 쿠키 nm_dev — "비밀번호를 안다"는 증명. /dev 에서 받는다
 * 2. 주소의 ?dev=pro 또는 ?dev=free — 이 요청에 적용하라는 표시
 *
 * 그래서 링크를 타고 나가 파라미터가 떨어지면 그 즉시 일반 모드로 돌아간다.
 * 쿠키만으로는 아무것도 바뀌지 않는다. 비밀번호 검증과 쿠키 봉인은 lib/gate.ts 공용.
 */
export const DEV_PARAM = "dev";

export const devGate = createGate({
  env: "DEV_UNLOCK_SECRET",
  cookie: "nm_dev",
  ttlMs: 7 * 24 * 60 * 60 * 1000,
});

export const DEV_COOKIE = devGate.cookie;
export const devModeConfigured = devGate.configured;
/** 쿠키가 우리가 발급한 것이고 아직 안 만료됐는지 */
export const isUnlocked = devGate.isUnlocked;

/** 주소의 dev 파라미터가 가리키는 요금제. 없거나 이상하면 null */
export function planFromParam(value: string | null | undefined): Plan | null {
  if (value === "pro") return "pro";
  if (value === "free") return "free";
  return null;
}
