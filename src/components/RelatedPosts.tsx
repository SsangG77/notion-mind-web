import Link from "next/link";
import { BLOG_POSTS, metaOf, type PublicPath } from "@/lib/seo";
import { DICT, langHref, type Lang } from "@/lib/i18n";

/**
 * 글 끝의 다른 글 목록 — 글끼리 서로 엮는다. 링크가 걸린 글을 구글이 더 빨리 찾아가고,
 * 읽은 사람이 다음 글로 넘어간다. 목록은 `BLOG_POSTS` 에서 오므로 새 글은 자동으로 들어온다.
 */
export default function RelatedPosts({ lang, current }: { lang: Lang; current: PublicPath }) {
  const others = BLOG_POSTS.filter((p) => p.path !== current);
  if (others.length === 0) return null;
  return (
    <div className="not-prose mt-10 border-t border-[#E9E9E7] pt-5 dark:border-[#2F2F2F]">
      <p className="m-0 text-xs font-semibold text-[#91908C]">{DICT[lang].relatedPosts}</p>
      <ul className="mt-2 space-y-1">
        {others.map(({ path }) => (
          <li key={path}>
            <Link href={langHref(lang, path)} className="text-sm text-[#2383E2] hover:underline">
              {metaOf(lang, path).title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
