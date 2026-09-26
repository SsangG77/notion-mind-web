import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import Content from "@/content/legal/eu/refund-policy.mdx";

export const metadata: Metadata = { title: "Refund Policy — Notion-mind" };

export default function Page() {
  return (
    <LegalLayout locale="en" page="refund">
      <Content />
    </LegalLayout>
  );
}
