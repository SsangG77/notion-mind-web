import type { Metadata } from "next";
import DocLayout from "@/components/DocLayout";
import Content from "@/content/docs/faq.mdx";

export const metadata: Metadata = { title: "자주 묻는 질문 — Notion-mind", description: "Notion-mind 서비스, 권한, 그래프, 요금과 결제, 개인정보에 대한 질문과 답" };

export default function Page() {
  return (
    <DocLayout page="faq">
      <Content />
    </DocLayout>
  );
}
