import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import Content from "@/content/legal/eu/privacy-notice.mdx";

export const metadata: Metadata = { title: "Privacy Notice — Notion-mind" };

export default function Page() {
  return (
    <LegalLayout locale="en" page="privacy">
      <Content />
    </LegalLayout>
  );
}
