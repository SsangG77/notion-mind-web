import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/ogCard";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "How to make a mind map in Notion — Notion-mind";

export default function OpengraphImage() {
  return ogCard({ title: "How to make a mind map in Notion", subtitle: "Notion-mind" });
}
