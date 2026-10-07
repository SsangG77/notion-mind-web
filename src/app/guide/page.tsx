import type { Metadata } from "next";
import DocLayout from "@/components/DocLayout";
import { currentLang } from "@/lib/lang.server";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import Ko from "@/content/docs/guide.ko.mdx";
import En from "@/content/docs/guide.en.mdx";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await currentLang(), "/guide");
}

export default async function Page() {
  const lang = await currentLang();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(lang, "/guide")) }}
      />
      <DocLayout lang={lang} page="guide">
      {lang === "en" ? <En /> : <Ko />}
    </DocLayout>
    </>
  );
}
