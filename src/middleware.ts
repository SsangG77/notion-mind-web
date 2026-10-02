import { NextRequest, NextResponse } from "next/server";
import { LANG_COOKIE, LANG_HEADER, LANG_PREFIX } from "@/lib/i18n";

/**
 * 언어를 주소로 가른다 — 접두사 없는 주소는 영어, `/ko/*` 는 한국어.
 *
 * 페이지 파일을 두 벌 만들지 않는다. `/ko/guide` 는 접두사를 떼고 `/guide` 로 rewrite 하고
 * 언어는 요청 헤더로 넘긴다. 주소가 유일한 기준이라 같은 내용이 두 주소에 생기지 않는다.
 *
 * 루트에 한국어 브라우저로 처음 들어오면 `/ko` 로 보낸다. Googlebot 은 Accept-Language 를
 * 아예 보내지 않으므로(구글 공식 문서) 이 분기에 걸리지 않고 항상 영어를 본다 — UA 를 보고
 * 가르는 것이 아니라서 클로킹도 아니다. 언어를 직접 고른 사람(쿠키 있음)은 보내지 않는다.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === LANG_PREFIX || pathname.startsWith(`${LANG_PREFIX}/`)) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(LANG_PREFIX.length) || "/";
    const headers = new Headers(req.headers);
    headers.set(LANG_HEADER, "ko");
    return NextResponse.rewrite(url, { request: { headers } });
  }

  if (
    pathname === "/" &&
    !req.cookies.get(LANG_COOKIE) &&
    (req.headers.get("accept-language") ?? "").toLowerCase().startsWith("ko")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = LANG_PREFIX;
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  // API, 정적 파일, 이미지 최적화는 언어와 무관하므로 건너뛴다
  matcher: ["/((?!api/|_next/|.*\\.[a-z0-9]+$).*)"],
};
