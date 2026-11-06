import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/ogCard";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Building a knowledge graph in Notion — Notion-mind";

export default function OpengraphImage() {
  return ogCard({ title: "Building a knowledge graph in Notion", subtitle: "Notion-mind" });
}
