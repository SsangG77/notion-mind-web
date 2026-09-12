import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 화면 1. 로그인 — 디자인 탭 확정: 중앙 대형 DB형 입체 노드 + 블러 배경 노드 + 도트 그리드
const dotGrid = {
  backgroundImage: "radial-gradient(#E9E9E7 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

// 배경 장식 노드 — 불규칙 클러스터(2·3·4개) + 고립 노드, % 좌표
const bgNodes: Array<{ x: number; y: number; label: string; db?: boolean }> = [
  // 클러스터 A (좌상)
  { x: 12, y: 18, label: "Projects", db: true },
  { x: 22, y: 26, label: "App v2" },
  { x: 8, y: 32, label: "Roadmap" },
  // 클러스터 B (우중)
  { x: 84, y: 30, label: "Clients", db: true },
  { x: 76, y: 42, label: "Acme Co" },
  // 클러스터 C (하단)
  { x: 26, y: 74, label: "Meeting Notes", db: true },
  { x: 16, y: 84, label: "Kickoff" },
  { x: 36, y: 86, label: "Design QA" },
  { x: 40, y: 70, label: "Retro" },
  // 고립 노드
  { x: 64, y: 80, label: "Inbox" },
  { x: 52, y: 12, label: "Ideas" },
];
const bgLines: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [3, 4],
  [5, 6],
  [5, 7],
  [5, 8],
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const jar = await cookies();
  if (jar.get("nm_token")?.value) redirect("/graph");

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white"
      style={dotGrid}
    >
      {/* 배경 그래프 (장식 — 클릭 요소 아님) */}
      <div aria-hidden className="absolute inset-0 opacity-50 blur-[2px]">
        <svg className="absolute inset-0 h-full w-full">
          {bgLines.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={`${bgNodes[a].x}%`}
              y1={`${bgNodes[a].y}%`}
              x2={`${bgNodes[b].x}%`}
              y2={`${bgNodes[b].y}%`}
              stroke="#C9C7C1"
              strokeWidth="1.3"
            />
          ))}
        </svg>
        {bgNodes.map((n) => (
          <span
            key={n.label}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-[6px] border border-[#2E2C27] px-2.5 py-1 text-[9px] text-[#37352F] shadow-[3px_3px_0_#2E2C27] ${
              n.db ? "bg-[#F4F3EF] font-semibold" : "bg-[#FDFDFC]"
            }`}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            {n.label}
          </span>
        ))}
      </div>

      {/* 중앙 대형 노드 */}
      <div className="relative flex flex-col items-center gap-5 rounded-[10px] border-[1.5px] border-[#2E2C27] bg-[#F4F3EF] px-14 py-12 shadow-[5px_5px_0_#2E2C27]">
        <h1 className="text-2xl font-bold tracking-tight text-[#37352F]">Notion-mind</h1>
        <a
          href="/api/auth/login"
          data-testid="login_notion_button"
          className="rounded-lg bg-[#2383E2] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1b74cb]"
        >
          Notion으로 계속하기
        </a>
        <p className="text-sm text-[#91908C]">노션 계정으로 로그인합니다 — 별도 가입 없음</p>
        {error && (
          <p className="rounded-lg border border-[#E9E9E7] bg-white px-4 py-2 text-sm text-[#37352F]">
            연결에 실패했습니다: {error}
          </p>
        )}
      </div>
    </main>
  );
}
