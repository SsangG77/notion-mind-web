import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/ogCard";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Posts — Notion-mind";

export default function OpengraphImage() {
  return ogCard({ title: "Posts", subtitle: "Notion-mind" });
}
