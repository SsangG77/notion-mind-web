import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import { currentLang } from "@/lib/lang.server";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import Ko from "@/content/legal/refund-policy.mdx";
import En from "@/content/legal/eu/refund-policy.mdx";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await currentLang(), "/refund");
}

export default async function Page() {
  const lang = await currentLang();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(lang, "/refund")) }}
      />
      <LegalLayout lang={lang} page="refund">
      {lang === "en" ? <En /> : <Ko />}
    </LegalLayout>
    </>
  );
}
