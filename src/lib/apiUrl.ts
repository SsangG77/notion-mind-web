import type { Lang } from "./i18n";

// 화면이 어떤 상태로 그려졌으면 서버 호출도 같은 판정을 받아야 한다.
// 개발 모드는 주소의 dev 표시, 언어는 주소의 접두사에서 오므로 API 주소에 둘을 이어 붙인다.
export const DEV_PARAM = "dev";
export const LANG_PARAM = "lang";

export function currentDevParam(): string | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get(DEV_PARAM);
  return v === "pro" || v === "free" ? v : null;
}

/** API 주소에 현재 dev 표시와(주면) 언어를 붙인다 */
export function apiUrl(path: string, lang?: Lang): string {
  const params = new URLSearchParams();
  const dev = currentDevParam();
  if (dev) params.set(DEV_PARAM, dev);
  if (lang) params.set(LANG_PARAM, lang);
  const q = params.toString();
  if (!q) return path;
  return path + (path.includes("?") ? "&" : "?") + q;
}
