import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import { currentLang } from "@/lib/lang.server";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import Ko from "@/content/legal/privacy-policy.mdx";
import En from "@/content/legal/eu/privacy-notice.mdx";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await currentLang(), "/privacy");
}

export default async function Page() {
  const lang = await currentLang();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(lang, "/privacy")) }}
      />
      <LegalLayout lang={lang} page="privacy">
      {lang === "en" ? <En /> : <Ko />}
    </LegalLayout>
    </>
  );
}
