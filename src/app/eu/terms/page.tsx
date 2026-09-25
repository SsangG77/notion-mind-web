import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import Content from "@/content/legal/eu/terms-of-service.mdx";

export const metadata: Metadata = { title: "Terms of Service — Notion-mind" };

export default function Page() {
  return (
    <LegalLayout locale="en" page="terms">
      <Content />
    </LegalLayout>
  );
}
