import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/legal/CookieBanner";
import AdSenseLoader from "@/components/AdSenseLoader";
import { ADSENSE_CLIENT } from "@/components/adsense";
import { LangProvider } from "@/features/i18n/LangProvider";
import { currentLang } from "@/lib/lang.server";
import { SITE_NAME, SITE_URL, organizationJsonLd } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 상대 주소를 절대 주소로 바꾸는 기준. canonical 과 OG 주소가 이걸 쓴다
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { template: `%s — ${SITE_NAME}`, default: SITE_NAME },
  // AdSense 사이트 소유 확인용 메타 태그
  other: { "google-adsense-account": ADSENSE_CLIENT },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // 화면 언어 — 설정에서 고른 쿠키, 없으면 브라우저 언어
  const lang = await currentLang();
  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <LangProvider lang={lang}>
          {children}
          <CookieBanner />
          <AdSenseLoader />
        </LangProvider>
      </body>
    </html>
  );
}
