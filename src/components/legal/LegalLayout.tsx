import ArticleShell from "@/components/ArticleShell";
import CookieSettingsLink from "./CookieSettingsLink";
import { langHref, type Lang } from "@/lib/i18n";
import LangToggle from "@/features/i18n/LangToggle";

type Page = "privacy" | "terms" | "refund";

const NAV: Record<Lang, { privacy: string; terms: string; refund: string; cookies: string }> = {
  ko: {
    privacy: "개인정보 처리방침", // i18n-allow: 한국어판 문서의 자체 라벨
    terms: "이용약관", // i18n-allow: 한국어판 문서의 자체 라벨
    refund: "환불정책", // i18n-allow: 한국어판 문서의 자체 라벨
    cookies: "쿠키 설정", // i18n-allow: 한국어판 문서의 자체 라벨
  },
  en: {
    privacy: "Privacy Notice",
    terms: "Terms of Service",
    refund: "Refund Policy",
    cookies: "Cookie settings",
  },
};

/** 법률 문서 — 공통 틀(ArticleShell) + 문서 간 이동, 언어 전환, 쿠키 설정 */
export default function LegalLayout({
  lang,
  page,
  children,
}: {
  lang: Lang;
  page: Page;
  children: React.ReactNode;
}) {
  const t = NAV[lang];
  const href = (p: Page) => langHref(lang, `/${p}`);
  return (
    <ArticleShell
      lang={lang}
      langToggle={<LangToggle lang={lang} path={`/${page}`} />}
      nav={[
        { href: href("privacy"), label: t.privacy, active: page === "privacy" },
        { href: href("terms"), label: t.terms, active: page === "terms" },
        { href: href("refund"), label: t.refund, active: page === "refund" },
      ]}
      footer={<CookieSettingsLink label={t.cookies} />}
    >
      {children}
    </ArticleShell>
  );
}
