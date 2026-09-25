import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import Content from "@/content/legal/privacy-policy.mdx";

export const metadata: Metadata = { title: "개인정보 처리방침 — Notion-mind" };

export default function Page() {
  return (
    <LegalLayout locale="ko" page="privacy">
      <Content />
    </LegalLayout>
  );
}
