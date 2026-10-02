import ArticleShell from "@/components/ArticleShell";
import { DICT, LANG_LABEL, langHref, type Lang } from "@/lib/i18n";

/** 공개 문서(가이드, FAQ) — 주소의 언어를 따른다 */
export default function DocLayout({
  lang,
  page,
  children,
}: {
  lang: Lang;
  page: "guide" | "faq";
  children: React.ReactNode;
}) {
  const t = DICT[lang];
  const other: Lang = lang === "ko" ? "en" : "ko";
  return (
    <ArticleShell
      lang={lang}
      nav={[
        { href: langHref(lang, "/guide"), label: t.guide, active: page === "guide" },
        { href: langHref(lang, "/faq"), label: t.faq, active: page === "faq" },
        { href: langHref(lang, "/pricing"), label: t.pricingTitle },
        {
          href: langHref(other, `/${page}`),
          label: LANG_LABEL[other],
          testid: "doc_locale_switch",
        },
      ]}
      trailing={{ href: "/api/auth/login", label: t.startWithNotion }}
    >
      {children}
    </ArticleShell>
  );
}
