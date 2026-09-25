import Link from "next/link";
import NotionDisclaimer from "@/components/NotionDisclaimer";
import CookieSettingsLink from "./CookieSettingsLink";

type Locale = "ko" | "en";

const NAV: Record<Locale, { privacy: string; terms: string; other: string; otherHref: (p: "privacy" | "terms") => string; cookies: string }> = {
  ko: {
    privacy: "개인정보 처리방침",
    terms: "이용약관",
    other: "English (EU)",
    otherHref: (p) => `/eu/${p}`,
    cookies: "쿠키 설정",
  },
  en: {
    privacy: "Privacy Notice",
    terms: "Terms of Service",
    other: "한국어",
    otherHref: (p) => `/${p}`,
    cookies: "Cookie settings",
  },
};

/** 법률 문서 공통 틀 — 노드 박스 스타일 카드 안에 prose 본문, 상단 언어/문서 전환, 하단 쿠키 설정 */
export default function LegalLayout({
  locale,
  page,
  children,
}: {
  locale: Locale;
  page: "privacy" | "terms";
  children: React.ReactNode;
}) {
  const t = NAV[locale];
  const base = locale === "ko" ? "" : "/eu";
  return (
    <div className="nm-dotgrid min-h-screen bg-white px-4 py-10 text-[#37352F] dark:bg-[#191919] dark:text-[#EDEDEC]">
      <article className="mx-auto max-w-[760px] rounded-[10px] border-[1.5px] border-[#2E2C27] bg-[#FDFDFC] px-6 py-8 shadow-[5px_5px_0_#2E2C27] sm:px-10 dark:border-black dark:bg-[#2B2A27] dark:shadow-[5px_5px_0_#000]">
        <nav className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#91908C]">
          <Link href="/" className="font-semibold text-[#37352F] dark:text-[#EDEDEC]">
            Notion-mind
          </Link>
          <Link href={`${base}/privacy`} className={page === "privacy" ? "text-[#2383E2]" : ""}>
            {t.privacy}
          </Link>
          <Link href={`${base}/terms`} className={page === "terms" ? "text-[#2383E2]" : ""}>
            {t.terms}
          </Link>
          <Link href={t.otherHref(page)} className="ml-auto" data-testid="legal_locale_switch">
            {t.other}
          </Link>
        </nav>
        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-[#2383E2] prose-table:text-[12px] dark:prose-invert">
          {children}
        </div>
        <footer className="mt-10 border-t border-[#E9E9E7] pt-4 text-xs text-[#91908C] dark:border-[#2F2F2F]">
          <CookieSettingsLink label={t.cookies} />
          <NotionDisclaimer className="mt-3" />
        </footer>
      </article>
    </div>
  );
}
