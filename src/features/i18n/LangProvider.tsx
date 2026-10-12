"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { DICT, langHref, type Dict, type Lang } from "@/lib/i18n";
import { goToLang } from "./setLang";

const LangContext = createContext<Lang>("en");

/** 앱 전역 언어. 서버(layout)가 주소에서 읽어 내려주고, 클라이언트 컴포넌트는 useT 로 꺼내 쓴다 */
export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = (): Lang => useContext(LangContext);
export const useT = (): Dict => DICT[useContext(LangContext)];

/** 언어 전환 — 같은 화면의 다른 언어 주소로. 이유는 goToLang 주석 참고 */
export function useSetLang() {
  const pathname = usePathname();
  return (next: Lang) => goToLang(next, langHref(next, pathname));
}
