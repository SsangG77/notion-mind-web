import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import { currentLang } from "@/lib/lang.server";
import Ko from "@/content/legal/terms-of-service.mdx";
import En from "@/content/legal/eu/terms-of-service.mdx";

// 두 벌을 모두 import 하고 주소의 언어로 고른다 — MDX 는 정적 import 만 가능
export async function generateMetadata(): Promise<Metadata> {
  const lang = await currentLang();
  return { title: lang === "en" ? "Terms of Service — Notion-mind" : "이용약관 — Notion-mind" }; // i18n-allow: 바로 위에서 언어로 갈라짐
}

export default async function Page() {
  const lang = await currentLang();
  return (
    <LegalLayout lang={lang} page="terms">
      {lang === "en" ? <En /> : <Ko />}
    </LegalLayout>
  );
}
