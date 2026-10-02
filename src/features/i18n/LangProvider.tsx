"use client";

import { createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DICT, LANG_COOKIE, langHref, type Dict, type Lang } from "@/lib/i18n";

const LangContext = createContext<Lang>("en");

/** 앱 전역 언어. 서버(layout)가 주소에서 읽어 내려주고, 클라이언트 컴포넌트는 useT 로 꺼내 쓴다 */
export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = (): Lang => useContext(LangContext);
export const useT = (): Dict => DICT[useContext(LangContext)];

/**
 * 언어 전환 — 같은 화면의 다른 언어 주소로 이동한다. 주소가 언어를 정하므로 쿠키로는 바꿀 수 없다.
 * 쿠키는 "직접 골랐다"는 표시로만 남겨, 다음에 루트로 들어와도 자동 이동에 끌려가지 않게 한다.
 */
export function useSetLang() {
  const router = useRouter();
  const pathname = usePathname();
  return (next: Lang) => {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.push(langHref(next, pathname));
  };
}
