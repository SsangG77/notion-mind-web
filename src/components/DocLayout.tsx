import ArticleShell from "@/components/ArticleShell";

/** 공개 문서(가이드, FAQ) — 광고 심사와 검색 노출을 위한 텍스트 페이지 */
export default function DocLayout({ page, children }: { page: "guide" | "faq"; children: React.ReactNode }) {
  return (
    <ArticleShell
      nav={[
        { href: "/guide", label: "사용 가이드", active: page === "guide" },
        { href: "/faq", label: "자주 묻는 질문", active: page === "faq" },
        { href: "/pricing", label: "요금제" },
      ]}
      trailing={{ href: "/api/auth/login", label: "Notion으로 시작" }}
    >
      {children}
    </ArticleShell>
  );
}
