"use client";

import { DICT, type Lang } from "@/lib/i18n";
import { useLang } from "@/features/i18n/LangProvider";

/** 비제휴 고지. 법률 문서처럼 자체 로케일이 있는 화면은 lang 으로 덮어쓴다 */
export default function NotionDisclaimer({
  className = "",
  lang,
}: {
  className?: string;
  lang?: Lang;
}) {
  const appLang = useLang();
  return (
    <p
      data-testid="notion_disclaimer"
      className={`text-[11px] leading-relaxed text-[#91908C] ${className}`}
    >
      {DICT[lang ?? appLang].disclaimer}
    </p>
  );
}
