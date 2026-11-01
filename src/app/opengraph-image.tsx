import { ogCard, OG_SIZE, OG_TYPE } from "@/lib/ogCard";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Notion-mind — graph view for your Notion workspace";

export default function OpengraphImage() {
  return ogCard({
    title: "Notion-mind",
    subtitle: "Your Notion workspace as one connected graph",
  });
}
