import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/ogCard";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Notion second brain: where it stalls — Notion-mind";

export default function OpengraphImage() {
  return ogCard({ title: "Notion second brain: where it stalls", subtitle: "Notion-mind" });
}
