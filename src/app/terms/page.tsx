import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import { currentLang } from "@/lib/lang.server";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import Ko from "@/content/legal/terms-of-service.mdx";
import En from "@/content/legal/eu/terms-of-service.mdx";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await currentLang(), "/terms");
}

export default async function Page() {
  const lang = await currentLang();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(lang, "/terms")) }}
      />
      <LegalLayout lang={lang} page="terms">
      {lang === "en" ? <En /> : <Ko />}
    </LegalLayout>
    </>
  );
}
