import Link from "next/link";
import NotionDisclaimer from "@/components/NotionDisclaimer";
import type { Lang } from "@/lib/i18n";
import { langHref } from "@/lib/i18n";

export interface ShellLink {
  href: string;
  label: string;
  active?: boolean;
  testid?: string;
}

/** 긴 글 공통 틀 — 노드 박스 카드 안에 prose 본문. 약관, 가이드, FAQ 가 같이 씀 */
export default function ArticleShell({
  lang,
  nav,
  trailing,
  footer,
  children,
}: {
  /** 이 문서의 언어 — 앱 UI 언어와 별개 */
  lang: Lang;
  nav: ShellLink[];
  /** 내비 오른쪽 끝 링크(언어 전환 등) */
  trailing?: ShellLink;
  /** 푸터 첫 줄(쿠키 설정 등) */
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="nm-dotgrid min-h-screen bg-white px-4 py-10 text-[#37352F] dark:bg-[#191919] dark:text-[#EDEDEC]">
      <article className="mx-auto max-w-[760px] rounded-[10px] border-[1.5px] border-[#2E2C27] bg-[#FDFDFC] px-6 py-8 shadow-[5px_5px_0_#2E2C27] sm:px-10 dark:border-black dark:bg-[#2B2A27] dark:shadow-[5px_5px_0_#000]">
        <nav className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#91908C]">
          <Link href={langHref(lang, "/")} className="font-semibold text-[#37352F] dark:text-[#EDEDEC]">
            Notion-mind
          </Link>
          {nav.map((l) => (
            <Link key={l.href} href={l.href} className={l.active ? "text-[#2383E2]" : ""} data-testid={l.testid}>
              {l.label}
            </Link>
          ))}
          {trailing && (
            <Link href={trailing.href} className="ml-auto" data-testid={trailing.testid}>
              {trailing.label}
            </Link>
          )}
        </nav>
        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-[#2383E2] prose-table:text-[12px] dark:prose-invert">
          {children}
        </div>
        <footer className="mt-10 border-t border-[#E9E9E7] pt-4 text-xs text-[#91908C] dark:border-[#2F2F2F]">
          {footer}
          <NotionDisclaimer className={footer ? "mt-3" : ""} lang={lang} />
        </footer>
      </article>
    </div>
  );
}
