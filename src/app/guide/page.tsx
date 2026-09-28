import type { Metadata } from "next";
import DocLayout from "@/components/DocLayout";
import Content from "@/content/docs/guide.mdx";

export const metadata: Metadata = { title: "사용 가이드 — Notion-mind", description: "Notion-mind 로그인부터 그래프 조작, 숨기기와 핀, 상세 패널, 요금제까지" };

export default function Page() {
  return (
    <DocLayout page="guide">
      <Content />
    </DocLayout>
  );
}
