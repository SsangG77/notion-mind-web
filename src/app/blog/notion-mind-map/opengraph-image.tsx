import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/ogCard";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Does Notion have mind maps? — Notion-mind";

// 글마다 제목이 들어간 카드 — 외부에 올릴 때 홈 링크와 구별되게
export default function OpengraphImage() {
  return ogCard({
    title: "Does Notion have mind maps?",
    subtitle: "Notion-mind",
  });
}
