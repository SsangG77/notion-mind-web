import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";
import { countAccessibleItems } from "@/lib/notion";

// 슬라이스 1: OAuth tracer-bullet 확인 화면.
// 확정 디자인(중앙 입체 노드 + 배경 블러 노드)은 슬라이스 2에서 적용.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const jar = await cookies();
  const tokenCookie = jar.get("nm_token")?.value;
  const workspace = jar.get("nm_workspace")?.value;

  let counts: { pages: number; databases: number } | null = null;
  let apiError: string | null = null;
  if (tokenCookie) {
    try {
      counts = await countAccessibleItems(decrypt(tokenCookie));
    } catch (e) {
      apiError = e instanceof Error ? e.message : "unknown";
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-xl font-semibold text-[#37352F]">Notion-mind</h1>

        {!tokenCookie && (
          <>
            <a
              href="/api/auth/login"
              className="rounded-lg bg-[#2383E2] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Notion으로 계속하기
            </a>
            <p className="text-sm text-[#91908C]">
              노션 계정으로 로그인합니다 — 별도 가입 없음
            </p>
          </>
        )}

        {tokenCookie && counts && (
          <p className="text-sm text-[#37352F]">
            {workspace ? `${workspace} — ` : ""}페이지 {counts.pages.toLocaleString()}개 ·
            데이터베이스 {counts.databases.toLocaleString()}개 연결됨
          </p>
        )}

        {(error || apiError) && (
          <p className="rounded-lg border border-[#E9E9E7] bg-[#F7F6F3] px-4 py-2 text-sm text-[#37352F]">
            연결에 실패했습니다: {error ?? apiError}
          </p>
        )}
      </div>
    </main>
  );
}
