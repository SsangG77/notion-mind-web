import ArticleShell from "@/components/ArticleShell";
import { DICT, langHref, type Lang } from "@/lib/i18n";
import LangToggle from "@/features/i18n/LangToggle";

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
  return (
    <ArticleShell
      lang={lang}
      langToggle={<LangToggle lang={lang} path={`/${page}`} />}
      nav={[
        { href: langHref(lang, "/guide"), label: t.guide, active: page === "guide" },
        { href: langHref(lang, "/faq"), label: t.faq, active: page === "faq" },
        { href: langHref(lang, "/pricing"), label: t.pricingTitle },
      ]}
      trailing={{ href: "/api/auth/login", label: t.startWithNotion }}
    >
      {children}
    </ArticleShell>
  );
}
