import ArticleShell from "@/components/ArticleShell";
import { DICT, langHref, type Lang } from "@/lib/i18n";
import LangToggle from "@/features/i18n/LangToggle";

/** 공개 문서(가이드, FAQ) — 주소의 언어를 따른다 */
export default function DocLayout({
  lang,
  page,
  path = `/${page}`,
  children,
  ad,
}: {
  lang: Lang;
  page: "guide" | "faq" | "blog" | "blogIndex";
  /** 언어 전환이 가리킬 주소 — 블로그 글은 이름이 각각이라 직접 넘긴다 */
  path?: string;
  children: React.ReactNode;
  /** Free 에게 보여줄 하단 광고 — 로그인 전 방문자도 포함 */
  ad?: React.ReactNode;
}) {
  const t = DICT[lang];
  const blog = page === "blog"; // 글 본문만 — 나가는 길을 본문 버튼 둘로 제한한다
  return (
    <ArticleShell
      lang={lang}
      langToggle={<LangToggle lang={lang} path={path} />}
      // 검색어 글은 메뉴를 안 둔다 — 나가는 길은 본문 유도 버튼 둘로 제한한다.
      // 목록으로 돌아가는 링크 하나만 남긴다(글만 읽고 끝나면 다음 글로 갈 데가 없다)
      nav={
        blog
          ? [{ href: langHref(lang, "/blog"), label: `← ${t.blogNav}` }]
          : [
              { href: `${langHref(lang, "/")}#demo`, label: t.demo },
              { href: langHref(lang, "/guide"), label: t.guide, active: page === "guide" },
              { href: langHref(lang, "/faq"), label: t.faq, active: page === "faq" },
              { href: langHref(lang, "/blog"), label: t.blogNav, active: page === "blogIndex" },
              { href: langHref(lang, "/pricing"), label: t.pricingTitle },
            ]
      }
      trailing={blog ? undefined : { href: "/api/auth/google", label: t.continueWithGoogle }}
    >
      {children}
      {ad}
    </ArticleShell>
  );
}
