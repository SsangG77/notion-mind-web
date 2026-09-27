"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import { isBannerOpen, isBannerOpenServer, readCookieConsent, subscribeBanner } from "./legal/cookieConsent";
import { ADSENSE_CLIENT } from "./adsense";

/**
 * AdSense 스크립트 — 쿠키 배너에서 "동의"한 뒤에만 로드(EU 옵트인). 거부하면 광고 자리엔 플레이스홀더만 남음.
 * 동의 상태는 배너 스토어를 구독해 배너를 닫는 즉시 반영. Pro 는 상위에서 아예 렌더 안 함.
 */
export default function AdSenseLoader() {
  // 배너 열림 여부를 구독해서 동의 직후 리렌더 — 실제 판단은 readCookieConsent
  useSyncExternalStore(subscribeBanner, isBannerOpen, isBannerOpenServer);
  const accepted = typeof window !== "undefined" && readCookieConsent() === "accepted";
  if (!accepted) return null;
  return (
    <Script
      id="adsbygoogle-js"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
