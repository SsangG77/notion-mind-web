"use client";

import { useSyncExternalStore } from "react";
import { useLang, useT } from "@/features/i18n/LangProvider";
import { legalPath } from "@/lib/i18n";
import Link from "next/link";
import { BLOCK } from "@/components/blockStyle";
import {
  isBannerOpen,
  isBannerOpenServer,
  subscribeBanner,
  writeCookieConsent,
  type CookieConsent,
} from "./cookieConsent";

/**
 * 광고 쿠키 동의 배너 — 앱 전역 하나. 첫 방문에만 뜨고, 약관 페이지의 "쿠키 설정"으로 다시 열림.
 * 거부 버튼이 동의 버튼과 같은 크기(EDPB 지침).
 */
export default function CookieBanner() {
  const open = useSyncExternalStore(subscribeBanner, isBannerOpen, isBannerOpenServer);
  const t = useT();
  const lang = useLang();

  if (!open) return null;
  const choose = (v: CookieConsent) => writeCookieConsent(v);

  return (
    <div
      data-testid="cookie_banner"
      role="dialog"
      aria-live="polite"
      className={`${BLOCK} fixed bottom-16 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[520px] -translate-x-1/2 flex-col gap-3 p-4 text-[12px] leading-relaxed`}
    >
      <p>
        {t.cookieBody}{" "}
        <Link href={legalPath(lang, "privacy")} className="text-[#2383E2] underline">
          {t.privacy}
        </Link>
      </p>
      <div className="flex gap-2">
        <button
          data-testid="cookie_reject_button"
          onClick={() => choose("rejected")}
          className="flex-1 rounded-md border border-[#2E2C27] py-1.5 text-xs font-semibold hover:bg-[#F4F3EF] dark:border-[#8D8A83] dark:hover:bg-[#35342F]"
        >
          {t.cookieReject}
        </button>
        <button
          data-testid="cookie_accept_button"
          onClick={() => choose("accepted")}
          className="flex-1 rounded-md bg-[#2383E2] py-1.5 text-xs font-semibold text-white hover:bg-[#1b74cb]"
        >
          {t.cookieAccept}
        </button>
      </div>
    </div>
  );
}
