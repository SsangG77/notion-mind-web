import { cookies, headers } from "next/headers";
import { LANG_COOKIE, pickLang, type Lang } from "./i18n";

/**
 * 이 요청의 화면 언어. 설정 패널에서 고른 쿠키가 1순위,
 * 아직 고른 적이 없으면 브라우저가 보낸 Accept-Language 로 정한다(서버에서 정하므로 깜빡임 없음).
 */
export async function currentLang(): Promise<Lang> {
  const chosen = (await cookies()).get(LANG_COOKIE)?.value;
  if (chosen) return pickLang(chosen);
  const accept = (await headers()).get("accept-language") ?? "";
  return accept.toLowerCase().startsWith("ko") ? "ko" : "en";
}
