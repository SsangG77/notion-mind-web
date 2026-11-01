import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/ogCard";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Notion vs Obsidian: the graph view gap — Notion-mind";

export default function OpengraphImage() {
  return ogCard({ title: "Notion vs Obsidian: the graph view gap", subtitle: "Notion-mind" });
}
