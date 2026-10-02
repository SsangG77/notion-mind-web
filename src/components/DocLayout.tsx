import ArticleShell from "@/components/ArticleShell";
import { DICT, type Lang } from "@/lib/i18n";

/** 공개 문서(가이드, FAQ) — 설정 패널에서 고른 언어를 따른다 */
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
      nav={[
        { href: "/guide", label: t.guide, active: page === "guide" },
        { href: "/faq", label: t.faq, active: page === "faq" },
        { href: "/pricing", label: t.pricingTitle },
      ]}
      trailing={{ href: "/api/auth/login", label: t.startWithNotion }}
    >
      {children}
    </ArticleShell>
  );
}
