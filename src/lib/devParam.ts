// 클라이언트에서 dev 파라미터를 읽고 API 호출에 그대로 이어 붙인다.
// 화면이 개발 모드로 그려졌으면 서버 호출도 같은 판정을 받아야 하기 때문(노드 상한, 설정 저장 등).
export const DEV_PARAM = "dev";

export function currentDevParam(): string | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get(DEV_PARAM);
  return v === "pro" || v === "free" ? v : null;
}

/** API 주소에 현재 dev 파라미터를 붙인다. 없으면 그대로 */
export function withDev(url: string): string {
  const v = currentDevParam();
  if (!v) return url;
  return url + (url.includes("?") ? "&" : "?") + `${DEV_PARAM}=${v}`;
}
