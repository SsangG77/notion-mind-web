import { LANG_COOKIE, type Lang } from "@/lib/i18n";

/**
 * 고른 언어로 이동한다.
 *
 * 쿠키를 먼저 적는 이유: 안 적으면 루트(/)로 갈 때 미들웨어가 브라우저 언어를 보고 /ko 로 되돌린다.
 * 쿠키는 "직접 골랐다"는 표시라, 그 뒤로는 자동 이동에 끌려가지 않는다.
 *
 * 전체 로드로 가는 이유: 언어는 루트 레이아웃이 읽어 내려주는데 클라이언트 이동으로는 그게 다시
 * 안 그려진다. 게다가 /api/graph 와 /api/node 가 언어별 문구를 서버에서 만들어 보내므로
 * 데이터도 새 언어로 다시 받아야 한다.
 */
export function goToLang(next: Lang, href: string) {
  document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  window.location.assign(href);
}
