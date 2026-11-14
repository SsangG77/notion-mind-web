import type { Metadata } from "next";
import Image from "next/image";
import DocLayout from "@/components/DocLayout";
import CtaBlock from "@/components/CtaBlock";
import RelatedPosts from "@/components/RelatedPosts";
import { currentLang } from "@/lib/lang.server";
import { blogPostingJsonLd, breadcrumbJsonLd, pageMeta, postDate } from "@/lib/seo";
import { currentPlan } from "@/lib/plan.server";
import AdBanner from "@/components/AdBanner";
import Ko from "@/content/docs/notion-mind-map.ko.mdx";
import En from "@/content/docs/notion-mind-map.en.mdx";

const PATH = "/blog/notion-mind-map";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await currentLang(), PATH);
}

export default async function Page() {
  const lang = await currentLang();
  const { plan } = await currentPlan();
  // 글 본문의 <Cta /> 에 언어를 묶어 넘긴다 — MDX 자체는 언어를 모른다
  const components = {
    // 제목 아래에 공개일 — 읽는 사람이 최신인지 보고, 검색 쪽에도 신선도 표시가 된다
    h1: (p: { children?: React.ReactNode }) => (
      <>
        <h1 className="mb-1">{p.children}</h1>
        <p className="mt-0 text-xs text-[#91908C]">{postDate(lang, PATH)}</p>
      </>
    ),
    Cta: (p: { to: "demo" | "login" }) => <CtaBlock lang={lang} to={p.to} />,
    // 본문 이미지는 next/image 로 바꿔 끼운다 — 크기를 박지 않으면 로딩 중 글이 밀리고(CLS),
    // 이 그림이 화면 첫 장이라 LCP 대상이므로 지연 로딩을 걸지 않는다
    img: (p: { src: string; alt?: string; width?: string; height?: string }) => (
      <Image
        src={p.src}
        alt={p.alt ?? ""}
        width={Number(p.width ?? 992)}
        height={Number(p.height ?? 520)}
        priority
        sizes="(max-width: 760px) 100vw, 680px"
        className="h-auto w-full rounded-[8px] border border-[#E9E9E7] dark:border-[#2F2F2F]"
      />
    ),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(lang, PATH)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd(lang, PATH)) }}
      />
      <DocLayout lang={lang} page="blog" path={PATH} ad={plan === "free" ? <AdBanner /> : null}>
        {lang === "en" ? <En components={components} /> : <Ko components={components} />}
        <RelatedPosts lang={lang} current={PATH} />
      </DocLayout>
    </>
  );
}
