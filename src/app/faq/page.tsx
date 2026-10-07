import type { Metadata } from "next";
import DocLayout from "@/components/DocLayout";
import { currentLang } from "@/lib/lang.server";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import Ko from "@/content/docs/faq.ko.mdx";
import En from "@/content/docs/faq.en.mdx";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await currentLang(), "/faq");
}

export default async function Page() {
  const lang = await currentLang();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(lang, "/faq")) }}
      />
      <DocLayout lang={lang} page="faq">
      {lang === "en" ? <En /> : <Ko />}
    </DocLayout>
    </>
  );
}
