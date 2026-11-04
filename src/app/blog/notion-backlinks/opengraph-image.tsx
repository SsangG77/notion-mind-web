import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/ogCard";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Notion backlinks: where they show, and why they sometimes don't — Notion-mind";

export default function OpengraphImage() {
  return ogCard({ title: "Notion backlinks: where they show", subtitle: "Notion-mind" });
}
