"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { BLOCK } from "@/components/blockStyle";
import {
  isBannerOpen,
  isBannerOpenServer,
  subscribeBanner,
  writeCookieConsent,
  type CookieConsent,
} from "./cookieConsent";

const TEXT = {
  ko: {
    body: "Free 이용자에게 광고를 보여주기 위해 광고 쿠키를 사용합니다. 로그인 등 필수 쿠키는 동의 없이 항상 사용됩니다.",
    accept: "동의",
    reject: "거부",
    more: "개인정보 처리방침",
    href: "/privacy",
  },
  en: {
    body: "We use advertising cookies to show ads to Free users. Strictly necessary cookies (sign-in) are always used.",
    accept: "Accept",
    reject: "Reject",
    more: "Privacy Notice",
    href: "/eu/privacy",
  },
} as const;

/**
 * 광고 쿠키 동의 배너 — 앱 전역 하나. 첫 방문에만 뜨고, 약관 페이지의 "쿠키 설정"으로 다시 열림.
 * 거부 버튼이 동의 버튼과 같은 크기(EDPB 지침). 언어는 브라우저 언어로 결정.
 */
export default function CookieBanner() {
  const open = useSyncExternalStore(subscribeBanner, isBannerOpen, isBannerOpenServer);
  // 서버 스냅샷은 닫힘이라 여기 도달하면 항상 브라우저
  const lang = typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en";

  if (!open) return null;
  const t = TEXT[lang];
  const choose = (v: CookieConsent) => writeCookieConsent(v);

  return (
    <div
      data-testid="cookie_banner"
      role="dialog"
      aria-live="polite"
      className={`${BLOCK} fixed bottom-16 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[520px] -translate-x-1/2 flex-col gap-3 p-4 text-[12px] leading-relaxed`}
    >
      <p>
        {t.body}{" "}
        <Link href={t.href} className="text-[#2383E2] underline">
          {t.more}
        </Link>
      </p>
      <div className="flex gap-2">
        <button
          data-testid="cookie_reject_button"
          onClick={() => choose("rejected")}
          className="flex-1 rounded-md border border-[#2E2C27] py-1.5 text-xs font-semibold hover:bg-[#F4F3EF] dark:border-[#8D8A83] dark:hover:bg-[#35342F]"
        >
          {t.reject}
        </button>
        <button
          data-testid="cookie_accept_button"
          onClick={() => choose("accepted")}
          className="flex-1 rounded-md bg-[#2383E2] py-1.5 text-xs font-semibold text-white hover:bg-[#1b74cb]"
        >
          {t.accept}
        </button>
      </div>
    </div>
  );
}
