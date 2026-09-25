// 광고 쿠키 동의 상태 — EU 옵트인 기준. 필수 쿠키는 동의 대상 아님.
// 저장은 localStorage(뷰어 브라우저 한정). 광고 스크립트는 "accepted"일 때만 로드해야 한다.
// 배너 표시 여부는 외부 스토어(useSyncExternalStore)로 구독 — SSR 스냅샷은 항상 "닫힘"
export type CookieConsent = "accepted" | "rejected";

const KEY = "nm_cookie_consent";
const listeners = new Set<() => void>();
let forceOpen = false;

export function readCookieConsent(): CookieConsent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

export function writeCookieConsent(v: CookieConsent) {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* 사설 창 등 — 저장 실패해도 동작 */
  }
  forceOpen = false;
  listeners.forEach((l) => l());
}

/** 약관 페이지 하단 "쿠키 설정" 링크가 배너를 다시 연다 */
export function openCookieSettings() {
  forceOpen = true;
  listeners.forEach((l) => l());
}

export function subscribeBanner(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
export const isBannerOpen = () => forceOpen || readCookieConsent() === null;
export const isBannerOpenServer = () => false;
