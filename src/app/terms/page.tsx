import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import Content from "@/content/legal/terms-of-service.mdx";

export const metadata: Metadata = { title: "이용약관 — Notion-mind" };

export default function Page() {
  return (
    <LegalLayout locale="ko" page="terms">
      <Content />
    </LegalLayout>
  );
}
