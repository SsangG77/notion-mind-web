import type { Metadata } from "next";
import DocLayout from "@/components/DocLayout";
import { currentLang } from "@/lib/lang.server";
import Ko from "@/content/docs/faq.ko.mdx";
import En from "@/content/docs/faq.en.mdx";

// 두 벌을 모두 import 하고 언어로 고른다 — MDX 는 정적 import 만 가능
export async function generateMetadata(): Promise<Metadata> {
  const lang = await currentLang();
  return lang === "en"
    ? { title: "FAQ — Notion-mind", description: "Questions and answers about the service, permissions, the graph, pricing and privacy" }
    : { title: "자주 묻는 질문 — Notion-mind", description: "Notion-mind 서비스, 권한, 그래프, 요금과 결제, 개인정보에 대한 질문과 답" };
}

export default async function Page() {
  const lang = await currentLang();
  return (
    <DocLayout lang={lang} page="faq">
      {lang === "en" ? <En /> : <Ko />}
    </DocLayout>
  );
}
