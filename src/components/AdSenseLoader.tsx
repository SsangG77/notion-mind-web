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
 * 동의 전에 막으면 CMP 자체가 안 뜬다. 우리 쿠키 배너는 그 외 지역용.
 *
 * 맞춤 광고는 동의한 사람에게만. 아직 답하지 않았거나 거부한 사람에게는 추적 없는 비맞춤 광고가 나간다.
 * ⚠️ 답하기 전에 pauseAdRequests 로 요청 자체를 막지 않는다 — 배너를 누르지 않는 방문자와 구글의 사이트
 * 점검 봇에게 광고 코드가 한 번도 동작하지 않아, 심사가 "준비 중"에서 안 넘어가고 수익도 0 이 된다.
 * ponytail: EEA 사용자는 두 창(우리 배너 + 구글 CMP)을 볼 수 있음 — EEA 트래픽 생기면 배너를 지역별로 분기.
 */
export default function AdSenseLoader() {
  useSyncExternalStore(subscribeBanner, isBannerOpen, isBannerOpenServer);
  const consent = typeof window !== "undefined" ? readCookieConsent() : null;

  useEffect(() => {
    const q = (window.adsbygoogle = window.adsbygoogle || []);
    q.pauseAdRequests = 0;
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
