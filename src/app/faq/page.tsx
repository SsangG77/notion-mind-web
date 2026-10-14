import type { Metadata } from "next";
import DocLayout from "@/components/DocLayout";
import { currentLang } from "@/lib/lang.server";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { currentPlan } from "@/lib/plan.server";
import AdBanner from "@/components/AdBanner";
import Ko from "@/content/docs/faq.ko.mdx";
import En from "@/content/docs/faq.en.mdx";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await currentLang(), "/faq");
}

export default async function Page() {
  const lang = await currentLang();
  // 로그인 전 방문자는 Pro 가 아니므로 광고가 보인다 — 공개 페이지가 광고 심사 대상이다
  const { plan } = await currentPlan();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(lang, "/faq")) }}
      />
      <DocLayout lang={lang} page="faq" ad={plan === "free" ? <AdBanner /> : null}>
      {lang === "en" ? <En /> : <Ko />}
    </DocLayout>
    </>
  );
}
