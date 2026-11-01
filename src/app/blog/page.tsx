import type { Metadata } from "next";
import Link from "next/link";
import DocLayout from "@/components/DocLayout";
import { currentLang } from "@/lib/lang.server";
import { langHref } from "@/lib/i18n";
import { BLOG_POSTS, metaOf, pageMeta, postDate } from "@/lib/seo";
import { currentPlan } from "@/lib/plan.server";
import AdBanner from "@/components/AdBanner";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await currentLang(), "/blog");
}

export default async function Page() {
  const lang = await currentLang();
  const { plan } = await currentPlan();
  const list = metaOf(lang, "/blog");
  return (
    <DocLayout lang={lang} page="blogIndex" path="/blog" ad={plan === "free" ? <AdBanner /> : null}>
      <h1>{list.title}</h1>
      <p>{list.description}</p>
      <ul className="not-prose mt-8 space-y-4">
        {BLOG_POSTS.map(({ path }) => {
          const m = metaOf(lang, path);
          return (
            <li key={path}>
              {/* 제목 말고 칸 전체가 눌리게 — 링크가 요약까지 감싼다 */}
              <Link
                href={langHref(lang, path)}
                className="block rounded-[8px] border border-[#E9E9E7] px-4 py-3 no-underline hover:border-[#2E2C27] hover:bg-[#F7F6F3] dark:border-[#2F2F2F] dark:hover:border-black dark:hover:bg-[#202020]"
              >
                <span className="font-semibold text-[#2383E2]">{m.title}</span>
                <span className="mt-0.5 block text-xs text-[#91908C]">{postDate(lang, path)}</span>
                <span className="mt-1 block text-sm leading-relaxed text-[#5F5E5A] dark:text-[#B8B7B2]">
                  {m.description}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </DocLayout>
  );
}
