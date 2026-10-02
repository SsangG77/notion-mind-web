import { headers } from "next/headers";
import { LANG_HEADER, pickLang, type Lang } from "./i18n";

/**
 * 이 요청의 화면 언어. 주소가 유일한 기준이다 — middleware 가 `/ko/*` 를 보고 헤더에 심어 주고,
 * 접두사가 없으면 영어다. 쿠키는 더 이상 내용을 결정하지 않는다(루트 자동 이동 판단에만 쓰임).
 */
export async function currentLang(): Promise<Lang> {
  return pickLang((await headers()).get(LANG_HEADER));
}
