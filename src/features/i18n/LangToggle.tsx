"use client";

import { LANG_LABEL, LANGS, langHref, type Lang } from "@/lib/i18n";
import { goToLang } from "./setLang";

/**
 * 언어 전환 토글 — 설정 패널과 같은 모양. 로그인 전에도 쓰려고 분리했다.
 *
 * 링크가 아니라 버튼인 이유: 그냥 `<a href="/">` 로 두면 미들웨어가 "쿠키 없음 + 브라우저가 한국어"
 * 를 보고 다시 /ko 로 돌려보내서 영어로 못 간다. 고른 언어를 쿠키에 먼저 적어야 한다.
 */
export default function LangToggle({ lang, path = "/" }: { lang: Lang; path?: string }) {
  return (
    <span className="flex overflow-hidden rounded-md border border-[#E9E9E7] text-xs dark:border-[#2F2F2F]">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          data-testid={`home_lang_${l}_button`}
          aria-pressed={lang === l}
          onClick={() => goToLang(l, langHref(l, path))}
          className={`px-2.5 py-1 ${
            lang === l
              ? "bg-[#2383E2] font-semibold text-white"
              : "text-[#37352F] hover:bg-[#FDFDFC] dark:text-[#EDEDEC] dark:hover:bg-[#35342F]"
          }`}
        >
          {LANG_LABEL[l]}
        </button>
      ))}
    </span>
  );
}
