"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import { isBannerOpen, isBannerOpenServer, readCookieConsent, subscribeBanner } from "./legal/cookieConsent";
import { ADSENSE_CLIENT } from "./adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number; pauseAdRequests?: number };
  }
}

/**
 * AdSense 스크립트 — 항상 로드. 구글 인증 CMP(EEA/UK/CH 접속자에게만 뜸)가 이 스크립트로 동의창을 띄우므로
 * 동의 전에 막으면 CMP 자체가 안 뜬다. 우리 쿠키 배너는 그 외 지역용: 거부하면 비맞춤 광고, 답 전엔 광고 요청 정지.
 * ponytail: EEA 사용자는 두 창(우리 배너 + 구글 CMP)을 볼 수 있음 — EEA 트래픽 생기면 배너를 지역별로 분기.
 */
export default function AdSenseLoader() {
  useSyncExternalStore(subscribeBanner, isBannerOpen, isBannerOpenServer);
  const consent = typeof window !== "undefined" ? readCookieConsent() : null;

  useEffect(() => {
    const q = (window.adsbygoogle = window.adsbygoogle || []);
    q.pauseAdRequests = consent === null ? 1 : 0;
    q.requestNonPersonalizedAds = consent === "accepted" ? 0 : 1;
  }, [consent]);

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
