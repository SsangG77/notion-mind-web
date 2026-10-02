import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import Content from "@/content/legal/refund-policy.mdx";

export const metadata: Metadata = { title: "환불정책 — Notion-mind" }; // i18n-allow: 한국어판 문서의 자체 제목

export default function Page() {
  return (
    <LegalLayout locale="ko" page="refund">
      <Content />
    </LegalLayout>
  );
}
