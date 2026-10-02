"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { DICT, LANG_COOKIE, type Dict, type Lang } from "@/lib/i18n";

const LangContext = createContext<Lang>("ko");

/** 앱 전역 언어. 서버(layout)에서 쿠키를 읽어 내려주고, 클라이언트 컴포넌트는 useT 로 꺼내 쓴다 */
export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = (): Lang => useContext(LangContext);
export const useT = (): Dict => DICT[useContext(LangContext)];

/** 언어 전환 — 쿠키에 적고 서버 컴포넌트까지 다시 그린다 */
export function useSetLang() {
  const router = useRouter();
  return (next: Lang) => {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  };
}
