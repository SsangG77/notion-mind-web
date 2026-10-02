import type { Metadata } from "next";
import DocLayout from "@/components/DocLayout";
import { currentLang } from "@/lib/lang.server";
import Ko from "@/content/docs/guide.ko.mdx";
import En from "@/content/docs/guide.en.mdx";

// 두 벌을 모두 import 하고 언어로 고른다 — MDX 는 정적 import 만 가능
export async function generateMetadata(): Promise<Metadata> {
  const lang = await currentLang();
  return lang === "en"
    ? { title: "Guide — Notion-mind", description: "From signing in to moving around the graph, hiding and pinning, the detail panel and plans" }
    : { title: "사용 가이드 — Notion-mind", description: "Notion-mind 로그인부터 그래프 조작, 숨기기와 핀, 상세 패널, 요금제까지" }; // i18n-allow: 한국어판 문서의 제목, 바로 위 줄에서 언어로 갈라짐
}

export default async function Page() {
  const lang = await currentLang();
  return (
    <DocLayout lang={lang} page="guide">
      {lang === "en" ? <En /> : <Ko />}
    </DocLayout>
  );
}
