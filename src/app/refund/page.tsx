import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import Content from "@/content/legal/refund-policy.mdx";

export const metadata: Metadata = { title: "환불정책 — Notion-mind" };

export default function Page() {
  return (
    <LegalLayout locale="ko" page="refund">
      <Content />
    </LegalLayout>
  );
}
