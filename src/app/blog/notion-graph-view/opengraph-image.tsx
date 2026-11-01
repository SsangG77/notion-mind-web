import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/ogCard";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Does Notion have a graph view? — Notion-mind";

export default function OpengraphImage() {
  return ogCard({ title: "Does Notion have a graph view?", subtitle: "Notion-mind" });
}
