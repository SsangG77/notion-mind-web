import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import Content from "@/content/legal/privacy-policy.mdx";

export const metadata: Metadata = { title: "개인정보 처리방침 — Notion-mind" }; // i18n-allow: 한국어판 문서의 자체 제목

export default function Page() {
  return (
    <LegalLayout locale="ko" page="privacy">
      <Content />
    </LegalLayout>
  );
}
