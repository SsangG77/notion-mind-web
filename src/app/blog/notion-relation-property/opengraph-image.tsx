import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/ogCard";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Notion relation property vs rollup — Notion-mind";

export default function OpengraphImage() {
  return ogCard({ title: "Notion relation property vs rollup", subtitle: "Notion-mind" });
}
