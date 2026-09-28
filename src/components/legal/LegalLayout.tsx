import ArticleShell from "@/components/ArticleShell";
import CookieSettingsLink from "./CookieSettingsLink";

type Locale = "ko" | "en";
type Page = "privacy" | "terms" | "refund";

const NAV: Record<Locale, { privacy: string; terms: string; refund: string; other: string; otherHref: (p: Page) => string; cookies: string }> = {
  ko: {
    privacy: "개인정보 처리방침",
    terms: "이용약관",
    refund: "환불정책",
    other: "English (EU)",
    otherHref: (p) => `/eu/${p}`,
    cookies: "쿠키 설정",
  },
  en: {
    privacy: "Privacy Notice",
    terms: "Terms of Service",
    refund: "Refund Policy",
    other: "한국어",
    otherHref: (p) => `/${p}`,
    cookies: "Cookie settings",
  },
};

/** 법률 문서 — 공통 틀(ArticleShell) + 문서 간 이동, 언어 전환, 쿠키 설정 */
export default function LegalLayout({
  locale,
  page,
  children,
}: {
  locale: Locale;
  page: Page;
  children: React.ReactNode;
}) {
  const t = NAV[locale];
  const base = locale === "ko" ? "" : "/eu";
  return (
    <ArticleShell
      nav={[
        { href: `${base}/privacy`, label: t.privacy, active: page === "privacy" },
        { href: `${base}/terms`, label: t.terms, active: page === "terms" },
        { href: `${base}/refund`, label: t.refund, active: page === "refund" },
      ]}
      trailing={{ href: t.otherHref(page), label: t.other, testid: "legal_locale_switch" }}
      footer={<CookieSettingsLink label={t.cookies} />}
    >
      {children}
    </ArticleShell>
  );
}
