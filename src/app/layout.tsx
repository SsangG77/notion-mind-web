import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/legal/CookieBanner";
import AdSenseLoader from "@/components/AdSenseLoader";
import { ADSENSE_CLIENT } from "@/components/adsense";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notion-mind",
  description: "노션 워크스페이스를 그래프로 보는 웹 앱",
  // AdSense 사이트 소유 확인용 메타 태그 — 스크립트는 쿠키 동의 후에만 붙어서 크롤러가 못 보므로 이걸로 확인
  other: { "google-adsense-account": ADSENSE_CLIENT },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieBanner />
        <AdSenseLoader />
      </body>
    </html>
  );
}
